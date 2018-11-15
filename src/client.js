import React from 'react';
import ReactDOM from 'react-dom';

import ClientRoot from './components/ClientRoot';


window.main = () => {
  // Mount our React root component in the DOM
  const mountPoint = document.getElementById('root');
  ReactDOM.render(<ClientRoot />, mountPoint);
};
