import { useUniqueId } from '../../utils/useUniqueId';

export const BlackKey: React.FC<{
	startColor: string;
	endColor: string;
}> = ({ startColor, endColor }) => {
	const gradientId = useUniqueId('black-gradient');
	const maskId = useUniqueId('black-mask');

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="23"
			height="87"
			fill="none"
			viewBox="0 0 23 87"
		>
			<mask id={maskId} fill="#fff">
				<path d="M.92 0h22.004v84.84a2 2 0 01-2 2H2.92a2 2 0 01-2-2V0z"></path>
			</mask>
			<path
				fill={`url(#${gradientId})`}
				mask={`url(#${maskId})`}
				stroke="#2D2D2D"
				strokeWidth="5"
				d="M.92 0h22.004v84.84a2 2 0 01-2 2H2.92a2 2 0 01-2-2V0z"
			></path>
			<defs>
				<linearGradient
					id={gradientId}
					x1="11.922"
					x2="11.922"
					y1="21.024"
					y2="39.764"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor={startColor}></stop>
					<stop offset="1" stopColor={endColor}></stop>
				</linearGradient>
			</defs>
		</svg>
	);
};
