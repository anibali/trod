import groupBy from 'lodash/groupBy';
import { freeze } from 'icepick';
import intersection from 'lodash/intersection';
import zip from 'lodash/zip';
import { bisectRight } from 'd3-array';

import { createSelector } from '../helpers/select';


export const getCurrentExperimentViews = createSelector(
  [
    state => state.views.byId,
    state => state.ui.currentExperiment,
  ],
  (views, currentExperiment) => {
    const groupedViews = groupBy(Object.values(views), 'experiment');
    return groupedViews[currentExperiment] || [];
  }
);


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


// Two-sided weighted moving average
const weightedMovingAverage = (xs, ys, smoothingFactor) => {
  const window = (2 ** smoothingFactor) + 1;
  const nSamples = (2 ** Math.max(smoothingFactor - 5, 5)) + 1;

  const newYs = new Array(ys.length);

  // Sum of weights for a window
  const wSum = (((nSamples - 1) / 2) + 1) ** 2;

  const xMin = xs[0];
  const xMax = xs[xs.length - 1];

  for(let i = 0; i < ys.length; ++i) {
    // Reduce window size when near edges. This helps to avoid inaccurate values at the graph
    // extremities at the cost of increased noise in those regions.
    const closestEdgeDist = Math.min(xs[i] - xMin, xMax - xs[i]);
    const curWindow = Math.min(window, closestEdgeDist * 2 + 1);

    // Stride between samples in a window (in x units)
    const stride = (curWindow - 1) / (nSamples - 1);

    const start = xs[i] - (curWindow - 1) / 2;
    const windowYs = new Array(nSamples);
    for(let j = 0; j < nSamples; ++j) {
      const x = start + j * stride;

      let ridx = bisectRight(xs, x);
      let lidx = ridx - 1;
      ridx = Math.min(ridx, xs.length - 1);
      lidx = Math.max(lidx, 0);

      if(lidx === ridx) {
        windowYs[j] = ys[lidx];
      } else {
        // Linear interpolation
        windowYs[j] = ys[lidx] + (x - xs[lidx]) * (ys[ridx] - ys[lidx]) / (xs[ridx] - xs[lidx]);
      }
    }
    let ySum = 0;
    for(let j = 0; j < nSamples; ++j) {
      const w = j < (nSamples - 1) / 2
        ? j + 1
        : nSamples - j;
      ySum += w * windowYs[j];
    }
    newYs[i] = ySum / wSum;
  }

  return newYs;
};


export const getTraceValues = createSelector(
  [
    getRequiredTraces,
    state => state.traceData.byId,
    state => state.ui.smoothedTraces,
    state => state.ui.smoothingFactor,
  ],
  (traces, traceData, smoothedTraces, smoothingFactor) => {
    const allDataAvailable = traces.every(trace => traceData[trace.traceData] != null);
    if(!allDataAvailable) {
      return {};
    }

    const valuesForTrace = (trace) => {
      const { steps, values } = traceData[trace.traceData];
      if(smoothedTraces.includes(trace.name)) {
        return weightedMovingAverage(steps, values, smoothingFactor);
      }
      return values;
    };

    // Find the steps shared by all traces.
    const commonSteps = intersection(...traces.map(trace => traceData[trace.traceData].steps));
    // Get the trace values for all common steps.
    const traceValues = {};
    traces.forEach(trace => {
      const valuesByStep = new Map(
        zip(traceData[trace.traceData].steps, valuesForTrace(trace)));
      if(traceValues[trace.experiment] === undefined) {
        traceValues[trace.experiment] = {};
      }
      traceValues[trace.experiment][trace.name] = commonSteps.map(step => valuesByStep.get(step));
    });
    return traceValues;
  }
);
