import { handleActions } from 'redux-actions';
import { freeze, assoc, assign } from 'icepick';
import keyBy from 'lodash/keyBy';

import { apiActions, apiResponseHandler } from '../../helpers/api';


const initialState = freeze({
  byId: {},
});


export default handleActions({
  [apiActions.handleResponse]: apiResponseHandler('/experiments/:id/traces',
    (state, data) => assoc(state, 'byId', assign(state.byId, keyBy(data, 'id')))
  ),
}, initialState);
