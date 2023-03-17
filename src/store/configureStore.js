import { createStore, applyMiddleware, compose } from 'react-redux';
import { createLogger } from 'redux-logger';
import rootReducer from './reducers';

const loggerMiddleware = createLogger();
const middleware = [];

// For Redux DevTools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default function configureStore() {
	return createStore(
		rootReducer,
		preloadedState,
		composeEnhancers(applyMiddleware(...middleware, loggerMiddleware))
	);
}
