import React from 'react';
import { MusicNotation } from '../MusicNotation';

interface NotationPreviewListProps {
	previews: any[];
}

export const NotationPreviewList: React.FC<NotationPreviewListProps> = ({ previews }) => (
	<div className="flex flex-col items-center gap-5">
		{previews.map((p, i) => (
			<div key={i} className="flex flex-col items-center gap-2">
				<div className="card-container flex flex-col items-center gap-2 w-[26rem]">
					<MusicNotation data={p} />
				</div>
			</div>
		))}
	</div>
);
