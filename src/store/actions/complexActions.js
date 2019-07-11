/**
 * This file contains "high level" action creators. An action creator is
 * considered high level if it:
 *   - Doesn't create actions directly
 *   - Calls one or more other action creators
 */

import { push } from 'connected-react-router';

import { apiActions } from '../../helpers/api';
import { traceActions as simpleTraceActions } from './simpleActions';


export const traceActions = {
  fetchForExperiment: experimentId => apiActions.fetch(`/experiments/${experimentId}/traces`),
  reloadAllData: () => (dispatch, getState) => {
    dispatch(apiActions.setEndpointStatus(
      Object.keys(getState().traceData.byId).map(id => `/tracedata/${id}`),
      'invalidated'
    ));
    dispatch(simpleTraceActions.setRequiresDataLoad(
      Object.keys(getState().traces.byId),
      true
    ));
  }
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


export const uiActions = {
  setCurrentExperiment: experimentId => push(`/c/experiments/${experimentId}`),
};
