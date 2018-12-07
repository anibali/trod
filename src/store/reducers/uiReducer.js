import { handleActions } from 'redux-actions';
import { freeze, assoc } from 'icepick';
import uniq from 'lodash/uniq';
import without from 'lodash/without';

import { uiActions } from '../actions';


const initialState = freeze({
  currentExperiment: 'exp1',
  comparisonExperiments: [],
  // TODO: Remove this default and add a UI widget for selecting traces to smooth
  smoothedTraces: ['loss'],
  smoothingFactor: 10,
});


export default handleActions({
  [uiActions.setCurrentExperiment](state, { payload }) {
    return assoc(state, 'currentExperiment', payload);
  },
  [uiActions.setComparisonExperiments](state, { payload }) {
    return assoc(state, 'comparisonExperiments', payload);
  },
  [uiActions.setSmoothingFactor](state, { payload }) {
    return assoc(state, 'smoothingFactor', payload);
  },
  [uiActions.addSmoothedTrace](state, { payload }) {
    return assoc(state, 'smoothedTraces', uniq(state.smoothedTraces.concat([payload])));
  },
  [uiActions.removeSmoothedTrace](state, { payload }) {
    return assoc(state, 'smoothedTraces', without(state.smoothedTraces, payload));
  },
}, initialState);
