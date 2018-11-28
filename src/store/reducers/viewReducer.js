import { handleActions } from 'redux-actions';
import { freeze } from 'icepick';

import { viewActions } from '../actions';


const initialState = freeze({
  didInvalidate: true,
  isFetching: false,
  items: [],
});

export default handleActions({
  [viewActions.set](state, { payload }) {
    return payload.views;
  },
}, initialState);
