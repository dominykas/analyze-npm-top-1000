#!/usr/bin/env node

'use strict';


const Packuments = require('../lib/packuments');


const internals = {};


internals.main = async () => {

    const allDeps = Object.keys(require('../package.json').dependencies).sort();
    for (const dep of allDeps) {

        await Packuments.download(dep);
    }
};

internals.main().catch((err) => {

    console.error(err);
    process.exit(1);
});
