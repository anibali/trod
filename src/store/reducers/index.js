import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import { apiReducer as api } from '../../helpers/api';
import traces from './traceReducer';
import traceData from './traceDataReducer';
import views from './viewReducer';
import experiments from './experimentReducer';
import ui from './uiReducer';


export default history => combineReducers({
  router: connectRouter(history),
  api,
  traces,
  traceData,
  views,
  experiments,
  ui,
});
