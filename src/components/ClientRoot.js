import React from 'react';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router';
import { ConnectedRouter } from 'connected-react-router';

import Experiment from './Experiment';


const ClientRoot = ({ store, history }) => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <>
        <Switch>
          <Route
            exact
            path="/c/experiments/:id"
            render={({ match }) => <Experiment experimentId={match.params.id} />}
          />
          <Route component={Experiment} />
        </Switch>
      </>
    </ConnectedRouter>
  </Provider>
);


export default ClientRoot;
