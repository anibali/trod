import * as simple from './simpleActions';
import * as complex from './complexActions';


export const traceActions = Object.assign({}, simple.traceActions, complex.traceActions);
export const viewActions = Object.assign({}, simple.viewActions, complex.viewActions);
