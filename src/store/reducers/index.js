import { combineReducers } from 'redux';

import traces from './traceReducer';
import views from './viewReducer';


export default combineReducers({
  traces,
  views,
});
