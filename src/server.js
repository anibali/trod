import http from 'http';

import createApp from './createApp';


// Server main function
export default () => {
  createApp().then((app) => {
    const server = http.createServer(app);
    server.listen(3000, () => {
      console.log('Server started.');
    });
  });
};
