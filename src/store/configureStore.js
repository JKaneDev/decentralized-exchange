import { applyMiddleware, compose } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import rootReducer from './reducers';

const loggerMiddleware = createLogger();
const middleware = [];

// For Redux DevTools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default function createStore(preloadedState) {
	return configureStore({
		reducer: rootReducer,
		preloadedState: preloadedState,
		enhancer: composeEnhancers(
			applyMiddleware(...middleware, loggerMiddleware)
		),
	});
}
