import React from 'react';
import { connect } from 'react-redux';
import isEqual from 'lodash/isEqual';

import { traceDataActions } from '../store/actions';
import { getRequiredTraces, getTraceValues } from '../store/selectors';
import WindowStyle from '../styles/Window.css';
import { viewComponents } from './traceViews';


class Window extends React.Component {
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

    let viewComponent = null;
    if(Object.prototype.hasOwnProperty.call(viewComponents, view.type)) {
      const ViewComponent = viewComponents[view.type];
      viewComponent = <ViewComponent view={view} traceValues={traceValues} />;
    } else {
      viewComponent = (
        <div>
          ERROR: Unrecognised view type
          {` "${view.type}"`}
          .
        </div>
      );
    }

    return (
      <div className={WindowStyle.Outer}>
        <div className={WindowStyle.TitleBar}>{view.name}</div>
        <div className={WindowStyle.Content}>
          {viewComponent}
        </div>
      </div>);
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
)(Window);
