import { ReduxState, Store, createStore } from 'MemoryFlashCore/src/redux/store';
import { RDXPersist } from './RDXPersist';

export let store: Store;

export const rdxPersist = new RDXPersist<ReduxState>([], []);

rdxPersist.keysToPersist = ['auth', 'settings'];

const persistStore = (state: ReduxState) => {
	rdxPersist.persist(state);
};

export const loadWebReudxStatePromise = rdxPersist
	.rehydrate()
	.then(async (preloadedState) => {
		store = createStore(preloadedState, persistStore);
	})
	.catch((err) => {
		console.log('Error loading redux state', err);
		store = createStore(undefined, persistStore);
	})
	.finally(() => {
		console.log('Redux store loaded');
	});
