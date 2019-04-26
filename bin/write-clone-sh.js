#!/usr/bin/env node

'use strict';

const GitInfo = require('../lib/gitInfo');

const Fs = require('fs');
const Path = require('path');


const internals = {};


internals.main = () => {

    const repoInfo = GitInfo.get(require('../package.json').dependencies);

    Fs.writeFileSync(Path.join(__dirname, '..', 'cache', 'clone.sh'), repoInfo.map(({ url, gitFullName }) => `git clone ${url} git/${gitFullName}`).join('\n'));
    Fs.writeFileSync(Path.join(__dirname, '..', 'cache', 'pull.sh'), repoInfo.map(({ url, gitFullName }) => `git --git-dir=git/${gitFullName}/.git --work-tree=git/${gitFullName}/ pull`).join('\n'));
};

internals.main();
