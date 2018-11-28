/**
 * This file contains "simple" action creators. An action creator is
 * considered simple if it:
 *   - Returns a single action object
 *   - Doesn't call other action creators
 */

import { createActions } from 'redux-actions';


const simpleActions = createActions({
  TROD: {
    TRACES: {
      ADD: trace => ({ trace }),
    },
    VIEWS: {
      SET: views => ({ views }),
    }
  }
});


export const traceActions = simpleActions.trod.traces;
export const viewActions = simpleActions.trod.views;
