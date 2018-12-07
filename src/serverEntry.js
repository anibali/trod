#!/usr/bin/env node

/**
 * Server-side code entry point.
 */

// Configure Babel to transpile imported modules.
require('@babel/register')();


const serverMain = require('./server').default;


// Call the server-side main function.
serverMain(process.argv);
