export const Note = (props: { color?: string }) => {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			width='25'
			height='24'
			fill='none'
			viewBox='0 0 25 24'>
			<path
				stroke={props.color ? props.color : '#28374C'}
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth='2'
				d='M8.5 22a4 4 0 100-8 4 4 0 000 8z'></path>
			<path
				stroke={props.color ? props.color : '#28374C'}
				strokeLinecap='round'
				strokeLinejoin='round'
				strokeWidth='2'
				d='M12.5 18V2l7 4'></path>
		</svg>
	);
};
