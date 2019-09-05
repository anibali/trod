import React from 'react';
import { connect } from 'react-redux';
import { Spinner } from 'evergreen-ui';

import { traceDataActions, traceActions } from '../store/actions';
import { getRequiredTraces, getTraceValues, getActiveApiRequestCount } from '../store/selectors';
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
    const { traceValues, view, nActiveRequests } = this.props;

    let viewComponent = null;
    if(nActiveRequests > 0) {
      viewComponent = (
        <Spinner className={WindowStyle.Centred} />
      );
    } else if(Object.prototype.hasOwnProperty.call(viewComponents, view.type)) {
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
    nActiveRequests: getActiveApiRequestCount(state),
  }),
  (dispatch) => ({
    fetchTraceData: (...args) => dispatch(traceDataActions.fetch(...args)),
    setTraceRequiresDataLoad: (...args) => dispatch(traceActions.setRequiresDataLoad(...args))
  })
)(Window);
