import React from 'react';
import { connect } from 'react-redux';

import TopBar from './TopBar';
import ContentPane from './ContentPane';
import Sidebar from './Sidebar';

import { traceActions } from '../store/actions';
import Layout from '../styles/Layout.css';


class Experiment extends React.Component {
  componentDidMount() {
    const { experiment, comparisonExperiments, fetchTraces } = this.props;
    fetchTraces(experiment.id);
    comparisonExperiments.forEach(exp => fetchTraces(exp.id));
  }

  render() {
    const { experiment } = this.props;

    return (
      <div className={Layout.Wrapper}>
        <TopBar experiment={experiment} />
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
  })
)(Experiment);
