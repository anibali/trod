#!/bin/bash -e

# Start the server
if [ "$NODE_ENV" == "production" ]
then
  node src/serverEntry.js "$@"
else
  rm -f dist/*
  yarn exec -- webpack -w
fi
