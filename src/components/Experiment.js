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
    const { experiment, comparisonExperiments, fetchTraces, fetchExperiments } = this.props;
    fetchExperiments();
    if(experiment) {
      fetchTraces(experiment.id);
      comparisonExperiments.forEach(exp => fetchTraces(exp.id));
    }
  }

  componentDidUpdate(prevProps) {
    const { experiment, comparisonExperiments, fetchTraces } = this.props;
    if(experiment) {
      if(!prevProps.experiment || experiment.id !== prevProps.experiment.id) {
        fetchTraces(experiment.id);
      }
      if(!isEqual(comparisonExperiments, prevProps.comparisonExperiments)) {
        comparisonExperiments.forEach(exp => fetchTraces(exp.id));
      }
    }
  }

  render() {
    const { experiment } = this.props;

    let inner = null;
    if(experiment) {
      inner = (<>
        <ContentPane experiment={experiment} />
        <Sidebar />
      </>);
    }

    return (
      <div className={Layout.Wrapper}>
        <TopBar />
        <main className={Layout.Main}>{inner}</main>
      </div>
    );
  }
}


export default connect(
  state => {
    const experiment = state.ui.currentExperiment
      ? { id: state.ui.currentExperiment }
      : null;
    const comparisonExperiments = state.ui.comparisonExperiments.map(id => ({ id }));
    return { experiment, comparisonExperiments };
  },
  dispatch => ({
    fetchTraces: (...args) => dispatch(traceActions.fetchForExperiment(...args)),
    fetchExperiments: () => dispatch(experimentActions.fetchAll()),
  })
)(Experiment);
