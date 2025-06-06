interface SegmentedButtonProps {
	text: string;
	Icon?: (props: { color: string }) => JSX.Element;
	active: boolean;
	onClick: () => void;
}

export const SegmentButton: React.FC<SegmentedButtonProps> = ({ text, Icon, active, onClick }) => {
	return (
		<div
			onClick={onClick}
			className={`cursor-pointer p-2 flex flex-1 justify-center items-center rounded-lg text-base font-medium ${
				active ? 'text-white bg-btn' : 'text-black bg-transparent'
			} space-x-0.5`}
		>
			{Icon && <Icon color={active ? '#fff' : ''} />}
			<div>{text}</div>
		</div>
	);
};
