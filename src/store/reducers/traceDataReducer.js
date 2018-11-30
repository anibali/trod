import { handleActions } from 'redux-actions';
import { freeze, assocIn } from 'icepick';

import { apiActions, apiResponseHandler } from '../../helpers/api';


const initialState = freeze({
  byId: {},
});


export default handleActions({
  [apiActions.handleResponse]: apiResponseHandler('/tracedata/:id',
    (state, data) => assocIn(state, ['byId', data.id], data)
  ),
}, initialState);
