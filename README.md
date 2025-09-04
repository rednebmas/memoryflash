# MemoryFlash

MemoryFlash is an interactive practice tool for musicians. It presents flashcards that drill chords, intervals, and progressions while tracking your progress over time. The project includes a web client, a backend API, and an iOS companion app.

[Try it live](https://mflash.riker.tech/).

## Features

- 📚 **Flashcard Training** – Study musical concepts through automatically generated cards and decks.
- 🎹 **MIDI Input** – Connect a MIDI keyboard for answering card prompts directly from your instrument.
- 🔁 **Spaced Repetition** – Cards are scheduled based on your performance so you can focus on what needs work.
- 📱 **Cross‑Platform** – React web app, Node.js server, and an iOS client keep practice sessions in sync across devices.

## Getting Started

1. **Install dependencies**

```bash
yarn install
```

2. **Choose a development host**

```bash
./scripts/switch-dev-host.sh [localhost|wifi]
```

3. **Start the app**

```bash
yarn dev
```

When testing on a mobile device using the `sd-mbpr.local` host, enable the following Chrome flag:
`chrome://flags/#unsafely-treat-insecure-origin-as-secure`

## Testing

Run the full test suite:

```bash
yarn test
```

For CI-equivalent checks use:

```bash
yarn test:codex
```

## Contributing

Pull requests are welcome! Please keep components small, avoid duplication, format changes with Prettier, and run `yarn test:codex` before submitting.

## License

Released under the MIT License.
