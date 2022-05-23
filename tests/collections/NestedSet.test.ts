import { NestedSet } from '../../src/main';

describe('NestedSet', function() {
	it('supports single-value keys', function() {
		const set = new NestedSet<string, number>();

		set.add('a', 1);
		set.add('b', 2);
		set.add('c', 3);
		set.add('d', 4);

		expect(set.size).toBe(4);

		expect(set.get('a')).toBeInstanceOf(Set);
		expect(set.get('b')).toBeInstanceOf(Set);
		expect(set.get('c')).toBeInstanceOf(Set);
		expect(set.get('d')).toBeInstanceOf(Set);
		expect(set.get('e')).toBe(undefined);

		expect(set.get(undefined)).toBeInstanceOf(Map);

		expect(set.has('a', 1)).toBe(true);
		expect(set.has('a', 2)).toBe(false);
		expect(set.has('e', 1)).toBe(false);

		expect(set.hasKey('a')).toBe(true);
		expect(set.hasKey('e')).toBe(false);
		expect(set.hasKey(undefined)).toBe(true);

		expect(set.keys()).toEqual(['a', 'b', 'c', 'd']);

		expect(set.delete('a', 2)).toBe(false);
		expect(set.delete('a', 1)).toBe(true);
		expect(set.size).toBe(3);

		expect([...set.values('b')]).toEqual([2]);
		expect(set.add('b', 5)).toBeInstanceOf(Set);
		expect([...set.values('b')]).toEqual([2, 5]);

		expect([...set.entries('c')]).toEqual([[3, 3]]);

		const callbackForB = jest.fn();
		const callbackForC = jest.fn();
		const callbackForE = jest.fn();

		set.forEach('b', callbackForB);
		set.forEach('c', callbackForC);
		set.forEach('ce', callbackForE);

		expect(callbackForB).toHaveBeenCalledTimes(2);
		expect(callbackForC).toHaveBeenCalledWith(3, 3, set.get('c'));
		expect(callbackForE).toHaveBeenCalledTimes(0);

		set.clear();
		expect(set.size).toBe(0);
		expect(set.has('a', 1)).toBe(false);
	});

	it('supports nested keys', function() {
		const set = new NestedSet<[string, string, string], number>();

		set.add(['a', 'a', 'a'], 1);
		set.add(['a', 'a', 'a'], 2);
		set.add(['a', 'b', 'b'], 3);

		expect(set.has(['a', 'a', 'a'], 1)).toBe(true);
		expect(set.has(['a', 'a', 'a'], 2)).toBe(true);
		expect(set.has(['a', 'a', 'a'], 3)).toBe(false);
		expect(set.has(['a', 'b', 'b'], 3)).toBe(true);
		expect(set.has(['a', 'b', 'b'], 1)).toBe(false);

		expect(set.hasKey(['a', 'a', 'a'])).toBe(true);
		expect(set.hasKey(['a', 'a', 'b'])).toBe(false);
		expect(set.hasKey(['a', 'b', 'b'])).toBe(true);
		expect(set.hasKey(['a', 'b', 'c'])).toBe(false);

		expect(set.hasKey(['a', 'b'])).toBe(true);
		expect(set.hasKey(['a', 'c'])).toBe(false);
		expect(set.hasKey(['a'])).toBe(true);
		expect(set.hasKey(['b'])).toBe(false);
		expect(set.hasKey([])).toBe(true);

		expect(set.keys([])).toEqual(['a']);
		expect(set.keys(['a'])).toEqual(['a', 'b']);
		expect(set.keys(['a', 'b'])).toEqual(['b']);

		expect(set.size).toBe(3);

		expect([...set.values(['a', 'a', 'a'])]).toEqual([1, 2]);
		expect([...set.entries(['a', 'a', 'a'])]).toEqual([[1, 1], [2, 2]]);

		expect(set.get(['a', 'a', 'a'])).toBeInstanceOf(Set);
		expect(set.get(['a', 'b', 'b'])).toBeInstanceOf(Set);
		expect(set.get(['a', 'a', 'b'])).toBe(undefined);
		expect(set.get(['a', 'b', 'a'])).toBe(undefined);

		expect(set.get(['a', 'a'])).toBeInstanceOf(Map);
		expect(set.get(['a', 'a'])!.has('a')).toBe(true);
		expect(set.get(['a', 'a'])!.get('a')!.has(1)).toBe(true);

		/**
		 * When deleting from the collection, it will attempt to clean up empty maps and sets where possible.
		 * The following tests will make sure this is working properly.
		 */

		const setAny = set as any;
		expect(setAny.get(['a', 'a', 'a'])).toBeInstanceOf(Set);
		expect(setAny.get(['a', 'a'])).toBeInstanceOf(Map);
		expect(setAny.get(['a', 'b', 'b'])).toBeInstanceOf(Set);
		expect(setAny.get(['a', 'b'])).toBeInstanceOf(Map);
		expect(setAny.get(['a'])).toBeInstanceOf(Map);

		expect(set.delete(['a', 'b', 'b'], 2)).toBe(false);
		expect(set.get(['a', 'b', 'b'])).toBeInstanceOf(Set);

		expect(set.hasKey(['a', 'b', 'b'])).toBe(true);
		expect(set.delete(['a', 'b', 'b'], 3)).toBe(true);
		expect(setAny.get(['a', 'b', 'b'])).toBe(undefined);
		expect(set.hasKey(['a', 'b', 'b'])).toBe(false);
		expect(setAny.get(['a', 'b'])).toBe(undefined);
		expect(setAny.get(['a'])).toBeInstanceOf(Map);
		expect(setAny.get(['a', 'a', 'a'])).toBeInstanceOf(Set);
		expect(set.size).toBe(2);

		expect(set.delete(['a', 'a', 'a'], 2)).toBe(true);
		expect(setAny.get(['a', 'a', 'a'])).toBeInstanceOf(Set);
		expect(set.size).toBe(1);

		set.clear();
		expect(set.size).toBe(0);
	});

	it('has working empty iterables', function() {
		const set = new NestedSet<string, string>();

		expect([...set.values('a')]).toEqual([]);
		expect([...set.entries('a')]).toEqual([]);
	});
});
