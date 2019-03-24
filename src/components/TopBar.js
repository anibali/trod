import React from 'react';
import { connect } from 'react-redux';
import { Combobox } from 'evergreen-ui';

import { uiActions } from '../store/actions';
import TopBarStyle from '../styles/TopBar.css';


function TopBar(props) {
  const {
    currentExperimentId, allExperiments, setCurrentExperiment,
    setComparisonExperiments
  } = props;

  const onChange = (item) => {
    setCurrentExperiment(item);
    setComparisonExperiments([]);
  };

  const items = allExperiments.map(exp => exp.id);
  items.sort();

  return (
    <div className={TopBarStyle.TopBar}>
      <h1 className={TopBarStyle.brand}>Trod</h1>
      <Combobox
        items={items}
        selectedItem={currentExperimentId}
        onChange={onChange}
      />
    </div>
  );
}


export default connect(
  state => {
    const currentExperimentId = state.ui.currentExperiment;
    const allExperiments = Object.values(state.experiments.byId);
    return { currentExperimentId, allExperiments };
  },
  dispatch => ({
    setCurrentExperiment: (...args) => dispatch(uiActions.setCurrentExperiment(...args)),
    setComparisonExperiments: (...args) => dispatch(uiActions.setComparisonExperiments(...args)),
  }),
)(TopBar);
