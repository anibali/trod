import groupBy from 'lodash/groupBy';
import sortedIndexOf from 'lodash/sortedIndexOf';
import sortBy from 'lodash/sortBy';
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


export const getCurrentExperimentTraces = createSelector(
  [
    state => state.traces.byId,
    state => state.ui.currentExperiment,
  ],
  (traces, currentExperiment) => {
    const groupedTraces = groupBy(Object.values(traces), 'experiment');
    return groupedTraces[currentExperiment] || [];
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
    return filteredTraces;
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
    // Return early if any of the data is not yet available.
    if(!traces.every(trace => traceData[trace.traceData] != null)) {
      return {};
    }

    // Prepare the nested structure of traceValues.
    const traceValues = {};
    traces.forEach(trace => {
      if(traceValues[trace.experiment] == null) {
        traceValues[trace.experiment] = {};
      }
      traceValues[trace.experiment][trace.name] = [];
    });

    // Ordering traces by number of data points makes finding common steps faster.
    traces = sortBy(traces, trace => traceData[trace.traceData].steps.length);

    const stepses = traces.map(trace => traceData[trace.traceData].steps);
    const valueses = traces.map(trace => {
      const { steps, values } = traceData[trace.traceData];
      if(smoothedTraces.includes(trace.name) && !values.some(Number.isNaN)) {
        return weightedMovingAverage(steps, values, smoothingFactor);
      }
      return values;
    });

    if(stepses.length > 0) {
      for(let i = 0; i < stepses[0].length; ++i) {
        const step = stepses[0][i];
        const indices = [i];
        for(let j = 1; j < stepses.length; ++j) {
          // NOTE: Given a better binary search function, we could limit the
          //       starting bound of the search range as we proceed. However,
          //       this isn't really a performance bottleneck right now.
          const index = sortedIndexOf(stepses[j], step);
          if(index < 0) {
            break;
          } else {
            indices.push(index);
          }
        }
        // If each trace contains data points at this step, take those points.
        if(indices.length === valueses.length) {
          for(let j = 0; j < valueses.length; ++j) {
            const index = indices[j];
            const trace = traces[j];
            traceValues[trace.experiment][trace.name].push(valueses[j][index]);
          }
        }
      }
    }

    return traceValues;
  }
);
