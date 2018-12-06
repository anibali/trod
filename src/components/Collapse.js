import React from 'react';
import { Icon, Text } from 'evergreen-ui';

import CollapseStyle from '../styles/Collapse.css';


class Collapse extends React.Component {
  constructor(props) {
    super(props);
    this.state = { collapsed: false };
    this.doCollapse = () => {
      this.setState({ collapsed: true });
    };
    this.doUncollapse = () => {
      this.setState({ collapsed: false });
    };
  }

  render() {
    const { children, label } = this.props;
    const { collapsed } = this.state;

    if(collapsed) {
      return (
        <div>
          <span className={CollapseStyle.Label} onClick={this.doUncollapse}>
            <Icon icon="chevron-right" />
            <Text size={400}>{label}</Text>
          </span>
        </div>
      );
    }

    return (
      <div>
        <span className={CollapseStyle.Label} onClick={this.doCollapse}>
          <Icon icon="chevron-down" />
          <Text size={400}>{label}</Text>
        </span>
        {children}
      </div>
    );
  }
}


export default Collapse;
