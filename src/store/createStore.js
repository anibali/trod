import * as Redux from 'redux';
import ReduxThunk from 'redux-thunk';

import combinedReducers from './reducers';


export default (initialState) => {
  let composeEnhancers = Redux.compose;

  // Enable discovery of the Redux devtools browser extension when in
  // development mode.
  if(process.env.IN_BROWSER && process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-underscore-dangle
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || Redux.compose;
  }

  const store = Redux.createStore(
    combinedReducers,
    initialState,
    composeEnhancers(Redux.applyMiddleware(ReduxThunk)));

  return store;
};
