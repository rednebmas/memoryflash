import React from 'react';

export type CardContainerProps = React.HTMLAttributes<HTMLDivElement> & {
	children: React.ReactNode;
};

export const CardContainer = React.forwardRef<HTMLDivElement, CardContainerProps>(
	({ className = '', children, ...props }, ref) => {
		return (
			<div ref={ref} className={`card-container ${className}`} {...props}>
				{children}
			</div>
		);
	},
);

CardContainer.displayName = 'CardContainer';
