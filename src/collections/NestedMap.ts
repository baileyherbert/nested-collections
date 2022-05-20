export class NestedMap<K = any, V = any> {

	/**
	 * The root data map.
	 */
	protected data: Map<any, any>;

	/**
	 * The current total number of values in the collection.
	 */
	protected count: number;

	public constructor() {
		this.data = new Map();
		this.count = 0;
	}

	/**
	 * Clears all data from the collection.
	 */
	public clear() {
		this.data.clear();
		this.count = 0;
	}

	/**
	 * Removes the specified element from the collection by its key.
	 *
	 * @param key
	 * @returns
	 */
	public delete(key: K): boolean {
		const chain = this._getMapChain(key);

		if (chain.length > 0) {
			const [ target, name ] = chain[chain.length - 1];
			const response = target.delete(name);

			if (response) {
				this.count--;
			}

			for (let index = chain.length - 1; index > 0; index--) {
				const target = chain[index][0];
				const [ parentTarget, parentKey ] = chain[index - 1];

				if (target.size > 0) {
					break;
				}

				parentTarget.delete(parentKey);
			}

			return response;
		}

		return false;
	}

	/**
	 * Returns the value of a specific element in the collection by its key.
	 *
	 * @param key
	 * @returns
	 */
	public get(key: K): V | undefined {
		const [ target, name ] = this._getMap(key);

		if (target) {
			return target.get(name);
		}

		return;
	}

	/**
	 * Returns a boolean indicating whether the given key exists in the collection.
	 *
	 * @param key
	 * @returns
	 */
	public has(key: K): boolean {
		const [ target, name ] = this._getMap(key);
		return target !== undefined && target.has(name);
	}

	/**
	 * Adds or updates a value in the collection by its key.
	 *
	 * @param key
	 * @param value
	 * @returns
	 */
	public set(key: K, value: V): this {
		const [ target, name ] = this._getMap(key, true);

		if (target) {
			if (!target.has(name)) {
				this.count++;
			}

			target.set(name, value);
			return this;
		}

		throw new Error('Failed to create map for the specified key (this should never happen!)');
	}

	/**
	 * Returns the total number of entries in the collection.
	 */
	public get size(): number {
		return this.count;
	}

	/**
	 * Retrieves the internal storage map for the parent of the given key as well as the inner key's name.
	 *
	 * @param key
	 * @param create When true, the maps will be created if necessary.
	 * @returns
	 */
	protected _getMap(key: any, create = false): [ map: Map<any, V> | undefined, key: any ] {
		if (!Array.isArray(key)) {
			key = [key];
		}

		let target = this.data;
		let keyName = key.pop();

		for (let index = 0; index < key.length; index++) {
			let parent = target;
			target = target.get(key[index]);

			if (!target) {
				if (create) {
					const map = new Map();
					parent.set(key[index], map);
					target = map;
					continue;
				}

				return [ undefined, undefined ];
			}
		}

		return [ target, keyName ];
	}

	/**
	 * Retrieves the internal storage map for the parent of the given key as well as the inner key's name.
	 *
	 * @param key
	 * @returns
	 */
	protected _getMapChain(key: any): [ map: Map<any, any>, key: any ][] {
		if (!Array.isArray(key)) {
			key = [key];
		}

		let chain = new Array<[ map: Map<any, any>, key: any ]>();
		let target = this.data;

		chain.push([ target, key[0] ]);

		for (let index = 0; index < key.length - 1; index++) {
			target = target.get(key[index]);

			if (!target) {
				return [];
			}

			chain.push([ target, key[index + 1] ]);
		}

		return chain;
	}

}
