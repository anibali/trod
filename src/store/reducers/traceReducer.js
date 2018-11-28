import { handleActions } from 'redux-actions';
import { freeze, push, assoc } from 'icepick';
import findIndex from 'lodash/findIndex';

import { traceActions } from '../actions';


const initialState = freeze([]);


export default handleActions({
  [traceActions.add](state, { payload }) {
    const index = findIndex(state, { name: payload.trace.name });
    if(index < 0) {
      return push(state, payload.trace);
    }
    return assoc(state, index, payload.trace);
  },
}, initialState);
