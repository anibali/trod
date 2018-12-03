import { handleActions } from 'redux-actions';
import { freeze, assoc } from 'icepick';

import { uiActions } from '../actions';


const initialState = freeze({
  currentExperiment: 'exp1',
  comparisonExperiments: [],
});


export default handleActions({
  [uiActions.setCurrentExperiment](state, { payload: { experimentId } }) {
    return assoc(state, 'currentExperiment', experimentId);
  },
  [uiActions.setComparisonExperiments](state, { payload: { experimentIds } }) {
    return assoc(state, 'comparisonExperiments', experimentIds);
  }
}, initialState);
