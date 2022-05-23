import { GetSetReturnType, PartialKey } from '../types';

export class NestedSet<K = any, T = any> {

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
	 * Appends a new element with the specified value to the end of a set by its key.
	 *
	 * @param key
	 * @param value
	 * @returns
	 */
	public add(key: K, value: T): Set<T> {
		const target = this._getSetFromKey(key, true);

		if (!target.has(value)) {
			this.count++;
		}

		return target.add(value);
	}

	/**
	 * Clears all data from the collection.
	 */
	public clear() {
		this.data.clear();
		this.count = 0;
	}

	/**
	 * Removes the specified value from a set by its key. Returns a boolean indicating whether the value existed in
	 * the set before deletion.
	 *
	 * @param key
	 * @param value
	 * @returns
	 */
	public delete(key: K, value: T): boolean {
		const chain = this._getMapChain(key);

		if (chain.length > 0) {
			const [ map, setName ] = chain[chain.length - 1];

			if (!map.has(setName)) {
				return false;
			}

			const set = map.get(setName);
			const response = set.delete(value);

			if (response) {
				this.count--;
			}

			if (set.size === 0) {
				map.delete(setName);

				for (let index = chain.length - 1; index > 0; index--) {
					const map = chain[index][0];
					const [ parentMap, parentKey ] = chain[index - 1];

					if (map.size > 0) {
						break;
					}

					parentMap.delete(parentKey);
				}
			}

			return response;
		}

		return false;
	}

	/**
	 * Returns a new iterator object that contains an array of `[T, T]` for each element in the set at the given key,
	 * in insertion order. If there is no set at the specified key, an empty iterator is returned.
	 *
	 * @param key
	 * @returns
	 */
	public entries(key: K): IterableIterator<[T, T]> {
		const target = this._getSetFromKey(key);

		if (target) {
			return target.entries();
		}

		return this._getEmptyIter();
	}

	/**
	 * Executes the provided function once for each value in the set at the specified key, in insertion order.
	 *
	 * @param key
	 * @param callbackfn
	 * @param thisArg
	 * @returns
	 */
	public forEach(key: K, callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any) {
		const target = this._getSetFromKey(key);

		if (target) {
			return target.forEach(callbackfn, thisArg);
		}
	}

	/**
	 * Returns the internal set instance at the given key, or `undefined` if it doesn't exist.
	 *
	 * @param key
	 * @returns
	 */
	public get(key: K): Set<T> | undefined;
	public get<I extends PartialKey<K>>(key: I): GetSetReturnType<K, T, I>;
	public get(key: any): any {
		if (key === undefined) {
			return this.data;
		}

		return this._getSetFromKey(key);
	}

	/**
	 * Returns a boolean indicating whether the given value exists within the set at the specified key.
	 *
	 * @param key
	 * @param value
	 * @returns
	 */
	public has(key: K, value: T) {
		const target = this._getSetFromKey(key);
		return target !== undefined && target.has(value);
	}

	/**
	 * Returns a boolean indicating whether the given key exists in the collection.
	 *
	 * Please note: This will return `false` if the set at the given key is empty, because the collection does not
	 * preserve empty sets as part of its garbage collection.
	 *
	 * @param key
	 * @returns
	 */
	public hasKey(key: K): boolean;
	public hasKey<T extends PartialKey<K>>(key: T): boolean;
	public hasKey(key: K) {
		const [ target, name ] = this._getMapFromKey(key);
		return target !== undefined && (name === undefined || target.has(name));
	}

	/**
	 * Returns an array of keys under the given key.
	 * @param key
	 */
	public keys<T extends PartialKey<K>>(key?: T): K[];
	public keys(key?: K): K[] {
		const [ target, name ] = this._getMapFromKey(key);

		if (target) {
			if (name !== undefined) {
				return [...(target.get(name)?.keys() ?? [])];
			}

			return [...target.keys()];
		}

		return [];
	}

	/**
	 * Returns a new iterator object that contains the values for each element in the set at the specified key, in
	 * insertion order.
	 *
	 * @param key
	 * @returns
	 */
	public values(key: K): IterableIterator<T> {
		const target = this._getSetFromKey(key);

		if (target) {
			return target.values();
		}

		return this._getEmptyIter();
	}

	/**
	 * Returns the total number of entries in the collection.
	 */
	public get size(): number {
		return this.count;
	}

	/**
	 * Retrieves the internal map above the given key.
	 *
	 * @param key
	 * @returns
	 */
	protected _getMapFromKey(key: any): [ map: Map<any, any> | undefined, name: any ] {
		if (!Array.isArray(key)) {
			key = [key];
		}

		let target = this.data;
		let keyName = key.pop();

		for (let index = 0; index < key.length; index++) {
			target = target.get(key[index]);

			if (!target) {
				return [ undefined, undefined ];
			}
		}

		return [ target, keyName ];
	}

	/**
	 * Retrieves the internal set for the given key, creating it automatically if `create` is true, or otherwise
	 * returning undefined.
	 *
	 * @param key
	 * @param create
	 * @returns
	 */
	protected _getSetFromKey(key: any, create: true): Set<T>;
	protected _getSetFromKey(key: any, create?: false): Set<T> | undefined;
	protected _getSetFromKey(key: any, create = false): Set<T> | undefined {
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

				return undefined;
			}
		}

		if (create && !target.has(keyName)) {
			target.set(keyName, new Set());
		}

		return target.get(keyName);
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

	private _getEmptyIter() {
		return {
			[Symbol.iterator]() {
				return this
			},
			next: emptyIterNext
		}
	}

}

const emptyIterNextReturn = {
	done: true as const,
	value: undefined
};

Object.freeze(emptyIterNextReturn);

function emptyIterNext() {
	return emptyIterNextReturn;
}
