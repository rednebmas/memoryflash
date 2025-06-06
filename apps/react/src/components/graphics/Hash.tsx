export const Hash = (props: { color?: string }) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="21"
			height="21"
			fill="none"
			viewBox="0 0 21 21"
		>
			<path
				stroke={props.color ? props.color : '#28374C'}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M3.833 8h13.334M3.833 13h13.334M8.833 3L7.167 18M13.833 3l-1.666 15"
			></path>
		</svg>
	);
};
