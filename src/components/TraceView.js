import React from 'react';
import { connect } from 'react-redux';
import { thaw, freeze } from 'icepick';
import groupBy from 'lodash/groupBy';
import zip from 'lodash/zip';
import isEqual from 'lodash/isEqual';
import intersection from 'lodash/intersection';
import sortBy from 'lodash/sortBy';
import jsonpatch from 'fast-json-patch';

import PlotlyPlot from './PlotlyPlot';
import { traceDataActions } from '../store/actions';


class TraceView extends React.Component {
  componentDidMount() {
    const { traces, fetchTraceData } = this.props;
    traces.forEach(trace => {
      fetchTraceData(trace.traceData);
    });
  }

  componentDidUpdate(prevProps) {
    const { traces, fetchTraceData } = this.props;
    // TODO: If we use a selector to cache filteredTraces, we can short-circuit the common
    //       case where traces don't change without doing a deep comparison.
    if(!isEqual(traces, prevProps.traces)) {
      traces.forEach(trace => {
        fetchTraceData(trace.traceData);
      });
    }
  }

  render() {
    const { traces, traceData, view } = this.props;

    // TODO: Check if TraceData is loaded instead
    const loaded = traces.every(trace => traceData[trace.traceData] != null);
    if(!loaded) {
      return <PlotlyPlot data={[]} />;
    }

    // Find the steps shared by all traces.
    const commonSteps = intersection(...traces.map(trace => traceData[trace.traceData].steps));
    // Get the trace values for all common steps.
    const traceValues = {};
    traces.forEach(trace => {
      const valuesByStep = new Map(zip(traceData[trace.traceData].steps, traceData[trace.traceData].values));
      if(traceValues[trace.experiment] === undefined) {
        traceValues[trace.experiment] = {};
      }
      traceValues[trace.experiment][trace.name] = commonSteps.map(step => valuesByStep.get(step));
    });

    const specs = Object.entries(traceValues).map(([expId, vs]) => {
      // Substitute trace values into the Plotly spec.
      const patch = view.settings.injectTraces.map(({ path, trace }) => ({
        op: 'add',
        path,
        value: vs[trace],
      }));
      const patchedSpec = jsonpatch.applyPatch(thaw(view.settings.graphSpec), patch).newDocument;
      if(patchedSpec.name == null) {
        patchedSpec.name = expId;
      } else {
        patchedSpec.name = `${expId}/${patchedSpec.name}`;
      }
      return patchedSpec;
    });

    return <PlotlyPlot data={sortBy(specs, 'name')} />;
  }
}

export default connect(
  (state, ownProps) => {
    const { requiredTraces } = ownProps.view;
    const experimentIds = state.ui.comparisonExperiments.concat([state.ui.currentExperiment]);
    const traces = Object.values(state.traces.byId)
      .filter(trace => requiredTraces.includes(trace.name));
    const groupedTraces = groupBy(traces, 'experiment');
    let filteredTraces = [];
    Object.entries(groupedTraces).forEach(([k, vs]) => {
      // Filter out all experiments that don't have ALL of the required traces
      // and all traces that are not for the current/comparison experiments.
      if(vs.length === requiredTraces.length && experimentIds.includes(k)) {
        filteredTraces = filteredTraces.concat(vs);
      }
    });
    return { traces: freeze(filteredTraces), traceData: state.traceData.byId };
  },
  (dispatch) => ({
    fetchTraceData: (...args) => dispatch(traceDataActions.fetch(...args)),
  })
)(TraceView);
