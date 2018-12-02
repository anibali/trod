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
      SET_CURRENT_EXPERIMENT: experimentId => ({ experimentId }),
    },
  }
});


export const uiActions = simpleActions.trod.ui;
// FIXME: Exports for all reducers
