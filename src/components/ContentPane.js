import React, { Component } from 'react';
import { connect } from 'react-redux';
import sortBy from 'lodash/sortBy';
import { Responsive, WidthProvider } from 'react-grid-layout';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import ContentPaneStyle from '../styles/ContentPane.css';
import WindowStyle from '../styles/Window.css';

import Window from './Window';
import { viewActions } from '../store/actions';
import { getCurrentExperimentViews } from '../store/selectors';

const ResponsiveGridLayout = WidthProvider(Responsive);


class ContentPane extends Component {
  componentDidMount() {
    const { fetchViews, experiment } = this.props;
    fetchViews(experiment.id);
  }

  componentDidUpdate(prevProps) {
    const { fetchViews, experiment } = this.props;
    if(experiment.id !== prevProps.experiment.id) {
      fetchViews(experiment.id);
    }
  }

  render() {
    const { views } = this.props;
    const viewComponents = views.map((view, i) => (
      <div
        key={view.id}
        className={ContentPaneStyle.GridItem}
        data-grid={{ w: 3, h: 3, x: 3 * (i % 4), y: 3 * Math.floor(i / 4) }}
      >
        <Window view={view} />
      </div>
    ));
    return (
      <section className={ContentPaneStyle.ContentPane}>
        <ResponsiveGridLayout style={{ width: '100%' }} rowHeight={100}
          width={1200} draggableHandle={`.${WindowStyle.TitleBar}`}
        >
          {viewComponents}
        </ResponsiveGridLayout>
      </section>
    );
  }
}


export default connect(
  state => ({ views: sortBy(getCurrentExperimentViews(state), 'name') }),
  (dispatch) => ({
    fetchViews: (...args) => dispatch(viewActions.fetchForExperiment(...args)),
  })
)(ContentPane);
