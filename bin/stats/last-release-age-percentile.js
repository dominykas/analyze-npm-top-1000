#!/usr/bin/env node

'use strict';


const _ = require('lodash');
const Stats = require('stats-lite');


const Packuments = require('../../lib/packuments');


const internals = {
    now: Date.now(),
    dayLength: 86400 * 1000,
    daysSince: (date) => (internals.now - date) / internals.dayLength
};


internals.main = async () => {

    const deps = require('../../package.json').dependencies;

    const all = await Packuments.loadAll(deps);

    const res = _(all)
        .map(({ name, time }) => ({
            name,
            time: new Date(_(time).omit('modified', 'created').values().max())
        }))
        .map(({ time }) => internals.daysSince(time))
        .sortBy()
        .value();

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
