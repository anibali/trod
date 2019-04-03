import React from 'react';
import { withContentRect } from 'react-measure';
import createPlotlyComponent from 'react-plotly.js/factory';
import jsonpatch from 'fast-json-patch';
import cloneDeep from 'lodash/cloneDeep';
import sortBy from 'lodash/sortBy';
import RcSlider, { createSliderWithTooltip } from 'rc-slider';

import Plotly from '../../helpers/plotlyCustom';

import WindowStyle from '../../styles/Window.css';
import '../../styles/rc-slider.global.css';


const Slider = createSliderWithTooltip(RcSlider);

class PlotlyView extends React.PureComponent {
  constructor(props) {
    super(props);
    this.PlotlyComponent = createPlotlyComponent(Plotly);

    this.state = { timeInstant: null };

    this.onTimeInstantChange = (timeInstant) => {
      this.setState({ timeInstant });
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { view, traceValues } = props;
    const newState = {};
    if(view.settings.snapshotTimescale && state.timeInstant == null) {
      let timeTrace = null;
      Object.values(traceValues).forEach(traces => {
        if(traces[view.settings.snapshotTimescale]) {
          timeTrace = traces[view.settings.snapshotTimescale];
        }
      });
      if(timeTrace) {
        newState.timeInstant = timeTrace[timeTrace.length - 1];
      }
    }
    return newState;
  }

  render() {
    const { PlotlyComponent } = this;
    const { contentRect, measureRef, view, traceValues } = this.props;
    let { width, height } = contentRect.bounds;
    const { timeInstant } = this.state;

    let slider = null;
    const timescaleInvMap = {};
    if(view.settings.snapshotTimescale) {
      let timeTrace = null;
      Object.values(traceValues).forEach(traces => {
        if(traces[view.settings.snapshotTimescale]) {
          timeTrace = traces[view.settings.snapshotTimescale];
        }
      });
      if(timeTrace) {
        const marks = {};
        const max = timeTrace[timeTrace.length - 1];
        timeTrace.forEach((value, i) => {
          marks[value] = '';
          timescaleInvMap[value] = i;
        });
        slider = (
          <div className={WindowStyle.TimelineSlider}>
            <Slider
              value={timeInstant}
              marks={marks}
              max={max}
              step={null}
              onChange={this.onTimeInstantChange}
            />
          </div>
        );
        height -= 36;
      }
    }

    const specTemplates = [];
    if(view.settings.data) {
      Array.prototype.push.apply(specTemplates, view.settings.data);
    } else {
      // TODO: Remove support for this way of specifying graphSpec and injectTraces.
      specTemplates.push({
        graphSpec: view.settings.graphSpec,
        injectTraces: view.settings.injectTraces,
      });
    }

    const specs = [];
    specTemplates.forEach((specTemplate) => {
      Object.entries(traceValues).forEach(([expId, vs]) => {
        // Substitute trace values into the Plotly spec.
        const patch = specTemplate.injectTraces.flatMap(({ path, trace, field, snapshot, gather }) => {
          let value = vs[trace];
          if(value == null) {
            return [];
          }
          if(snapshot) {
            let index = timescaleInvMap[timeInstant];
            if(index == null) {
              index = value.length - 1;
            }
            value = value[index];
          }
          if(value == null) {
            return [];
          }
          if(field) {
            value = value.map(v => v[field]);
          }
          if(gather != null) {
            value = gather.map(index => value[index]);
          }
          return [{ op: 'add', path, value }];
        });
        const patchedSpec = jsonpatch.applyPatch(
          cloneDeep(specTemplate.graphSpec), patch
        ).newDocument;
        if(patchedSpec.name == null) {
          patchedSpec.name = expId;
        } else {
          patchedSpec.name = `${expId}/${patchedSpec.name}`;
        }
        specs.push(patchedSpec);
      });
    });

    const data = sortBy(specs, 'name');
    const layout = {
      width,
      height,
      margin: { l: 40, r: 40, t: 50, b: 40 },
      ...view.settings.layout,
    };

    return (
      <>
        <div ref={measureRef} className={WindowStyle.FullHeight}>
          <PlotlyComponent
            onInitialized={this.onInitialized}
            data={data}
            layout={layout}
            fit={false}
          />
          {slider}
        </div>
      </>
    );
  }
}


export default withContentRect('bounds')(PlotlyView);
