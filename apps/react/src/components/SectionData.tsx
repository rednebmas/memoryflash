import { SectionCard } from './SectionCard';

export const SectionData: React.FC<{
	items: {
		title: string;
		subTitle?: string;
		link: string;
	}[];
	btnText: string;
}> = ({ items, btnText }) => {
	return (
		<div className='flex justify-center flex-wrap items-center gap-8'>
			{items.map((item, i) => (
				<SectionCard
					key={i}
					title={item.title}
					subTitle={item.subTitle}
					link={item.link}
					btnText={btnText}
				/>
			))}
		</div>
	);
};
