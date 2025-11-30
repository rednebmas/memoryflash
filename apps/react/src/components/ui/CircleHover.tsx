import { Link } from 'react-router-dom';

interface CircleHoverProps {
	children: React.ReactNode;
	link?: string;
	onClick?: () => void;
}

export const CircleHover: React.FC<CircleHoverProps> = ({ children, link, onClick }) => {
	const className =
		'w-9 h-9 flex items-center justify-center rounded-full cursor-pointer transition-colors hover:bg-gray-200 dark:hover:bg-white/15 text-fg';

	if (link) {
		return (
			<Link to={link} className={className}>
				{children}
			</Link>
		);
	}
	return (
		<div className={className} onClick={onClick}>
			{children}
		</div>
	);
};
