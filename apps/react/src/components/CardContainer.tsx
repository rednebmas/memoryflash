import React from 'react';

export type CardContainerProps = React.HTMLAttributes<HTMLDivElement> & {
	children?: React.ReactNode;
};

export const CardContainer = React.forwardRef<HTMLDivElement, CardContainerProps>(
	({ className = '', children, ...rest }, ref) => (
		<div
			ref={ref}
			className={`bg-white rounded-2xl card-border py-3 px-5 ${className}`}
			{...rest}
		>
			{children}
		</div>
	),
);

CardContainer.displayName = 'CardContainer';
