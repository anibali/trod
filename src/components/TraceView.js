import React from 'react';
import { connect } from 'react-redux';
import { thaw } from 'icepick';
import isEqual from 'lodash/isEqual';
import sortBy from 'lodash/sortBy';
import jsonpatch from 'fast-json-patch';

import PlotlyPlot from './PlotlyPlot';
import { traceDataActions } from '../store/actions';
import { getRequiredTraces, getTraceValues } from '../store/selectors';


class TraceView extends React.Component {
  componentDidMount() {
    const { traces, fetchTraceData } = this.props;
    traces.forEach(trace => {
      fetchTraceData(trace.traceData);
    });
  }

  componentDidUpdate(prevProps) {
    const { traces, fetchTraceData } = this.props;
    if(!isEqual(traces, prevProps.traces)) {
      traces.forEach(trace => {
        fetchTraceData(trace.traceData);
      });
    }
  }

  render() {
    const { traceValues, view } = this.props;

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
  (state, props) => ({
    traces: getRequiredTraces(state, props),
    traceValues: getTraceValues(state, props),
  }),
  (dispatch) => ({
    fetchTraceData: (...args) => dispatch(traceDataActions.fetch(...args)),
  })
)(TraceView);
