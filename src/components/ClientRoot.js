import React from 'react';
import { Provider } from 'react-redux';

import TopBar from './TopBar';
import ContentPane from './ContentPane';
import Sidebar from './Sidebar';

import Layout from '../styles/Layout.css';


const ClientRoot = ({ store }) => (
  <Provider store={store}>
    <div className={Layout.Wrapper}>
      <TopBar />
      <main className={Layout.Main}>
        <ContentPane />
        <Sidebar />
      </main>
    </div>
  </Provider>
);


export default ClientRoot;
