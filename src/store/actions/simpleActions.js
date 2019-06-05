/**
 * This file contains "simple" action creators. An action creator is
 * considered simple if it:
 *   - Returns a single action object
 *   - Doesn't call other action creators
 */

import { createActions } from 'redux-actions';


const simpleActions = createActions({
  TROD: {
    UI: {
      SET_COMPARISON_EXPERIMENTS: experimentIds => experimentIds,
      SET_SMOOTHING_FACTOR: smoothingFactor => smoothingFactor,
      ADD_SMOOTHED_TRACE: traceName => traceName,
      REMOVE_SMOOTHED_TRACE: traceName => traceName,
    },
  }
});


export const uiActions = simpleActions.trod.ui;
