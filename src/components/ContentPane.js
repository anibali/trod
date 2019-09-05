import React, { Component } from 'react';
import { connect } from 'react-redux';
import sortBy from 'lodash/sortBy';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Spinner } from 'evergreen-ui';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import ContentPaneStyle from '../styles/ContentPane.css';
import WindowStyle from '../styles/Window.css';

import Window from './Window';
import { viewActions } from '../store/actions';
import { getExperimentViews, getActiveApiRequestCount } from '../store/selectors';

const ResponsiveGridLayout = WidthProvider(Responsive);


class ContentPane extends Component {
  componentDidMount() {
    const { fetchViews, experimentId } = this.props;
    fetchViews(experimentId);
  }

  componentDidUpdate(prevProps) {
    const { fetchViews, experimentId } = this.props;
    if(experimentId !== prevProps.experimentId) {
      fetchViews(experimentId);
    }
  }

  render() {
    const { views, nActiveRequests } = this.props;

    if(nActiveRequests > 0) {
      return <section className={ContentPaneStyle.ContentPane}><Spinner /></section>;
    }

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
        <ResponsiveGridLayout
          rowHeight={100}
          width={1200}
          draggableHandle={`.${WindowStyle.TitleBar}`}
        >
          {viewComponents}
        </ResponsiveGridLayout>
      </section>
    );
  }
}


export default connect(
  (state, props) => ({
    views: sortBy(getExperimentViews(state, props.experimentId), 'name'),
    nActiveRequests: getActiveApiRequestCount(state),
  }),
  (dispatch) => ({
    fetchViews: (...args) => dispatch(viewActions.fetchForExperiment(...args)),
  })
)(ContentPane);
