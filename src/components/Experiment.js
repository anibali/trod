import React from 'react';
import { connect } from 'react-redux';

import TopBar from './TopBar';
import ContentPane from './ContentPane';
import Sidebar from './Sidebar';

import { traceActions, experimentActions } from '../store/actions';
import Layout from '../styles/Layout.css';
import isEqual from 'lodash/isEqual';


class Experiment extends React.Component {
  componentDidMount() {
    const { experiment, comparisonExperiments, fetchTraces, fetchExperiments } = this.props;
    fetchExperiments();
    fetchTraces(experiment.id);
    comparisonExperiments.forEach(exp => fetchTraces(exp.id));
  }

  componentDidUpdate(prevProps) {
    const { experiment, comparisonExperiments, fetchTraces } = this.props;
    if(experiment.id !== prevProps.experiment.id) {
      fetchTraces(experiment.id);
    }
    if(!isEqual(comparisonExperiments, prevProps.comparisonExperiments)) {
      comparisonExperiments.forEach(exp => fetchTraces(exp.id));
    }
  }

  render() {
    const { experiment } = this.props;

    return (
      <div className={Layout.Wrapper}>
        <TopBar />
        <main className={Layout.Main}>
          <ContentPane experiment={experiment} />
          <Sidebar />
        </main>
      </div>
    );
  }
}


export default connect(
  state => {
    const experiment = { id: state.ui.currentExperiment };
    const comparisonExperiments = state.ui.comparisonExperiments.map(id => ({ id }));
    return { experiment, comparisonExperiments };
  },
  dispatch => ({
    fetchTraces: (...args) => dispatch(traceActions.fetchForExperiment(...args)),
    fetchExperiments: () => dispatch(experimentActions.fetchAll()),
  })
)(Experiment);
