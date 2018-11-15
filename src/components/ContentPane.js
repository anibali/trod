import React from 'react';

import { Responsive, WidthProvider } from 'react-grid-layout';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import ContentPaneStyle from '../styles/ContentPane.css';

const ResponsiveGridLayout = WidthProvider(Responsive);


const ContentPane = () => (
  <section className={ContentPaneStyle.ContentPane}>
    <ResponsiveGridLayout style={{ width: '100%' }} rowHeight={100} width={1200}>
      <div key="1" className={ContentPaneStyle.Frame} data-grid={{ w: 3, h: 3, x: 0, y: 0 }}>
        <div style={{padding: 8}}>1</div>
      </div>
      <div key="2" className={ContentPaneStyle.Frame} data-grid={{ w: 3, h: 3, x: 3, y: 0 }}>
        <div style={{padding: 8}}>2</div>
      </div>
      <div key="3" className={ContentPaneStyle.Frame} data-grid={{ w: 3, h: 3, x: 6, y: 0 }}>
        <div style={{padding: 8}}>3</div>
      </div>
      <div key="4" className={ContentPaneStyle.Frame} data-grid={{ w: 3, h: 3, x: 9, y: 0 }}>
        <div style={{padding: 8}}>4</div>
      </div>
      <div key="5" className={ContentPaneStyle.Frame} data-grid={{ w: 3, h: 3, x: 0, y: 3 }}>
        <div style={{padding: 8}}>5</div>
      </div>
    </ResponsiveGridLayout>
  </section>
);


export default ContentPane;
