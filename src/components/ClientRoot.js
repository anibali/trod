import React from 'react';

import TopBar from './TopBar';
import ContentPane from './ContentPane';
import Sidebar from './Sidebar';

import Layout from '../styles/Layout.css';


const ClientRoot = () => (
  <div className={Layout.Wrapper}>
    <TopBar />
    <main className={Layout.Main}>
      <ContentPane />
      <Sidebar />
    </main>
  </div>
);


export default ClientRoot;
