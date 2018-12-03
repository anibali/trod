import groupBy from 'lodash/groupBy';
import { freeze } from 'icepick';
import intersection from 'lodash/intersection';
import zip from 'lodash/zip';

import { createSelector } from '../helpers/select';


export const getRequiredTraces = createSelector(
  [
    (state, props) => props.view.requiredTraces,
    state => state.ui.comparisonExperiments,
    state => state.ui.currentExperiment,
    state => state.traces.byId,
  ],
  (requiredTraces, comparisonExperiments, currentExperiment, tracesById) => {
    const activeExperiments = comparisonExperiments.concat([currentExperiment]);
    const traces = Object.values(tracesById).filter(trace => requiredTraces.includes(trace.name));
    const groupedTraces = groupBy(traces, 'experiment');
    let filteredTraces = [];
    Object.entries(groupedTraces).forEach(([k, vs]) => {
      // Filter out all experiments that don't have ALL of the required traces
      // and all traces that are not for the current/comparison experiments.
      if(vs.length === requiredTraces.length && activeExperiments.includes(k)) {
        filteredTraces = filteredTraces.concat(vs);
      }
    });
    return freeze(filteredTraces);
  }
);


export const getTraceValues = createSelector(
  [
    getRequiredTraces,
    state => state.traceData.byId,
  ],
  (traces, traceData) => {
    const allDataAvailable = traces.every(trace => traceData[trace.traceData] != null);
    if(!allDataAvailable) {
      return {};
    }

    // Find the steps shared by all traces.
    const commonSteps = intersection(...traces.map(trace => traceData[trace.traceData].steps));
    // Get the trace values for all common steps.
    const traceValues = {};
    traces.forEach(trace => {
      const valuesByStep = new Map(
        zip(traceData[trace.traceData].steps, traceData[trace.traceData].values));
      if(traceValues[trace.experiment] === undefined) {
        traceValues[trace.experiment] = {};
      }
      traceValues[trace.experiment][trace.name] = commonSteps.map(step => valuesByStep.get(step));
    });
    return traceValues;
  }
);
