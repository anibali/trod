import React from 'react';
import { Provider } from 'react-redux';

import Experiment from './Experiment';


const ClientRoot = ({ store }) => (
  <Provider store={store}>
    <Experiment />
  </Provider>
);


export default ClientRoot;
