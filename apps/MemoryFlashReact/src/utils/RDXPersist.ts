import { deleteKeypath, setKeypath } from '../submodules/MemoryFlashCore/src/lib/keypaths';

export interface RDXPersistMigration<StateType> {
	number: number;
	exec: (state: Partial<StateType>) => void;
}

export class RDXPersist<T> {
	prePersistFilter?: (state: Partial<T>) => any;
	keysToPersist: Array<keyof T> = [];
	excludedKeypaths: {
		keypath: string;
		defaultValue?: any; // if you exclude the keypath, it's value will be undefined when the persisted state is loaded.
	}[];
	asyncStorageKey = 'persistedData';
	migrationsRanKey = 'migrationsRanRDXPersist';
	private lastMigrationRan?: number;
	private migrations?: RDXPersistMigration<T>[];
	storage: Storage = localStorage;
	isDev: boolean | undefined;

	/**
	 * @param excludedKeyPaths keys and keypaths to exlucude from the keysToPersist.
	 * @param keysToPersist what keys of the redux should be persisted.
	 * @param migrations a dictionary of functions indexed by the number starting with 0.
	 */
	constructor(
		excludedKeyPaths: RDXPersist<T>['excludedKeypaths'],
		migrations: RDXPersistMigration<T>[],
		isDev?: boolean,
	) {
		this.excludedKeypaths = excludedKeyPaths;
		this.migrations = migrations;
		this.isDev = isDev;
		this.storage = localStorage;
	}

	// saves store to storage mechanism
	// this is called when the data should be saved
	async persist(state: T) {
		let dataToBePersisted: any = {};
		this.keysToPersist.forEach((key) => {
			dataToBePersisted[key] = JSON.parse(JSON.stringify(state[key]));
		});
		this.excludedKeypaths.forEach((exclude) => {
			deleteKeypath(dataToBePersisted, exclude.keypath);
		});
		if (this.prePersistFilter) {
			this.prePersistFilter(dataToBePersisted);
		}

		window.onbeforeunload = () => true;
		this.storage.setItem(this.asyncStorageKey, JSON.stringify(dataToBePersisted));
		window.onbeforeunload = null;
	}

	// populates passed in object with stored data
	// this is called on app startup
	async rehydrate(): Promise<Partial<T>> {
		const data = this.storage.getItem(this.asyncStorageKey);
		if (!data) {
			return {};
		}
		try {
			const decryptedData = JSON.parse(data);
			const persistedData: Partial<T> = decryptedData;

			this.excludedKeypaths.forEach((exclude) => {
				if (exclude.defaultValue) {
					setKeypath(persistedData, exclude.keypath, exclude.defaultValue);
				}
			});

			if (this.runMigrationsIfNeeded(persistedData)) {
				await this.persist(persistedData as T);
			}

			return persistedData;
		} catch (error) {
			console.error('<Error rehydrating>', error);
			await this.clearPersistedData();
			return {};
		}
	}

	private runMigrationsIfNeeded(state: Partial<T>) {
		if (!this.migrations) return false;
		if (this.lastMigrationRan !== undefined) return false;

		let migrationsRan = parseInt(this.storage.getItem(this.migrationsRanKey) || '-1');

		// run migrations
		const migrationsThatNeedToBeRun = this.migrations.filter((m) => m.number > migrationsRan);

		migrationsThatNeedToBeRun.forEach((m) => {
			m.exec(state);
			migrationsRan = Math.max(m.number, migrationsRan);
			if (!this.isDev) console.log(`Migration ${m.number} executed`);
		});

		this.lastMigrationRan = migrationsRan;
		this.storage.setItem(this.migrationsRanKey, this.lastMigrationRan + '');
		return migrationsThatNeedToBeRun.length > 0;
	}

	async clearPersistedData() {
		console.log('Clearing persisted redux state from async storage');
		this.storage.removeItem(this.asyncStorageKey);
	}
}
