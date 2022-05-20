# Nested collections

This is a small package that makes it a bit easier to work with maps and sets under nested keys, which can become
tedious very quickly when done manually.

## Getting started

Install the package into your project:

```plain
npm install @baileyherbert/nested-collections
```

You can then import the two collection classes and use them as follows.

## Nested maps

The `NestedMap<K, V>` class can be used as a direct replacement for `Map<K, V>`, with the exception that it does not
currently support iteration. Passing an array as the key will automatically expand the array's values into a nested map
structure.

```ts
import { NestedMap } from '@baileyherbert/nested-collections';

const map = new NestedMap<[string, string], number>();

map.set(['a', 'a'], 1);
map.set(['a', 'b'], 2);
map.set(['b', 'b'], 3);

map.get(['a', 'a']); // 1
map.get(['a', 'b']); // 2
map.get(['b', 'b']); // 3
```

Internally, the above code builds and maintains a map that looks something like this:

```ts
Map<string, Map<string, number>>
```

### Supported methods

- `clear()`
- `delete(key)`
- `get(key)`
- `has(key)`
- `set(key, value)`

## Nested sets

The `NestedSet<K, T>` collection works identically to the nested maps shown above, except the innermost structure is a
`Set<T>`. You can also access the internal set and iterate over it.

```ts
import { NestedSet } from '@baileyherbert/nested-collections';

const set = new NestedSet<[string, string], number>();

set.add(['a', 'a'], 1);
set.add(['a', 'a'], 2);
set.add(['a', 'b'], 3);

set.has(['a', 'a'], 1); // true
set.delete(['a', 'a'], 1); // true

set.get(['a', 'a']); // Set(1, 2)
set.get(['a', 'b']); // Set(3)

[...set.get(['a', 'a'])]; // [1, 2]
```

Internally, the above code builds and maintains a map that looks something like this:

```ts
Map<string, Map<string, Set<number>>>
```

### Supported methods

- `add(key, value)`
- `clear()`
- `delete(key, value)`
- `entries(key)`
- `forEach(key, callback[, thisArg])`
- `get(key)` – Returns the internal set instance or `undefined` if not found
- `has(key, value)`
- `hasKey(key)` – Returns true if there is a set under the given key
  - Note: Empty sets will always return false because they are garbage collected away.
- `values(key)`

## Supported keys

You can use any types as your keys, just like you can with a map. This class also supports single-value keys like maps.
All of the following examples are valid:

```ts
// Single key (without array for backwards compatibility)
new NestedMap<string, number>();
new NestedMap<Symbol, number>();

// Single key
new NestedMap<[string], number>();
new NestedMap<[Symbol], number>();

// Multiple keys
new NestedMap<[string, string], number>();
new NestedMap<[Symbol, string], number>();
```
