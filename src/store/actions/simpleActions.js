/**
 * This file contains "simple" action creators. An action creator is
 * considered simple if it:
 *   - Returns a single action object
 *   - Doesn't call other action creators
 */

import flatten from 'lodash/flatten';

import { createActions } from 'redux-actions';


const simpleActions = createActions({
  TROD: {
    UI: {
      SET_COMPARISON_EXPERIMENTS: experimentIds => experimentIds,
      SET_SMOOTHING_FACTOR: smoothingFactor => smoothingFactor,
      ADD_SMOOTHED_TRACE: traceName => traceName,
      REMOVE_SMOOTHED_TRACE: traceName => traceName,
    },
    TRACE: {
      SET_REQUIRES_DATA_LOAD: (traceId, value) => ({ traceIds: flatten([traceId]), value }),
    }
  }
});


export const uiActions = simpleActions.trod.ui;
export const traceActions = simpleActions.trod.trace;
