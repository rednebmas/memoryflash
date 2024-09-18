import React from 'react';

let idCounter = 0;

export function useUniqueId(prefix: string) {
	const [id] = React.useState(() => {
		idCounter += 1;
		return `${prefix}-${idCounter}`;
	});

	return id;
}
