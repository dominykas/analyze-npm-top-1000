#!/usr/bin/env node

'use strict';


const _ = require('lodash');
const Fs = require('fs');
const Path = require('path');
const Git = require('simple-git/promise');
const Stats = require('stats-lite');


const GitInfo = require('../../lib/gitInfo');


const internals = {
    now: Date.now(),
    dayLength: 86400 * 1000,
    daysSince: (date) => (internals.now - date) / internals.dayLength
};


internals.main = async () => {

    const deps = require('../../package.json').dependencies;

    const all = GitInfo.get(deps);

    const paths = _(all)
        .map(({ gitFullName }) => Path.join(GitInfo.cachePath, gitFullName))
        .value();

    const res = [];
    let noTravis = 0;

    for (const p of paths) {
        if (Fs.existsSync(Path.join(p, '.travis.yml'))) {
            const log = await Git(p).log(['-n', 1, '.travis.yml']);
            console.log(p, log);
            res.push(internals.daysSince(new Date(log.latest.date)));
        }
        else {
            ++noTravis;
        }
    }

    const p = 5;
    for (let i = 1; i <= 100 / p; ++i) {
        const percentile = i * p;
        const age = Stats.percentile(res, percentile / 100);
        console.log(`${percentile}%\t${Math.round(age)} days old`);
    }
    console.log('No travis: ', noTravis);
};

internals.main().catch((err) => {

    console.error(err);
    process.exit(1);
});
