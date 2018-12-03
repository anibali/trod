import React from 'react';
import { connect } from 'react-redux';
import { Button, SelectMenu } from 'evergreen-ui';
import uniq from 'lodash/uniq';
import without from 'lodash/without';
import reject from 'lodash/reject';

import SidebarStyle from '../styles/Sidebar.css';
import { uiActions } from '../store/actions';


function Sidebar(props) {
  const { comparisonExperiments, comparisonOptions, setComparisonExperiments } = props;

  const onSelect = (item) => {
    setComparisonExperiments(uniq(comparisonExperiments.concat([item.value])));
  };

  const onDeselect = (item) => {
    setComparisonExperiments(without(comparisonExperiments, item.value));
  };

  return (
    <aside className={SidebarStyle.Sidebar}>
      <SelectMenu
        isMultiSelect
        title="Other experiments"
        options={comparisonOptions.map(exp => ({ label: exp.id, value: exp.id }))}
        selected={comparisonExperiments}
        onSelect={onSelect}
        onDeselect={onDeselect}
      >
        <Button>{comparisonExperiments.join(', ') || '[None]'}</Button>
      </SelectMenu>
    </aside>
  );
}


export default connect(
  state => {
    const { comparisonExperiments } = state.ui;
    const comparisonOptions = reject(
      Object.values(state.experiments.byId), { id: state.ui.currentExperiment });
    return { comparisonExperiments, comparisonOptions };
  },
  dispatch => ({
    setComparisonExperiments: (...args) => dispatch(uiActions.setComparisonExperiments(...args)),
  }),
)(Sidebar);
