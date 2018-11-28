/**
 * This file contains "high level" action creators. An action creator is
 * considered high level if it:
 *   - Doesn't create actions directly
 *   - Calls one or more other action creators
 */

import axios from 'axios';
import { freeze, assign } from 'icepick';
import findIndex from 'lodash/findIndex';

import * as simple from './simpleActions';


export const traceActions = {
  fetch: traceName => async(dispatch, getState) => {
    const state = getState();
    const index = findIndex(state.traces, { name: traceName });
    if(index < 0) {
      dispatch(simple.traceActions.add(freeze(
        { name: traceName, isFetching: true }
      )));
      const res = await axios.get(`/traces/${traceName}`);
      dispatch(simple.traceActions.add(assign(
        res.data,
        { name: traceName, isFetching: false }
      )));
    }
    // TODO: Catch errors
  },
};

export const viewActions = {
  fetch: () => async(dispatch, getState) => {
    const state = getState();
    if(state.views.didInvalidate && !state.views.isFetching) {
      dispatch(simple.viewActions.set(freeze({ didInvalidate: false, isFetching: true, items: [] })));
      const res = await axios.get('/views');
      dispatch(simple.viewActions.set(freeze({ didInvalidate: false, isFetching: false, items: res.data })));
    }
    // TODO: Catch errors
  }
}
