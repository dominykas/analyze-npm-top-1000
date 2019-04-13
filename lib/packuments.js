'use strict';

const _ = require('lodash');
const Fs = require('fs');
const Mkdirp = require('mkdirp');
const Pacote = require('pacote');
const Path = require('path');


const internals = {
    cachePath: Path.join(__dirname, '..', 'cache', 'packuments')
};


exports.download = async (dep) => {

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
};


exports.load = (dep) => {

    return Promise.resolve(require(Path.join(internals.cachePath, `${dep}.json`)));
};

exports.loadAll = (deps) => {

    return Promise.all(_(deps)
        .keys()
        .sort()
        .map((dep) => exports.load(dep))
        .value());
};
