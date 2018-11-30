import { combineReducers } from 'redux';

import traces from './traceReducer';
import traceData from './traceDataReducer';
import views from './viewReducer';
import { apiReducer as api } from '../../helpers/api';


export default combineReducers({
  api,
  traces,
  traceData,
  views,
  // TODO: Make a proper reducer for the UI part of the store
  ui: () => ({
    currentExperiment: 'exp1',
    comparisonExperiments: ['exp2'],
  })
});
