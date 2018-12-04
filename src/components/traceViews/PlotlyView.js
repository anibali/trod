import React from 'react';
import { withContentRect } from 'react-measure';
import createPlotlyComponent from 'react-plotly.js/factory';
import jsonpatch from 'fast-json-patch';
import { thaw } from 'icepick';
import sortBy from 'lodash/sortBy';

import Plotly from '../../helpers/plotlyCustom';


class PlotlyView extends React.PureComponent {
  constructor(props) {
    super(props);
    this.PlotlyComponent = createPlotlyComponent(Plotly);
  }

  render() {
    const { PlotlyComponent } = this;
    const { contentRect, measureRef, view, traceValues } = this.props;
    const { width, height } = contentRect.bounds;

    const specs = Object.entries(traceValues).map(([expId, vs]) => {
      // Substitute trace values into the Plotly spec.
      const patch = view.settings.injectTraces.map(({ path, trace }) => ({
        op: 'add',
        path,
        value: vs[trace],
      }));
      const patchedSpec = jsonpatch.applyPatch(thaw(view.settings.graphSpec), patch).newDocument;
      if(patchedSpec.name == null) {
        patchedSpec.name = expId;
      } else {
        patchedSpec.name = `${expId}/${patchedSpec.name}`;
      }
      return patchedSpec;
    });

    const data = sortBy(specs, 'name');

    return (
      <div ref={measureRef} style={{ height: '100%' }}>
        <PlotlyComponent
          onInitialized={this.onInitialized}
          data={data}
          layout={{ width, height, margin: { l: 40, r: 40, t: 50, b: 40 } }}
          fit={false}
        />
      </div>
    );
  }
}


export default withContentRect('bounds')(PlotlyView);
