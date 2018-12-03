import * as simple from './simpleActions';
import * as complex from './complexActions';


export const traceActions = { ...complex.traceActions };
export const traceDataActions = { ...complex.traceDataActions };
export const viewActions = { ...complex.viewActions };
export const experimentActions = { ...complex.experimentActions };
export const uiActions = { ...simple.uiActions };
