import React from 'react';
import JSONTree from 'react-json-tree';

import TreeViewStyle from '../../styles/TreeView.css';


const theme = {
  scheme: 'Tomorrow',
  author: 'Chris Kempson (http://chriskempson.com)',
  base00: '#000000', // Changed from #1d1f21.
  base01: '#282a2e',
  base02: '#373b41',
  base03: '#969896',
  base04: '#b4b7b4',
  base05: '#c5c8c6',
  base06: '#e0e0e0',
  base07: '#ffffff',
  base08: '#cc6666',
  base09: '#de935f',
  base0A: '#f0c674',
  base0B: '#b5bd68',
  base0C: '#8abeb7',
  base0D: '#81a2be',
  base0E: '#b294bb',
  base0F: '#a3685a',
};

const shouldExpandNode = (keyName, data, level) => level < 3;

class TreeView extends React.PureComponent {
  render() {
    const { traceValues } = this.props;
    const data = traceValues;
    return (
      <div className={TreeViewStyle.TreeView}>
        <JSONTree
          data={data}
          hideRoot
          shouldExpandNode={shouldExpandNode}
          theme={theme}
          invertTheme
        />
      </div>
    );
  }
}


export default TreeView;
