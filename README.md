# Trod

A visualisation server for viewing metric data produced by experiments.

**DISCLAIMER: Trod is currently a work in progress**

## Installation

### From source

```bash
$ yarn pack
$ yarn global add "file:/$PWD/trod-vX.Y.Z.tgz" # Where X.Y.Z is the current version.
```

## Running

```bash
# Start a Trod server on port 3000 for experiments in directory "my-experiments".
$ trod -p 3000 -d ./my-experiments
```
