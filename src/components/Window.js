import React from 'react';
import { connect } from 'react-redux';

import { traceDataActions, traceActions } from '../store/actions';
import { getRequiredTraces, getTraceValues } from '../store/selectors';
import WindowStyle from '../styles/Window.css';
import { viewComponents } from './traceViews';


class Window extends React.Component {
  fetchDataIfNeeded() {
    const { traces, fetchTraceData, setTraceRequiresDataLoad } = this.props;
    const tracesRequiringDataLoad = traces.filter(trace => trace.requiresDataLoad);
    if(tracesRequiringDataLoad.length > 0) {
      setTraceRequiresDataLoad(tracesRequiringDataLoad.map(trace => trace.id), false);
      tracesRequiringDataLoad.map(trace => fetchTraceData(trace.traceData));
    }
  }

  componentDidMount() {
    this.fetchDataIfNeeded();
  }

  componentDidUpdate() {
    this.fetchDataIfNeeded();
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
      <div className={WindowStyle.FullHeight}>
        <div className={WindowStyle.TitleBar}>{view.name}</div>
        <div className={WindowStyle.Content}>
          {viewComponent}
        </div>
      </div>
    );
  }
}

export default connect(
  (state, props) => ({
    traces: getRequiredTraces(state, props),
    traceValues: getTraceValues(state, props),
  }),
  (dispatch) => ({
    fetchTraceData: (...args) => dispatch(traceDataActions.fetch(...args)),
    setTraceRequiresDataLoad: (...args) => dispatch(traceActions.setRequiresDataLoad(...args))
  })
)(Window);
