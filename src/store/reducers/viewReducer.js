import { handleActions } from 'redux-actions';
import { freeze, assoc } from 'icepick';

import { viewActions } from '../actions';
import { apiActions, apiResponseHandler } from '../../helpers/api';


const initialState = freeze({
  items: [],
});

export default handleActions({
  [apiActions.handleResponse]: apiResponseHandler('/experiments/:id/views',
    (state, data) => assoc(state, 'items', data)
  ),
  [viewActions.set](state, { payload }) {
    return payload.views;
  },
}, initialState);
