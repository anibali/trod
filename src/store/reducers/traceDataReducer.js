import { handleActions } from 'redux-actions';
import produce from 'immer';

import { apiActions, apiResponseHandler } from '../../helpers/api';


const initialState = {
  byId: {},
};


export default handleActions({
  [apiActions.handleResponse]: apiResponseHandler('/tracedata/:id', produce((draft, data) => {
    draft.byId[data.id] = data;
  })),
}, initialState);
