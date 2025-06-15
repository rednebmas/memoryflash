import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { NotationInputScreen } from '../src/screens/NotationInputScreen';
import '../src/index.css';
import { createStore } from 'MemoryFlashCore/src/redux/store';

const store = createStore({ scheduler: { multiPartCardIndex: 0 } } as any, () => {});
(window as any).store = store;

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<Provider store={store}>
			<BrowserRouter>
				<NotationInputScreen />
			</BrowserRouter>
		</Provider>
	</React.StrictMode>,
);
