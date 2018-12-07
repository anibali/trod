import React from 'react';
import { connect } from 'react-redux';
import RcSlider, { createSliderWithTooltip } from 'rc-slider';
import uniq from 'lodash/uniq';
import without from 'lodash/without';
import reject from 'lodash/reject';
import sortBy from 'lodash/sortBy';

import Collapse from './Collapse';
import SelectList from './SelectList';
import SidebarStyle from '../styles/Sidebar.css';
import { uiActions } from '../store/actions';
import { getCurrentExperimentTraces } from '../store/selectors';

import '../styles/rc-slider.global.css';


const Slider = createSliderWithTooltip(RcSlider);

const Sidebar = (props) => {
  const { comparisonExperiments, allOtherExperiments, setComparisonExperiments,
    smoothingFactor, setSmoothingFactor, smoothedTraces, traces, addSmoothedTrace,
    removeSmoothedTrace } = props;

  const onSelectComparison = (item) => {
    setComparisonExperiments(uniq(comparisonExperiments.concat([item.value])));
  };
  const onDeselectComparison = (item) => {
    setComparisonExperiments(without(comparisonExperiments, item.value));
  };
  const comparisonOptions = allOtherExperiments.map(exp => ({ label: exp.id, value: exp.id }));

  const onSelectSmooth = (item) => {
    addSmoothedTrace(item.value);
  };
  const onDeselectSmooth = (item) => {
    removeSmoothedTrace(item.value);
  };
  const smoothOptions = traces.map(trace => ({ label: trace.name, value: trace.name }));

  return (
    <aside className={SidebarStyle.Sidebar}>
      <Collapse label="Comparison experiments">
        <SelectList
          options={comparisonOptions}
          selected={comparisonExperiments}
          onSelect={onSelectComparison}
          onDeselect={onDeselectComparison}
        />
      </Collapse>
      <Collapse label="Smoothing">
        <Slider step={1} min={0} max={15} value={smoothingFactor} onChange={setSmoothingFactor} />
        <SelectList
          options={smoothOptions}
          selected={smoothedTraces}
          onSelect={onSelectSmooth}
          onDeselect={onDeselectSmooth}
        />
      </Collapse>
    </aside>
  );
};


export default connect(
  state => {
    const { comparisonExperiments, smoothingFactor, smoothedTraces } = state.ui;
    const allOtherExperiments = reject(
      Object.values(state.experiments.byId), { id: state.ui.currentExperiment });
    const traces = sortBy(getCurrentExperimentTraces(state), 'name');
    return { comparisonExperiments, allOtherExperiments, smoothingFactor, smoothedTraces, traces };
  },
  dispatch => ({
    setComparisonExperiments: (...args) => dispatch(uiActions.setComparisonExperiments(...args)),
    setSmoothingFactor: (...args) => dispatch(uiActions.setSmoothingFactor(...args)),
    addSmoothedTrace: (...args) => dispatch(uiActions.addSmoothedTrace(...args)),
    removeSmoothedTrace: (...args) => dispatch(uiActions.removeSmoothedTrace(...args)),
  }),
)(Sidebar);
