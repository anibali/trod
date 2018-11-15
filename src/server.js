#!/usr/bin/env node

require('@babel/register')({
  presets: [
    [require.resolve('@babel/preset-env'), {
      targets: { node: 'current' }
    }],
    require.resolve('@babel/preset-react')
  ]
});

const http = require('http');

const createApp = require('./createApp').default;


createApp().then((app) => {
  const server = http.createServer(app);
  server.listen(3000, () => {
    console.log('Server started.');
  });
});
