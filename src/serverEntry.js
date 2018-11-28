#!/usr/bin/env node

/**
 * Server-side code entry point.
 */

// Configure Babel to transpile imported modules.
require('@babel/register')({
  presets: [
    [require.resolve('@babel/preset-env'), {
      targets: { node: 'current' }
    }],
    require.resolve('@babel/preset-react')
  ]
});


const serverMain = require('./server').default;


// Call the server-side main function.
serverMain(process.argv);
