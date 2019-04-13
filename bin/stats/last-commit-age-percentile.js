#!/usr/bin/env node

'use strict';


const _ = require('lodash');
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

    for (const p of paths) {
        const log = await Git(p).log(['-n', 1]);
        console.log(p, log);
        res.push(internals.daysSince(new Date(log.latest.date)));
    }

    const p = 5;
    for (let i = 1; i <= 100 / p; ++i) {
        const percentile = i * p;
        const age = Stats.percentile(res, percentile / 100);
        console.log(`${percentile}% - ${Math.round(age)} days old`);
    }
};

internals.main().catch((err) => {

    console.error(err);
    process.exit(1);
});
