# respondent-matching

## Overview

Demonstrates ability to load a CSV file and perform some geospatial and
text queries on the contents.

## Environment setup

1. Install node per the version in .nvmrc (or just use [nvm](https://nvm.sh))
2. Install yarn
3. In project repo: `yarn install` to setup dependencies and git hooks

## Executing

### Test suite

Tests are written alongside their respective components in the jest framework. They can be invoked via `yarn test`

### Sample

The project defined at `src/sample-project.json` can be sent through the
matcher by running `src/index.ts`. There is a npm script to do this via
`yarn run-sample`.
