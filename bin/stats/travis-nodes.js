#!/usr/bin/env node

'use strict';


const _ = require('lodash');
const Fs = require('fs');
const Path = require('path');
const Yaml = require('js-yaml');
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

    const res = _(all)
        .map(({ gitFullName, name }) => ({ name, repoPath: Path.join(GitInfo.cachePath, gitFullName) }))
        .filter(({ repoPath }) => Fs.existsSync(Path.join(repoPath, '.travis.yml')))
        .map(({ name, repoPath }) => {

            const yaml = Fs.readFileSync(Path.join(repoPath, '.travis.yml'));
            try {
                return { name, repoPath, yaml: Yaml.safeLoad(yaml) };
            }
            catch (err) {
                // console.error(err);
                // console.error(yaml.toString());
                console.error(`Failed: ${repoPath}`);
            }
        })
        .filter()
        .map(({ name, yaml }) => ({ name, versions: (yaml['node_js'] || ['node']) }))
        .flatMap(({ name, versions }) => {

            if (!Array.isArray(versions)) {
                return { name, version: '' + versions };
            }

            return versions.map((v) => ({ name, version: '' + v }));
        })
        .sortBy('version')
        .countBy('version')
        .map((v, k) => `${k} | ${v}`)
        .join('\n');

    console.log(res);
};

internals.main().catch((err) => {

    console.error(err);
    process.exit(1);
});
