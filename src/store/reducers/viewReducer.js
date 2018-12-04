import { handleActions } from 'redux-actions';
import { assign, assoc, freeze } from 'icepick';
import keyBy from 'lodash/keyBy';

import { apiActions, apiResponseHandler } from '../../helpers/api';


const initialState = freeze({
  byId: {},
});

export default handleActions({
  [apiActions.handleResponse]: apiResponseHandler('/experiments/:id/views',
    (state, data) => assoc(state, 'byId', assign(state.byId, keyBy(data, 'id')))
  ),
}, initialState);
