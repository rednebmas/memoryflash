import { SegmentedControl } from './SegmentedControl';
import { SegmentButton } from './SegmentButton';

interface SegmentedPickerProps<T extends string> {
	options: { value: T; text: string }[];
	value: T;
	onChange: (value: T) => void;
}

export const SegmentedPicker = <T extends string>({
	options,
	value,
	onChange,
}: SegmentedPickerProps<T>) => (
	<SegmentedControl variant="compact">
		{options.map((option) => (
			<SegmentButton
				key={option.value}
				variant="compact"
				text={option.text}
				active={value === option.value}
				onClick={() => onChange(option.value)}
			/>
		))}
	</SegmentedControl>
);
