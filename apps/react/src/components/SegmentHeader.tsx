import React from 'react';
import { iconDisplay } from '../mocks/icon';
import { SegmentButton } from './SegmentButton';

interface SegmentHeaderProps {
	segments: string[];
	activeSegment: string;
	toggleSegment: (segment: string) => void;
}

export const SegmentHeader: React.FC<SegmentHeaderProps> = ({
	segments,
	activeSegment,
	toggleSegment,
}) => {
	return (
		<div className="flex p-1 bg-card gap-2 rounded-xl">
			{segments.map((segment, i) => (
				<SegmentButton
					key={i}
					text={segment}
					Icon={iconDisplay(segment)}
					active={segment === activeSegment}
					onClick={() => toggleSegment(segment)}
				/>
			))}
		</div>
	);
};
