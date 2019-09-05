import React from 'react';
import { Checkbox, Pane, Table, Tooltip } from 'evergreen-ui';


const SelectListItem = React.memo(({ label, value, selected, onSelect, onDeselect }) => {
  const selectionHandler = () => {
    if(!selected && onSelect != null) {
      onSelect({ label, value });
    }
    if(selected && onDeselect != null) {
      onDeselect({ label, value });
    }
  };

  return (
    <Table.Row key={value} height={32}>
      <Table.Cell flexBasis={40} flexGrow={0}>
        <Checkbox checked={selected} onChange={selectionHandler} />
      </Table.Cell>
      <Tooltip content={label}>
        <Table.TextCell>{label}</Table.TextCell>
      </Tooltip>
    </Table.Row>
  );
});

class SelectList extends React.Component {
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
      <SelectListItem
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
          <Table.Body height={128}>
            {rows}
          </Table.Body>
        </Table>
      </Pane>
    );
  }
}


export default SelectList;
