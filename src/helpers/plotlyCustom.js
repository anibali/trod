import Plotly from 'plotly.js/lib/core';
import Scatter from 'plotly.js/lib/scatter';
import Scatter3d from 'plotly.js/lib/scatter3d';
import Bar from 'plotly.js/lib/bar';
import Box from 'plotly.js/lib/box';
import Histogram from 'plotly.js/lib/histogram';
import Aggregate from 'plotly.js/lib/aggregate';
import Filter from 'plotly.js/lib/filter';
import GroupBy from 'plotly.js/lib/groupby';
import Sort from 'plotly.js/lib/sort';


Plotly.register([
  Scatter,
  Scatter3d,
  Bar,
  Box,
  Histogram,
  Aggregate,
  Filter,
  GroupBy,
  Sort,
]);


export default Plotly;
