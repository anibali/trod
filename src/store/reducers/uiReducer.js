import { handleActions } from 'redux-actions';
import { freeze, assoc } from 'icepick';

import { uiActions } from '../actions';


const initialState = freeze({
  currentExperiment: 'exp1',
  comparisonExperiments: ['exp2'],
});


export default handleActions({
  [uiActions.setCurrentExperiment](state, { payload: { experimentId } }) {
    return assoc(state, 'currentExperiment', experimentId);
  }
}, initialState);
