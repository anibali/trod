#!/bin/bash -e

# Start the server
if [ "$NODE_ENV" == "production" ]
then
  node src/server.js
else
  rm -f dist/*
  yarn exec -- webpack --mode=development -w
fi
