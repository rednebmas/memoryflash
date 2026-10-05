/** Toggles `item` in `selected`, keeping the order of `all`. */
export const toggleInOrder = <T>(all: readonly T[], selected: T[], item: T): T[] =>
	all.filter((x) => (x === item ? !selected.includes(x) : selected.includes(x)));
