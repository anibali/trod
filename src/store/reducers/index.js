import { combineReducers } from 'redux';

import { apiReducer as api } from '../../helpers/api';
import traces from './traceReducer';
import traceData from './traceDataReducer';
import views from './viewReducer';
import experiments from './experimentReducer';
import ui from './uiReducer';


export default combineReducers({
  api,
  traces,
  traceData,
  views,
  experiments,
  ui,
});
