import {
	CartesianGrid,
	Label,
	XAxis,
	YAxis,
	Tooltip,
	Bar,
	Line,
	BarChart,
	LineChart,
} from 'recharts';
import { roundToTenth } from 'MemoryFlashCore/src/lib/rounding';
import {
	DailyMedian,
	DailyTimeSpent,
} from 'MemoryFlashCore/src/redux/selectors/attemptsStatsSelector';

const formatDateLabel = (timestamp: number) => {
	const date = new Date(timestamp);
	const month = `${date.getMonth() + 1}`.padStart(2, '0');
	const day = `${date.getDate()}`.padStart(2, '0');
	const year = date.getFullYear().toString().slice(-2);
	return `${month}/${day}/${year}`;
};

interface TimeSpentChartProps {
	timeSpentPerDay: DailyTimeSpent[];
	medianPerDay: DailyMedian[];
}

export const TimeSpentChart: React.FC<TimeSpentChartProps> = ({
	timeSpentPerDay,
	medianPerDay,
}) => {
	const timeSpentData = [...timeSpentPerDay]
		.sort((a, b) => a.timestamp - b.timestamp)
		.map(({ timestamp, timeSpent }) => ({
			date: formatDateLabel(timestamp),
			timeSpent: roundToTenth(timeSpent / 60),
		}));

	const medianData = [...medianPerDay]
		.sort((a, b) => a.timestamp - b.timestamp)
		.map(({ timestamp, median }) => ({
			date: formatDateLabel(timestamp),
			median: median || null,
		}));

	return (
		<div className="mt-8 flex flex-col gap-8 svg-dark-mode">
			<div>
				<div className="text-black font-bold text-center">Time Spent Studying per Day</div>
				<BarChart
					width={700}
					height={300}
					data={timeSpentData}
					margin={{
						top: 5,
						right: 70,
						left: 0,
						bottom: 20,
					}}
				>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="date">
						<Label position="insideBottom" dy={20} value="Date" />
					</XAxis>
					<YAxis
						label={{
							value: 'Time Spent (minutes)',
							angle: -90,
							dx: -20,
						}}
					/>
					<Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />

					<Bar dataKey="timeSpent" name="Time Spent (min)" fill="#8884d8" />
				</BarChart>
			</div>
			{/* Median Time Line Chart */}
			{medianData.length > 3 && (
				<div>
					<div className="text-black font-bold text-center">Best Median Time per Day</div>
					<LineChart
						width={700}
						height={300}
						data={medianData}
						margin={{
							top: 5,
							right: 70,
							left: 0,
							bottom: 20,
						}}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="date">
							<Label position="insideBottom" dy={10} value="Date" />
						</XAxis>
						<YAxis
							label={{
								value: 'Median Time (seconds)',
								angle: -90,
								dx: -20,
							}}
						/>
						<Tooltip />
						<Line
							type="monotone"
							dataKey="median"
							name="Best Median (s)"
							stroke="#82ca9d"
							dot={{ r: 3 }}
						/>
					</LineChart>
				</div>
			)}
		</div>
	);
};
