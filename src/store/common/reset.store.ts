import { create as _create } from "zustand";
import type { StateCreator } from "zustand";

const storeResetFns = new Set<() => void>();

/// Called on admin sign-out so no screen state survives into the next session.
export const resetAllStores = () => {
  storeResetFns.forEach((resetFn) => resetFn());
};

/// Accepts both zustand call shapes: `create(creator)` and the curried
/// `create()(creator)` the middleware form needs. Either way the store's
/// initial state is captured so `resetAllStores` can put it back.
export const create = (<T,>(stateCreator?: StateCreator<T>) => {
  const createStore = (creator: StateCreator<T>) => {
    const store = _create(creator);
    const initialState = store.getState();
    storeResetFns.add(() => {
      store.setState(initialState, true);
    });
    return store;
  };

  return stateCreator ? createStore(stateCreator) : createStore;
}) as typeof _create;
