/**
 * Computes the return type of a partial array key for a nested map.
 */
type MapReturnType<T extends any[], V, Input extends any[], Index extends number = 0, Crossed = false> = (
	Crossed extends true? (
		Index extends Len<T> ? V :
		Map<T[Index], MapReturnType<T, V, Input, Increment<Index>, Crossed>>
	) : (
		Index extends Len<Input> ? MapReturnType<T, V, Input, Index, true> :
		MapReturnType<T, V, Input, Increment<Index>>
	)
);

/**
 * Computes the return type of a partial array key for a nested set.
 */
type SetReturnType<T extends any[], V, Input extends any[], Index extends number = 0, Crossed = false> = (
	Crossed extends true? (
		Index extends Len<T> ? Set<V> :
		Map<T[Index], SetReturnType<T, V, Input, Increment<Index>, Crossed>>
	) : (
		Index extends Len<Input> ? SetReturnType<T, V, Input, Index, true> :
		SetReturnType<T, V, Input, Increment<Index>>
	)
);

/**
 * Computes the return type of a partial key for a nested map.
 */
export type GetMapReturnType<T, V, Input> = (
	T extends any[] ? (Input extends any[] ? Nullable<MapReturnType<T, V, Input>, Len<Input>> : MapReturnType<T, V, [Input]>) :
	Map<T, V>
);

/**
 * Computes the return type of a partial key for a nested set.
 */
export type GetSetReturnType<T, V, Input> = (
	T extends any[] ? (Input extends any[] ? Nullable<SetReturnType<T, V, Input>, Len<Input>> : SetReturnType<T, V, [Input]>) :
	Map<T, Set<V>>
);

/**
 * Adds `undefined` to the given `T` type if the `Zero` type is not exactly 0.
 */
type Nullable<T, Zero> = Zero extends 0 ? T : T | undefined;

/**
 * Helper type that returns the length of the given tuple or array.
 */
type Len<T extends any[], Base extends number = 0> = (
	T extends [...infer H, any] ? Len<H, Increment<Base>> : Base
);

/**
 * Helper type that increments the given number by 1. It can only count up to 15 before returning a generic `number`.
 */
type Increment<N extends number> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, ...number[]][N];

/**
 * Computes all possible partial variants of the given key.
 */
export type PartialKey<T> = T extends any[] ? PartialKeyRecurse<T> : undefined;
type PartialKeyRecurse<T extends any[], Count extends number = 0, Tail extends any[] = [any]> = (
	Count extends 15 ? T : (
		T extends [...infer H, ...Tail] ? H | PartialKeyRecurse<T, Increment<Count>, [...Tail, any]> : []
	)
);
