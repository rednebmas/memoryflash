import { Link } from 'react-router-dom';

interface CircleHoverProps {
	children: React.ReactNode;
	link?: string;
	onClick?: () => void;
}

export const CircleHover: React.FC<CircleHoverProps> = ({ children, link, onClick }) => {
	const content = (
		<div
			className='p-2 hover:bg-gray-200 active:bg-gray-200 rounded-full cursor-pointer hover:bg-opacity-50 transition-all'
			onClick={onClick}
		>
			{children}
		</div>
	);

	return link ? (
		<Link to={link} className='inline-block'>
			{content}
		</Link>
	) : (
		content
	);
};
