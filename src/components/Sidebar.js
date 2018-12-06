import React from 'react';
import { connect } from 'react-redux';
import { Heading, Icon, Pane, Table, Text } from 'evergreen-ui';
import uniq from 'lodash/uniq';
import without from 'lodash/without';
import reject from 'lodash/reject';

import SidebarStyle from '../styles/Sidebar.css';
import { uiActions } from '../store/actions';


const ExperimentRow = React.memo(({ label, value, selected, onSelect, onDeselect }) => {
  const selectionHandler = () => {
    if(!selected && onSelect != null) {
      onSelect({ label, value });
    }
    if(selected && onDeselect != null) {
      onDeselect({ label, value });
    }
  };

  return (
    <Table.Row key={value} height={32} isSelectable onSelect={selectionHandler}>
      <Table.Cell flexBasis={40} flexGrow={0}>
        {selected ? <Icon icon="tick" /> : null}
      </Table.Cell>
      <Table.TextCell>{label}</Table.TextCell>
    </Table.Row>
  );
});

class SelectExperiments extends React.Component {
  constructor(props) {
    super(props);
    this.state = { filterText: '' };

    // This indirection prevents changes to props.{onSelect,onDeselect} causing all rows
    // to rerender.
    this.onSelect = (...args) => {
      const { onSelect } = this.props;
      onSelect(...args);
    };
    this.onDeselect = (...args) => {
      const { onDeselect } = this.props;
      onDeselect(...args);
    };

    this.onFilterChange = (filterText) => {
      this.setState({ filterText });
    };
  }

  render() {
    const { options, selected } = this.props;
    const { filterText } = this.state;

    const filteredOptions = options.filter(option => option.label.includes(filterText));

    const rows = filteredOptions.map(option => (
      <ExperimentRow
        key={option.value}
        label={option.label}
        value={option.value}
        selected={selected.includes(option.value)}
        onSelect={this.onSelect}
        onDeselect={this.onDeselect}
      />
    ));

    return (
      <Pane border background="tint1">
        <Table>
          <Table.Head>
            <Table.TextHeaderCell flexBasis={40} flexGrow={0} />
            <Table.SearchHeaderCell value={filterText} onChange={this.onFilterChange} />
          </Table.Head>
          <Table.Body height={240}>
            {rows}
          </Table.Body>
        </Table>
      </Pane>
    );
  }
}

const Sidebar = (props) => {
  const { comparisonExperiments, comparisonOptions, setComparisonExperiments } = props;
  const onSelect = (item) => {
    setComparisonExperiments(uniq(comparisonExperiments.concat([item.value])));
  };
  const onDeselect = (item) => {
    setComparisonExperiments(without(comparisonExperiments, item.value));
  };
  const options = comparisonOptions.map(exp => ({ label: exp.id, value: exp.id }));
  // TODO: Make comparison experiments collapsible
  return (
    <aside className={SidebarStyle.Sidebar}>
      <span style={{ display: 'flex', alignItems: 'center', paddingBottom: 8 }}>
        <Icon icon="chevron-down" />
        <Text size={400}>Comparison experiments</Text>
      </span>
      <SelectExperiments
        options={options}
        selected={comparisonExperiments}
        onSelect={onSelect}
        onDeselect={onDeselect}
      />
    </aside>
  );
};


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
