import { handleActions } from 'redux-actions';
import produce from 'immer';

import { apiActions, apiResponseHandler } from '../../helpers/api';


const initialState = {
  byId: {},
};


export default handleActions({
  [apiActions.handleResponse]: apiResponseHandler('/experiments/:id/views', produce((draft, data) => {
    data.forEach(exp => {
      draft.byId[exp.id] = exp;
    });
  })),
}, initialState);
