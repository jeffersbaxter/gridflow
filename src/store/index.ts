import { combineReducers, configureStore } from '@reduxjs/toolkit';
import sheetReducer from '../features/sheet/sheetSlice';
import agentsReducer from '../features/agents/agentsSlice';

export const rootReducer = combineReducers({
  sheet: sheetReducer,
  agents: agentsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore['dispatch'];
export type AppStore = ReturnType<typeof makeStore>;

/** Factory used by app + tests to spin up a store with optional preloaded state. */
export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({ reducer: rootReducer, preloadedState });
}

export const store = makeStore();
