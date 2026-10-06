export type MidiActionKey = 'restartCard' | 'toggleMetronome';

export type MidiActionKeys = Record<MidiActionKey, number | null>;

export const MIDI_ACTION_LABELS: Record<MidiActionKey, string> = {
	restartCard: 'Restart card',
	toggleMetronome: 'Start/stop metronome',
};

export const MIDI_ACTIONS = Object.keys(MIDI_ACTION_LABELS) as MidiActionKey[];

export const DEFAULT_MIDI_ACTION_KEYS: MidiActionKeys = {
	restartCard: null,
	toggleMetronome: 25,
};

export const midiActionForNote = (keys: MidiActionKeys, note: number) =>
	MIDI_ACTIONS.find((action) => keys[action] === note);
