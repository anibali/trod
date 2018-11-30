import * as simple from './simpleActions';
import * as complex from './complexActions';


export const traceActions = { ...simple.traceActions, ...complex.traceActions };
export const traceDataActions = { ...simple.traceDataActions, ...complex.traceDataActions };
export const viewActions = { ...simple.viewActions, ...complex.viewActions };
