#!/usr/bin/env node

'use strict';


const _ = require('lodash');
const Cp = require('child_process');
const Fs = require('fs');
const Path = require('path');
const Yaml = require('js-yaml');


const GitInfo = require('../../lib/gitInfo');


const internals = {
    now: Date.now(),
    dayLength: 86400 * 1000,
    daysSince: (date) => (internals.now - date) / internals.dayLength
};


internals.fixVersion = function (v) {

    v = '' + v;

    if (v.startsWith('iojs-')) {
        v = v.substring(5);
    }

    if (v.startsWith('v')) {
        v = v.substring(1);
    }

    if (v === 'iojs') {
        return '3';
    }

    if (v === 'latest' || v === 'stable' || v === 'node') {
        return 'default';
    }

    if (v === 'lts/*') {
        return 'lts';
    }

    const [major, minor] = v.split('.');

    if (major === '0') {
        return `${major}.${minor}`;
    }

    return major;
};

internals.main = async () => {

    const deps = require('../../package.json').dependencies;

    const all = GitInfo.get(deps);

    const travis = _(all)
        .map(({ name, gitFullName }) => ({ pkg: name, name: gitFullName, repoPath: Path.join(GitInfo.cachePath, gitFullName) }))
        .filter(({ repoPath }) => Fs.existsSync(Path.join(repoPath, '.travis.yml')))
        .map(({ pkg, name, repoPath }) => {

            const yaml = Fs.readFileSync(Path.join(repoPath, '.travis.yml'));
            try {
                return { pkg, name, repoPath, yaml: Yaml.safeLoad(yaml) };
            }
            catch (err) {
                // console.error(err);
                // console.error(yaml.toString());
                console.error(`Failed: ${repoPath}`);
            }
        })
        .filter();

    console.log(travis.size());

    const age = travis
        .map(({ name, repoPath }) => {

            const resTravis = Cp.execSync('git log -n 1 .travis.yml | grep Date', { cwd: repoPath }).toString();
            const resCommit = Cp.execSync('git log -n 1 | grep Date', { cwd: repoPath }).toString();

            const ageTravis = internals.daysSince(new Date(resTravis.substring(5)));
            const ageCommit = internals.daysSince(new Date(resCommit.substring(5)));

            return { name, ageTravis, ageCommit };
        })
        .keyBy('name')
        .value();

    const mapped = travis
        .map(({ pkg, name, yaml }) => {

            let versions = yaml['node_js'];

            if (!Array.isArray(versions)) {
                versions = [versions];
            }

            if (yaml['env'] && yaml['env']['matrix']) {
                const fromEnv = _([yaml['env']['matrix']])
                    .flatten()
                    .map((env) => {

                        const matches = env.match(/(?:NODEJS_VER|TRAVIS_NODE_VERSION|NODE_VER)="?(?:node\/)?([\w.]+)"?/);
                        if (matches) {
                            return matches[1];
                        }
                    })
                    .filter()
                    .value();

                versions.push(...fromEnv);
            }

            if (yaml['matrix'] && yaml['matrix']['include']) {
                const fromMatrixInclude = _.map(yaml['matrix']['include'], 'node_js');
                versions.push(...fromMatrixInclude);
            }

            versions = _.filter(versions);

            if (!versions.length) {
                versions = ['?'];
            }

            return { pkg, name, versions };
        })
        .flatMap(({ pkg, name, versions }) => {

            versions = _.flatMap(versions, (v) => internals.fixVersion(v));

            return versions.map((version) => ({ pkg, name, version }));
        })
        .uniqBy(({ pkg, version }) => `${pkg} - ${version}`);

    let i = 0;
    const outdatedRepos = mapped
        .groupBy('pkg')
        .pickBy((g) => !_.map(g, 'version').includes('10') && !_.map(g, 'version').includes('lts'))
        .map((g) => {

            const name = g[0].name;
            const versions = _.map(g, 'version').join(', ');
            return `${++i}. [${name}](https://github.com/${name}): \`${versions}\` ([${Math.round(age[name].ageTravis)} days old](https://github.com/${name}/blob/master/.travis.yml))`;
        });

    console.log(outdatedRepos.join('\n'));

    const countByVersion = mapped
        .sortBy('version')
        .countBy('version')
        .map((v, k) => `${k} | ${v}`)
        .join('\n');

    console.log(countByVersion);

    const noSupport = mapped.groupBy('name').pickBy((g) => !_.map(g, 'version').includes('10') && !_.map(g, 'version').includes('lts')).value();
    const agesCsv = _.map(age, ({ name, ageTravis, ageCommit }) => {

        const has10orLts = noSupport[name] ? 0 : 1;
        return [name, ageTravis, ageCommit, has10orLts].join(';');
    }).join('\n');

    Fs.writeFileSync(Path.join(__dirname, '..', '..', 'cache', 'age.csv'), agesCsv);
    console.log(agesCsv);
};

internals.main().catch((err) => {

    console.error(err);
    process.exit(1);
});
