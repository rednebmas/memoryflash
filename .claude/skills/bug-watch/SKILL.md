---
name: bug-watch
description: Full-auto bug fixing. Watches prod Mongo for new MemoryFlash bug reports and dispatches one Opus subagent per report to fix, test, push to main (deploy) and mark it shipped. Use when Sam says /bug-watch, "watch for bugs", or "/bug-watch launch <id>" / "/bug-watch list".
---

# bug-watch — orchestrator

You are the orchestrator. You never fix bugs yourself: you watch, dispatch, relay. Keep your own context lean — do not read agent transcripts or code.

All paths below are relative to the repo root of THIS checkout (`git rev-parse --show-toplevel`); call them by absolute path.
- `.claude/skills/bug-watch/reports.sh` — task-state CLI (prod Mongo): `watch | list [statuses…] | claim <id> | show <id> | query <collection> '<EJSON filter>' [limit] | comment <id> <text> | set-status <id> <status> [sha]`. `query` is read-only prod access; reading prod data is strongly recommended for every bug report, and agents are told to do it.
- Agents save manual-test screenshots to `../memoryflash-worktrees/_evidence/<id>/` so they survive the worktree sweep.
- `.claude/skills/bug-watch/start-task.sh <id>` — sweeps merged worktrees, creates `../memoryflash-worktrees/<id>` on `task/<id>` from origin/main, installs deps, renders the agent prompt; its LAST stdout line is the prompt file path.

## Preconditions (check once, stop and tell Sam if any fail)
1. `apps/server/.env.autofix` exists in the primary checkout with the prod `MONGO_URI` (reports.sh errors clearly if not).
2. The session runs with permissions bypassed (`claude --dangerously-skip-permissions`) — subagents run yarn, git and the sandbox-hostile MongoMemoryServer unattended. If Bash calls need `dangerouslyDisableSandbox`, pass it.
3. `gh auth status` succeeds (finish-task.sh watches deploy runs).

## Arguments
- no args → start watching (below).
- `list` → run `reports.sh list` and show it as a short table. Non-admin reports appear here; they are never auto-dispatched.
- `launch <id>` → dispatch that report now (any report, including non-admin), then keep watching if the watcher is running.

## Watch loop
1. **Startup check:** `reports.sh list building` — any report already `building` has no live agent (a previous orchestrator died). Tell Sam which, and re-dispatch each with the Dispatch steps but skip `claim` (it's already claimed; start-task.sh reuses an existing worktree).
2. **Arm the watcher:** Monitor commands run sandboxed and cannot reach prod Mongo (they fail silently), so split it in two. First, Bash with `run_in_background: true` and `dangerouslyDisableSandbox: true`: `<abs>/.claude/skills/bug-watch/reports.sh watch > <scratchpad>/watch.log 2>&1`. Then `Monitor` with `command: "tail -n +1 -F <scratchpad>/watch.log"`, `description: "new MemoryFlash bug reports"`, `timeout_ms: 1800000`. Only reports with `admin: true` (reporter email in prod `ADMIN_EMAILS`, set in `.github/workflows/deploy-server.yml`) appear. On startup it prints every admin report still `new` (backlog), then one JSON line per newly filed admin report: `{"id","email","status","text"}`. A line starting `watch error` or a non-zero exit means the change stream dropped. **Whenever the monitor expires, re-arm the `tail` Monitor; if the background watcher exits, restart it too (truncating the log)** — the backlog sweep on each start guarantees nothing is missed. Dedupe by id against reports you have already dispatched or queued.
3. **Concurrency:** at most 3 agents running. Extra reports wait in your queue (FIFO); dispatch the next one whenever an agent finishes.

## Dispatch (per report id)
1. `reports.sh claim <id>` — if it fails, the report was already claimed; skip it.
2. `start-task.sh <id>` (use `dangerouslyDisableSandbox`, timeout 600000) → take the last line as `PROMPT_PATH`. If it fails, `reports.sh set-status <id> failed`, `reports.sh comment <id> "<error>"`, tell Sam, move on.
3. `Agent` with `subagent_type: "general-purpose"`, `model: "opus"`, `name: "bug-<first 6 chars of id>"`, `description: "Fix bug <first 6 chars>"`, and prompt exactly:
   `Read <PROMPT_PATH> in full with the Read tool and follow it exactly — it is your complete task. Work only inside the worktree it names.`
   It runs in the background; you are notified when it finishes.
4. Tell Sam one line: `🛠 dispatched <id6>: <text>`.

## When an agent finishes
1. Relay its final message to Sam verbatim (it is written for him).
2. `reports.sh list building` — if this report is still `building`, the agent stopped without landing or closing it: `reports.sh set-status <id> failed` and `reports.sh comment <id> "Agent ended without finishing"`.
3. `PushNotification` (under 200 chars): the agent's Verdict sentence, prefixed `🚀` if shipped, `⚠️` if failed / proposed-close.
4. Dispatch the next queued report, if any.

## Sam's messages while watching
If Sam replies about a specific task, forward it with `SendMessage` to that agent's name (`bug-<id6>`); if the agent already finished, dispatch a fresh one: `reports.sh comment <id> "<Sam's feedback>"`, `reports.sh set-status <id> new`, then Dispatch it again (the comment is included in the new prompt). "Close <id>" means `reports.sh set-status <id> wont-fix`.
