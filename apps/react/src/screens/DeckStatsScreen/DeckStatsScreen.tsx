import { ListBulletIcon } from '@heroicons/react/24/outline';
import React, { useEffect } from 'react';
import { CartesianGrid, Label, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { Layout, LinkButton } from '../../components';
import { NetworkStateWrapper } from '../../components/feedback/NetworkStateWrapper';
import { CircleHover } from '../../components/ui/CircleHover';
import { getDeck } from 'MemoryFlashCore/src/redux/actions/get-deck-action';
import { getStatsDeck } from 'MemoryFlashCore/src/redux/actions/get-deck-stats-action';
import { attemptsStatsSelector } from 'MemoryFlashCore/src/redux/selectors/attemptsStatsSelector';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { useDeckIdPath } from '../useDeckIdPath';
import { TimeSpentChart } from './TimeSpentStudyingPerDayChart';

interface DeckStatsScreenProps {}

interface CustomizedDotProps {
	cx: number;
	cy: number;
	stroke: string;
	fill: string;
	payload: any;
	value: number;
}

const CustomizedDot: React.FC<CustomizedDotProps> = (props) => {
	const { cx, cy, stroke, fill, payload } = props;
	if (payload.highlight) {
		return <circle cx={cx} cy={cy} r={3} fill={stroke} stroke={stroke} />;
	}

	return <circle cx={cx} cy={cy} r={3} fill={fill} stroke={stroke} />;
};

export const DeckStatsScreen: React.FunctionComponent<DeckStatsScreenProps> = ({}) => {
	const dispatch = useAppDispatch();
	const { deckId, deck } = useDeckIdPath();
	useEffect(() => {
		if (deckId) {
			dispatch(getDeck(deckId));
			dispatch(getStatsDeck(deckId));
		}
	}, [deckId]);

	const attemptsStats = useAppSelector(attemptsStatsSelector);
	if (!attemptsStats) {
		return null;
	}
	const { median, medianHistory, numCards, totalTimeSpent, timeSpentPerDay, medianPerDay } =
		attemptsStats;

	let curMaxMedian = Number.MAX_SAFE_INTEGER;
	const data = medianHistory
		.map((d, i) => {
			let highlight = d.median < curMaxMedian;
			if (highlight) curMaxMedian = d.median;
			return { ...d, i, highlight };
		})
		.filter((d) => d.highlight)
		.map((d, i) => ({ ...d, i }));

	return (
		<Layout
			subtitle={deck?.name}
			right={
				<CircleHover link={`/study/${deckId}/list`}>
					<ListBulletIcon className="w-5 h-5 stroke-2" />
				</CircleHover>
			}
		>
			<NetworkStateWrapper networkKey={`getDeck${deckId}`} hasData={!!attemptsStats}>
				<div className="flex gap-8 flex-col">
					<div className="flex flex-col items-center">
						<div>Number of cards: {numCards}</div>
						<div>Median time to answer: {median.toFixed(1)}s</div>
						<div>Total time studying: {(totalTimeSpent / 60).toFixed(1)} minutes</div>
						{deckId && (
							<div className="flex w-full justify-center pt-4">
								<LinkButton to={`/study/${deckId}/attempts`} variant="outline">
									View attempt history
								</LinkButton>
							</div>
						)}{' '}
						<div className="mt-8 flex flex-col gap-2 svg-dark-mode">
							<div
								className="text-black font-bold text-center"
								style={{ paddingLeft: '' }}
							>
								Median Time Taken to Answer Questions
							</div>
							<LineChart
								width={700}
								height={300}
								data={data}
								margin={{
									top: 5,
									right: 70,
									left: 0,
									bottom: 20,
								}}
							>
								<CartesianGrid strokeDasharray="4 4" />
								<XAxis dataKey="i" tickFormatter={() => ''}>
									<Label
										position="insideBottom"
										dy={8}
										value="Ordered Time Index"
									/>
								</XAxis>
								<YAxis
									label={{
										value: 'Time to answer (seconds)',
										style: { textAnchor: 'middle' },
										angle: -90,
										position: 'left',
										dx: 20,
									}}
								></YAxis>
								<Tooltip
									labelFormatter={(value) => {
										let payload = data[parseInt(value)];
										let label = new Date(payload.date).toLocaleString();
										return (
											<span>
												{/* {payload.highlight && <span>New best!</span>} */}
												{/* <br /> */}
												<span>{label}</span>
											</span>
										);
									}}
								/>
								<Line
									type="monotone"
									dataKey="median"
									dot={(dotProps) => <CustomizedDot {...dotProps} />}
								/>
							</LineChart>
						</div>
						<TimeSpentChart
							timeSpentPerDay={timeSpentPerDay}
							medianPerDay={medianPerDay}
						/>
					</div>
				</div>
			</NetworkStateWrapper>
		</Layout>
	);
};
