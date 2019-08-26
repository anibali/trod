import React from 'react';
import { connect } from 'react-redux';
import isEqual from 'lodash/isEqual';

import TopBar from './TopBar';
import ContentPane from './ContentPane';
import Sidebar from './Sidebar';

import { traceActions, experimentActions } from '../store/actions';
import Layout from '../styles/Layout.css';


class Experiment extends React.Component {
  componentDidMount() {
    const { experimentId, comparisonExperiments, fetchTraces, fetchExperiments } = this.props;
    fetchExperiments();
    if(experimentId != null) {
      fetchTraces(experimentId);
      comparisonExperiments.forEach(expId => fetchTraces(expId));
    }
  }

  componentDidUpdate(prevProps) {
    const { experimentId, comparisonExperiments, fetchTraces } = this.props;
    if(experimentId != null) {
      if(!prevProps.experimentId || experimentId !== prevProps.experimentId) {
        fetchTraces(experimentId);
      }
      if(!isEqual(comparisonExperiments, prevProps.comparisonExperiments)) {
        comparisonExperiments.forEach(expId => fetchTraces(expId));
      }
    }
  }

  render() {
    const { experimentId } = this.props;

    let inner = null;
    if(experimentId != null) {
      inner = (
        <>
          <ContentPane experimentId={experimentId} />
          <Sidebar experimentId={experimentId} />
        </>
      );
    }

    return (
      <div className={Layout.Wrapper}>
        <TopBar experimentId={experimentId} />
        <main className={Layout.Main}>{inner}</main>
      </div>
    );
  }
}


export default connect(
  state => ({
    comparisonExperiments: state.ui.comparisonExperiments,
  }),
  dispatch => ({
    fetchTraces: (...args) => dispatch(traceActions.fetchForExperiment(...args)),
    fetchExperiments: () => dispatch(experimentActions.fetchAll()),
  })
)(Experiment);
