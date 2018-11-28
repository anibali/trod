import React from 'react';
import { connect } from 'react-redux';
import { merge } from 'icepick';
import find from 'lodash/find';
import zip from 'lodash/zip';
import intersection from 'lodash/intersection';

import PlotlyPlot from './PlotlyPlot';
import { traceActions } from '../store/actions';


class TraceView extends React.Component {
  componentDidMount() {
    const { traces, view, fetchTrace } = this.props;

    view.requiredTraces.forEach((name, i) => {
      if(!traces[i]) {
        fetchTrace(name);
      }
    });
  }

  render() {
    const { traces, view } = this.props;

    const loaded = traces.every(e => e && !e.isFetching);
    if(!loaded) {
      return <div>Loading...</div>;
    }

    // TODO: Optimise the handling of traces

    // Find the steps shared by all traces.
    const commonSteps = intersection(...traces.map(trace => trace.steps));
    // Get the trace values for all common steps.
    const traceValues = {};
    traces.forEach(trace => {
      const valuesByStep = new Map(zip(trace.steps, trace.values));
      traceValues[trace.name] = commonSteps.map(step => valuesByStep.get(step));
    });

    // Substitute trace values into the Plotly spec.
    const spec = merge(view.settings.spec, view.settings.substitute,
      (targetVal, sourceVal) => traceValues[sourceVal]);

    return <PlotlyPlot data={[spec]} />;
  }
}

export default connect(
  (state, ownProps) => {
    const { requiredTraces } = ownProps.view;
    const traces = requiredTraces.map(name => find(state.traces, { name }));
    return { traces };
  },
  (dispatch) => ({
    fetchTrace: (...args) => dispatch(traceActions.fetch(...args)),
  })
)(TraceView);
