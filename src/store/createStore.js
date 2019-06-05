import * as Redux from 'redux';
import ReduxThunk from 'redux-thunk';
import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';

import createRootReducer from './reducers';
import { apiMiddleware } from '../helpers/api';


export const history = createBrowserHistory();


export default (initialState) => {
  let composeEnhancers = Redux.compose;

  // Enable discovery of the Redux devtools browser extension when in
  // development mode.
  if(process.env.IN_BROWSER && process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-underscore-dangle
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || Redux.compose;
  }

  return Redux.createStore(
    createRootReducer(history),
    initialState,
    composeEnhancers(Redux.applyMiddleware(
      routerMiddleware(history),
      ReduxThunk,
      apiMiddleware,
    )));
};
