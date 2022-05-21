import { NestedMap } from '../../src/main';

describe('NestedMap', function() {
	it('can work like a normal map', function() {
		const map = new NestedMap<string, number>();

		map.set('a', 1);
		map.set('b', 2);
		map.set('c', 3);
		map.set('a', 4);

		expect(map.delete('c')).toBe(true);
		expect(map.delete('d')).toBe(false);

		expect(map.get('a')).toBe(4);
		expect(map.get('b')).toBe(2);
		expect(map.get('c')).toBe(undefined);

		expect(map.get(undefined)).toBeInstanceOf(Map);
		expect(map.get(undefined).has('a')).toBe(true);

		expect(map.has('a')).toBe(true);
		expect(map.has('b')).toBe(true);
		expect(map.has('c')).toBe(false);

		expect(map.has(undefined)).toBe(true);

		expect(map.size).toBe(2);
		expect(map.delete('a')).toBe(true);
		expect(map.size).toBe(1);

		map.clear();

		expect(map.size).toBe(0);
		expect(map.get('a')).toBe(undefined);
		expect(map.has(undefined)).toBe(true);
	});

	it('supports two-dimensional keys', function() {
		const map = new NestedMap<[string, string], number>();

		map.set(['a', 'a'], 1);
		map.set(['a', 'b'], 2);
		map.set(['b', 'a'], 3);
		map.set(['b', 'b'], 4);

		expect(map.has(['a', 'a'])).toBe(true);
		expect(map.has(['a', 'b'])).toBe(true);
		expect(map.has(['a', 'c'])).toBe(false);

		expect(map.has(['a'])).toBe(true);
		expect(map.has(['b'])).toBe(true);
		expect(map.has(['c'])).toBe(false);
		expect(map.has([])).toBe(true);

		expect(map.get(['a', 'a'])).toBe(1);
		expect(map.get(['a', 'b'])).toBe(2);
		expect(map.get(['b', 'a'])).toBe(3);
		expect(map.get(['b', 'b'])).toBe(4);

		expect(map.get(['a'])).toBeInstanceOf(Map);
		expect(map.get(['a'])?.has('a')).toBe(true);
		expect(map.get([])).toBeInstanceOf(Map);
		expect(map.get([])?.has('a')).toBe(true);
		expect(map.get([])?.get('a')?.has('a')).toBe(true);

		expect(map.size).toBe(4);

		expect(map.delete(['a', 'c'])).toBe(false);
		expect(map.delete(['a', 'b'])).toBe(true);
		expect(map.size).toBe(3);

		/**
		 * When deleting from the collection, it will attempt to clean up empty maps where possible.
		 * The following tests will make sure this is working properly.
		 */

		expect(map.get(['a', 'a'])).toBe(1);
		expect((map as any).get('a') instanceof Map).toBe(true);
		expect(map.delete(['a', 'a'])).toBe(true);
		expect((map as any).get('a')).toBe(undefined);
		expect(map.size).toBe(2);

		expect(map.has(['a', 'a'])).toBe(false);
		expect(map.has(['b', 'a'])).toBe(true);

		map.clear();

		expect(map.size).toBe(0);
		expect(map.get(['b', 'a'])).toBe(undefined);
	});

	it('supports three-dimensional keys', function() {
		const map = new NestedMap<[string, string, string], number>();

		map.set(['a', 'a', 'a'], 1);
		map.set(['a', 'a', 'b'], 2);
		map.set(['a', 'b', 'a'], 3);
		map.set(['a', 'b', 'b'], 4);
		map.set(['b', 'c', 'a'], 5);

		expect(map.has(['a', 'a', 'a'])).toBe(true);
		expect(map.has(['a', 'a', 'b'])).toBe(true);
		expect(map.has(['a', 'b', 'a'])).toBe(true);
		expect(map.has(['a', 'b', 'c'])).toBe(false);

		expect(map.get(['a', 'a', 'a'])).toBe(1);
		expect(map.get(['a', 'a', 'b'])).toBe(2);
		expect(map.get(['a', 'b', 'a'])).toBe(3);
		expect(map.get(['b', 'c', 'a'])).toBe(5);

		expect(map.size).toBe(5);

		expect(map.delete(['a', 'a', 'c'])).toBe(false);
		expect(map.delete(['a', 'a', 'b'])).toBe(true);
		expect(map.size).toBe(4);

		// When deleting a nested key, the collection will try to clean up the parent maps as well
		// Let's make sure that the key at [b] still exists
		expect(map.get(['b', 'c', 'a'])).toBe(5);

		// Ok, now delete [b, c, a] and let's do some not-legit stuff to make sure [b] does NOT exist
		expect((map as any).get('b') instanceof Map).toBe(true);
		expect(map.delete(['b', 'c', 'a'])).toBe(true);
		expect((map as any).get('b')).toBe(undefined);
		expect(map.size).toBe(3);

		map.clear();

		expect(map.size).toBe(0);
		expect(map.get(['a', 'a', 'a'])).toBe(undefined);
	});

	it('works with objects', function() {
		class Person {
			public constructor(public readonly name: string) {}
		}

		const john = new Person('John');
		const sarah = new Person('Sarah');

		const map = new NestedMap<[person: Person, account: string, key: string], any>();

		map.set([john, 'checking', 'balance'], 100);
		map.set([john, 'checking', 'openingYear'], 2020);

		map.set([sarah, 'checking', 'balance'], 500);
		map.set([sarah, 'checking', 'openingYear'], 2009);

		expect(map.get([john, 'checking', 'balance'])).toBe(100);
		expect(map.get([sarah, 'checking', 'balance'])).toBe(500);
		expect(map.get([sarah, 'checking', 'openingYear'])).toBe(2009);

		map.delete([sarah, 'checking', 'openingYear']);
		expect(map.get([sarah, 'checking', 'balance'])).toBe(500);
		expect(map.get([sarah, 'checking', 'openingYear'])).toBe(undefined);
	});
});
