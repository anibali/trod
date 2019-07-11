import { handleActions } from 'redux-actions';
import produce from 'immer';

import { apiActions, apiResponseHandler } from '../../helpers/api';
import { traceActions } from '../actions';


const initialState = {
  byId: {},
};


export default handleActions({
  [apiActions.handleResponse]: apiResponseHandler('/experiments/:id/traces', produce((draft, data) => {
    data.forEach(trace => {
      trace.requiresDataLoad = true;
      draft.byId[trace.id] = trace;
    });
  })),
  [traceActions.setRequiresDataLoad]: produce((draft, { payload: { traceIds, value } }) => {
    traceIds.forEach(id => {
      draft.byId[id].requiresDataLoad = value;
    });
  }),
}, initialState);
