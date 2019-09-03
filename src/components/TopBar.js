import React from 'react';
import { connect } from 'react-redux';
import { Combobox, Button } from 'evergreen-ui';

import { uiActions, traceActions } from '../store/actions';
import TopBarStyle from '../styles/TopBar.css';


function TopBar(props) {
  const {
    experimentId, allExperiments, setCurrentExperiment,
    setComparisonExperiments, reloadAllData
  } = props;

  const onChange = (item) => {
    setCurrentExperiment(item);
    setComparisonExperiments([]);
  };

  const onReloadClick = () => {
    reloadAllData();
  };

  const items = allExperiments.map(exp => exp.id);
  items.sort();

  return (
    <div className={TopBarStyle.TopBar}>
      <h1 className={TopBarStyle.brand}><a href="/">Trod</a></h1>
      <Combobox
        items={items}
        selectedItem={experimentId}
        onChange={onChange}
      />
      <Button iconBefore="refresh" onClick={onReloadClick}>Reload</Button>
    </div>
  );
}


export default connect(
  state => ({
    allExperiments: Object.values(state.experiments.byId),
  }),
  dispatch => ({
    setCurrentExperiment: (...args) => dispatch(uiActions.setCurrentExperiment(...args)),
    setComparisonExperiments: (...args) => dispatch(uiActions.setComparisonExperiments(...args)),
    reloadAllData: (...args) => dispatch(traceActions.reloadAllData(...args)),
  }),
)(TopBar);
