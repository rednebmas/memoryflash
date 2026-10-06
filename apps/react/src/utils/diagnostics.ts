import { createDiagnosticLog } from 'MemoryFlashCore/src/lib/diagnosticLog';

export const diagnostics = createDiagnosticLog(20, () => performance.now());

export const errorMessage = (e: Error | string | object) =>
	e instanceof Error ? `${e.name}: ${e.message}` : String(e);
