import { handleActions } from 'redux-actions';
import { freeze, assoc } from 'icepick';
import keyBy from 'lodash/keyBy';

import { apiActions, apiResponseHandler } from '../../helpers/api';


const initialState = freeze({
  byId: {},
});


export default handleActions({
  [apiActions.handleResponse]: apiResponseHandler('/experiments',
    (state, data) => assoc(state, 'byId', keyBy(data, 'id'))
  ),
}, initialState);
