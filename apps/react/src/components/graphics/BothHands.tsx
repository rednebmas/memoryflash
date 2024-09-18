import { HandLeft } from './HandLeft';
import { HandRight } from './HandRight';

export const BothHands = (props: { color?: string }) => {
	const { color } = props;

	return (
		<div className='flex'>
			<HandLeft color={color} />
			<HandRight color={color} />
		</div>
	);
};
