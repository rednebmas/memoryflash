import { useUniqueId } from '../../utils/useUniqueId';

export const WhiteKey: React.FC<{
	startColor: string;
	endColor: string;
}> = ({ startColor, endColor }) => {
	const gradientId = useUniqueId('white-gradient');

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="34"
			height="149"
			fill="none"
			viewBox="0 0 34 149"
		>
			<rect
				width="32.922"
				height="148"
				x="0.5"
				y="0.5"
				fill={`url(#${gradientId})`}
				stroke="#8E9AA3"
				rx="1.5"
			></rect>
			<defs>
				<linearGradient
					id={gradientId}
					x1="17.42"
					x2="17.42"
					y1="117.92"
					y2="144.429"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor={startColor}></stop>
					<stop offset="1" stopColor={endColor}></stop>
				</linearGradient>
			</defs>
		</svg>
	);
};
