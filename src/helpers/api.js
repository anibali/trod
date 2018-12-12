import axios from 'axios';
import { createActions, handleActions } from 'redux-actions';
import produce from 'immer';
import merge from 'lodash/merge';
import { matchPath } from 'react-router';


export const apiActions = createActions({
  API: {
    FETCH: path => ({ path }),
    SET_ENDPOINT_STATUS: (path, status) => ({ path, status }),
    HANDLE_RESPONSE: (path, data) => ({ path, data }),
  }
}).api;


const initialState = {
  endpoints: {},
};

export const apiReducer = handleActions({
  [apiActions.setEndpointStatus]: produce((draft, { payload }) => {
    merge(draft.endpoints, { [payload.path]: { status: payload.status } });
  }),
}, initialState);


export const apiMiddleware = store => next => action => {
  if(action.type !== apiActions.fetch.toString()) {
    next(action);
    return;
  }

  const state = store.getState();
  const { path } = action.payload;
  const endpoint = state.api.endpoints[path];
  if(endpoint == null || endpoint.status === 'invalidated' || endpoint.status === 'errored') {
    store.dispatch(apiActions.setEndpointStatus(path, 'requested'));
    axios.get(path)
      .then((res) => {
        store.dispatch(apiActions.setEndpointStatus(path, 'received'));
        store.dispatch(apiActions.handleResponse(path, res.data));
      })
      .catch((err) => {
        console.error(err);
        store.dispatch(apiActions.setEndpointStatus(path, 'errored'));
      });
  }
};


export const apiResponseHandler = (path, handler) => (state, { payload }) => {
  const match = matchPath(payload.path, { path, exact: true });
  if(match == null) {
    return state;
  }
  return handler(state, payload.data, match.params);
};
