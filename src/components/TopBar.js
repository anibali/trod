import React from 'react';

import TopBarStyle from '../styles/TopBar.css';


const TopBar = ({ experiment }) => (
  <div className={TopBarStyle.TopBar}>
    <h1>Trod</h1>
    <span style={{marginLeft: 24}}>{experiment.id}</span>
  </div>
);


export default TopBar;
