import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { createStore } from 'MemoryFlashCore/src/redux/store';

export function renderApp(element: React.ReactElement, rootId = 'root') {
	const indexParam = new URLSearchParams(window.location.search).get('index');
	const multiPartCardIndex = indexParam ? parseInt(indexParam, 10) : 0;
	const store = createStore({ scheduler: { multiPartCardIndex } } as any, () => {});
	(window as any).store = store;

	ReactDOM.createRoot(document.getElementById(rootId)!).render(
		<React.StrictMode>
			<Provider store={store}>{element}</Provider>
		</React.StrictMode>,
	);
}
