import { handleActions } from 'redux-actions';
import { freeze, assoc, assign } from 'icepick';

import { apiActions, apiResponseHandler } from '../../helpers/api';
import keyBy from 'lodash/keyBy';


const initialState = freeze({
  byId: {},
});

export default handleActions({
  [apiActions.handleResponse]: apiResponseHandler('/experiments/:id/views',
    (state, data) => assoc(state, 'byId', assign(state.byId, keyBy(data, 'id')))
  ),
}, initialState);
