import React from 'react';
import { connect } from 'react-redux';
import { Combobox } from 'evergreen-ui';

import { uiActions } from '../store/actions';
import TopBarStyle from '../styles/TopBar.css';


class TopBar extends React.Component {
  render() {
    const { currentExperimentId, allExperiments, setCurrentExperiment } = this.props;
    return (
      <div className={TopBarStyle.TopBar}>
        <h1>Trod</h1>
        <Combobox
          items={allExperiments.map(exp => exp.id)}
          selectedItem={currentExperimentId}
          onChange={setCurrentExperiment}
        />
      </div>
    );
  }
}


export default connect(
  state => {
    const currentExperimentId = state.ui.currentExperiment;
    const allExperiments = Object.values(state.experiments.byId);
    return { currentExperimentId, allExperiments };
  },
  dispatch => ({
    setCurrentExperiment: (...args) => dispatch(uiActions.setCurrentExperiment(...args)),
  }),
)(TopBar);
