/** Click slots are eighth notes within the bar: 0 = beat 1, 1 = its "&", 2 = beat 2, … */
export const MAX_CLICK_SLOT = 31;

export type ClickSound = 'accent' | 'beat';

const slotCount = (beatsPerBar: number) => beatsPerBar * 2;

export const clickSlots = (beatsPerBar: number) =>
	Array.from({ length: slotCount(beatsPerBar) }, (_, slot) => ({
		slot,
		label: slot % 2 ? '&' : String(slot / 2 + 1),
	}));

export const enabledClicks = (clicks: number[] | undefined, beatsPerBar: number) =>
	clickSlots(beatsPerBar)
		.map(({ slot }) => slot)
		.filter((slot) => (clicks ? clicks.includes(slot) : slot % 2 === 0));

export const toggleClick = (enabled: number[], slot: number) =>
	enabled.includes(slot)
		? enabled.filter((s) => s !== slot)
		: [...enabled, slot].sort((a, b) => a - b);

export const clickSound = (clicks: number[], slot: number): ClickSound | undefined => {
	if (!clicks.includes(slot)) return undefined;
	return slot === 0 ? 'accent' : 'beat';
};
