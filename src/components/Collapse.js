import React from 'react';
import { Icon, Text } from 'evergreen-ui';

import CollapseStyle from '../styles/Collapse.css';


class Collapse extends React.Component {
  constructor(props) {
    super(props);
    this.state = { collapsed: false };
    this.toggleCollapsed = () => {
      this.setState(state => ({ collapsed: !state.collapsed }));
    };
  }

  render() {
    const { children, label } = this.props;
    const { collapsed } = this.state;

    return (
      <div>
        <button
          type="button"
          className={CollapseStyle.Label}
          onClick={this.toggleCollapsed}
          aria-pressed={!collapsed}
        >
          <Icon icon={collapsed ? 'chevron-right' : 'chevron-down'} />
          <Text size={400}>{label}</Text>
        </button>
        <div className={collapsed ? 'hidden' : null}>
          {children}
        </div>
      </div>
    );
  }
}


export default Collapse;
