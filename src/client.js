import React from 'react';
import ReactDOM from 'react-dom';
import { freeze } from 'icepick';

import createStore from './store/createStore';
import ClientRoot from './components/ClientRoot';


// Client main function
export default (initialState) => {
  // Freeze the initial store state (if defined).
  if(initialState != null) {
    initialState = freeze(initialState);
  }

  // Create the Redux store.
  const store = createStore(initialState);

  // Mount our React root component in the DOM.
  const mountPoint = document.getElementById('root');
  ReactDOM.render(<ClientRoot store={store} />, mountPoint);
};
