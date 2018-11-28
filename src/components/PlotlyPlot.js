import React from 'react';
import { withContentRect } from 'react-measure';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from '../helpers/plotlyCustom';


class PlotlyPlot extends React.PureComponent {
  constructor(props) {
    super(props);
    this.PlotlyComponent = createPlotlyComponent(Plotly);
  }

  render() {
    const { PlotlyComponent } = this;
    const { width, height } = this.props.contentRect.bounds;

    return (
      <div ref={this.props.measureRef} style={{ height: '100%' }}>
        <PlotlyComponent
          onInitialized={this.onInitialized}
          data={this.props.data}
          layout={{ width, height, margin: { l: 40, r: 40, t: 50, b: 40 } }}
          fit={false}
        />
      </div>
    );
  }
}


export default withContentRect('bounds')(PlotlyPlot);
