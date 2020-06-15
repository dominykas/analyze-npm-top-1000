#!/usr/bin/env node

'use strict';

const _ = require('lodash');
const Fs = require('fs');
const Path = require('path');
const Semver = require('semver');

const output = JSON.parse(Fs.readFileSync(process.argv[2]).toString());
const allNodes = Fs.readFileSync(Path.join(__dirname, 'all-nodes.txt')).toString().trim().split('\n');

const travis = output.dependencies.support.filter((p) => p.travis);
const engines = output.dependencies.support.filter((p) => p.engines);

const errorCount = _.size(output.dependencies.errors);
const noInfoCount = output.dependencies.support.filter((p) => !p.travis && !p.engines).length;

function getNodeRelease(version) {

    const parsed = Semver.parse(version);

    if (parsed.major === 0) {
        return `v${parsed.major}.${parsed.minor}`;
    }

    return `v${parsed.major}`;
}

const supportedOnTravis = _(travis)
    .flatMap((info) => {

        return _(info.travis.resolved)
            .map((resolvedVersion, key) => {

                let matches;
                if (key === 'lts/boron') {
                    resolvedVersion = '6.17.1';
                }
                else if (key === 'lts/carbon') {
                    resolvedVersion = '8.17.0';
                }
                else if (key === 'lts/dubnium') {
                    resolvedVersion = '10.20.1';
                }
                else if (key === 'iojs') {
                    resolvedVersion = '3.3.1';
                }
                else if (matches = key.match(/^iojs-v(\d\.\d)$/)) {
                    resolvedVersion = `${matches[1]}.0`;
                }
                else if (key === '1' || key.startsWith('1.')) {
                    resolvedVersion = '1.8.4';
                }
                else if (key === '2' || key.startsWith('2.')) {
                    resolvedVersion = '2.5.0';
                }
                else if (key === '3' || key.startsWith('3.')) {
                    resolvedVersion = '3.3.1';
                }

                const parsed = Semver.parse(resolvedVersion);

                if (!parsed) {
                    throw new Error(`Unable to parse: ${resolvedVersion} (${key})`);
                }

                return resolvedVersion;
            })
            .value();
    })
    .sort(Semver.compare)
    .map((version) => getNodeRelease(version))
    .countBy()
    .map((v, k) => `${k.substring(1)} | ${v}`)
    .join('\n');

const supportedViaEngines = _(engines)
    .flatMap((info) => {

        const satisfies = new Set();
        const supported = [];

        allNodes.forEach((version) => {

            const node = getNodeRelease(version);
            if (satisfies.has(node)) {
                return;
            }

            if (Semver.satisfies(version, info.engines)) {
                satisfies.add(node);
                supported.push(version);
            }
        });

        return supported;
    })
    .sort(Semver.compare)
    .map((version) => getNodeRelease(version))
    .countBy()
    .map((v, k) => `${k.substring(1)} | ${v}`)
    .join('\n');

console.log(`
- Failed to load package/repository information: ${errorCount}
- No support information: ${noInfoCount}

## Travis stats (${travis.length}) 

Release | Packages that test in it
--------|-------------------------
${supportedOnTravis}

## Engines stats (${engines.length}) 

Release | Packages that match it in engines
--------|----------------------------------
${supportedViaEngines}
`);
