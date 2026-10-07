export { diagnostics } from 'MemoryFlashCore/src/lib/diagnosticLog';

export const errorMessage = (e: Error | string | object) =>
	e instanceof Error ? `${e.name}: ${e.message}` : String(e);
