#!/usr/bin/env node

'use strict';

const Fs = require('fs');
const Mkdirp = require('mkdirp');
const Pacote = require('pacote');
const Path = require('path');


const internals = {
    cachePath: Path.join(__dirname, '..', 'cache', 'packuments')
};


internals.main = async () => {

    const allDeps = Object.keys(require('../package.json').dependencies).sort();
    for (const dep of allDeps) {

        const parts = dep.split('/');

        if (parts.length > 2) {
            throw new Error(`What is this sourcery? Weird package name: ${dep}`);
        }

        if (parts.length === 2) {
            Mkdirp.sync(Path.join(internals.cachePath, parts[0]));
        }

        console.log(dep);
        const packument = await Pacote.packument(dep, {
            'full-metadata': true,
            'include-deprecated': true,
            'user-agent': 'dominykas/analyze-npm-top-1000@0.0.0, see https://github.com/dominykas/analyze-npm-top-1000'
        });

        Fs.writeFileSync(Path.join(internals.cachePath, `${dep}.json`), JSON.stringify(packument, null, '  '));
    }
};

internals.main().catch((err) => {

    console.error(err);
    process.exit(1);
});
