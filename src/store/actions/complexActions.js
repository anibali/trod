/**
 * This file contains "high level" action creators. An action creator is
 * considered high level if it:
 *   - Doesn't create actions directly
 *   - Calls one or more other action creators
 */

import { apiActions } from '../../helpers/api';


export const traceActions = {
  fetchForExperiment: experimentId => apiActions.fetch(`/experiments/${experimentId}/traces`),
};


export const traceDataActions = {
  fetch: traceDataId => apiActions.fetch(`/tracedata/${traceDataId}`),
};


export const viewActions = {
  fetchForExperiment: experimentId => apiActions.fetch(`/experiments/${experimentId}/views`),
};


export const experimentActions = {
  fetchAll: () => apiActions.fetch('/experiments'),
};
