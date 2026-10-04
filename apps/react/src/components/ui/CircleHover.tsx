import { Link } from 'react-router-dom';

interface CircleHoverProps {
	children: React.ReactNode;
	link?: string;
	onClick?: () => void;
}

export const circleClassName =
	'w-9 h-9 flex items-center justify-center rounded-full transition-all duration-150 text-fg';

export const CircleHover: React.FC<CircleHoverProps> = ({ children, link, onClick }) => {
	const className = `${circleClassName} cursor-pointer hover:bg-gray-200 dark:hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2`;

	if (link) {
		return (
			<Link to={link} className={className}>
				{children}
			</Link>
		);
	}
	return (
		<div className={className} onClick={onClick} tabIndex={0}>
			{children}
		</div>
	);
};
