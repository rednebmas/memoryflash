import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext<(message: string) => void>(() => {});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [msg, setMsg] = useState<string>();
	const show = useCallback((m: string) => {
		setMsg(m);
		setTimeout(() => setMsg(undefined), 2000);
	}, []);
	return (
		<ToastContext.Provider value={show}>
			{children}
			{msg && (
				<div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded bg-black px-3 py-2 text-white shadow">
					{msg}
				</div>
			)}
		</ToastContext.Provider>
	);
};

export const useToast = () => useContext(ToastContext);
