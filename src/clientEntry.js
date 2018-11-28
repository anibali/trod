/**
 * Client-side code entry point.
 */

import clientMain from './client';


// Make the client-side main function global so that it can be called after the page loads.
window.main = clientMain;
