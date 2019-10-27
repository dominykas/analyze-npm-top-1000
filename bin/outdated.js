'use strict';

const Fs = require('fs');
const Path = require('path');
const Mkdirp = require('mkdirp');
const Shell = require('shelljs');
const Tmp = require('tmp');

const tmpDir = Tmp.dirSync().name;
console.log(tmpDir);


const Packuments = require('../lib/packuments');

const internals = {
    cachePath: Path.join(__dirname, '..', 'cache', 'outdated')
};

internals.save = (dep) => {

    if (Fs.existsSync(Path.join(internals.cachePath, `${dep}.json`))) {
        return JSON.parse(Fs.readFileSync(Path.join(internals.cachePath, `${dep}.json`)).toString());
    }

    const parts = dep.split('/');

    if (parts.length > 2) {
        throw new Error(`What is this sourcery? Weird package name: ${dep}`);
    }

    if (parts.length === 2) {
        Mkdirp.sync(Path.join(internals.cachePath, parts[0]));
    }

    const cmd = `npx npm-check-updates -m --jsonUpgraded --packageFile=${tmpDir}/package.json`;
    console.log(cmd);
    const { stdout } = Shell.exec(cmd, {
        silent: true
    });
    Fs.writeFileSync(Path.join(internals.cachePath, `${dep}.json`), stdout.toString());

    return JSON.parse(stdout.toString());
};

internals.main = async () => {

    const deps = require('../package.json').dependencies;

    const all = await Packuments.loadAll(deps);

    const res = [];
    for (const packument of all) {

        const latest = packument.versions[packument['dist-tags'].latest];
        Fs.writeFileSync(Path.join(tmpDir, 'package.json'), JSON.stringify(latest));
        const data = await internals.save(packument.name);

        const depCount = Object.keys(latest.dependencies || {}).length;
        const outdatedCount = Object.keys(latest.dependencies || {}).filter((dep) => data[dep]).length;
        const devDepCount = Object.keys(latest.devDependencies || {}).length;
        const devOutdatedCount = Object.keys(latest.devDependencies || {}).filter((dep) => data[dep]).length;

        const out = { pkg: packument.name, depCount, devDepCount, outdatedCount, devOutdatedCount };
        console.log(out);
        res.push(out);
    }

    Fs.writeFileSync('oudated.json', JSON.stringify(res, null, '  '));
};

internals.main().catch((err) => {

    console.error(err);
    process.exit();
});
