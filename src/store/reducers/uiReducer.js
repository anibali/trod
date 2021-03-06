import { handleActions } from 'redux-actions';
import produce from 'immer';
import pull from 'lodash/pull';

import { uiActions } from '../actions';


const initialState = {
  comparisonExperiments: [],
  smoothedTraces: [],
  smoothingFactor: 10,
};


export default handleActions({
  [uiActions.setComparisonExperiments]: produce((draft, { payload }) => {
    draft.comparisonExperiments = payload;
  }),
  [uiActions.setSmoothingFactor]: produce((draft, { payload }) => {
    draft.smoothingFactor = payload;
  }),
  [uiActions.addSmoothedTrace]: produce((draft, { payload }) => {
    if(!draft.smoothedTraces.includes(payload)) {
      draft.smoothedTraces.push(payload);
    }
  }),
  [uiActions.removeSmoothedTrace]: produce((draft, { payload }) => {
    pull(draft.smoothedTraces, payload);
  }),
}, initialState);
