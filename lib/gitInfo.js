#!/usr/bin/env node

'use strict';

const _ = require('lodash');
const GitUrlParse = require('git-url-parse');
const Path = require('path');


const internals = {};


internals.parseRepository = (pkg) => {

    const { name, repository } = pkg;

    if (!repository) {
        throw new Error(`Missing repo info: ${name}`);
    }

    let { type, url } = repository;

    if (type === undefined && url && url.endsWith('.git')) {
        // warn?
        type = 'git';
    }

    if (type !== 'git') {
        throw new Error(`Unknown repo type in ${name}: ${JSON.stringify(repository)}`);
    }

    if (!url) {
        throw new Error(`Missing repo url in ${name}: ${url}`);
    }

    const gitUrl = GitUrlParse(url);

    return {
        name,
        url: GitUrlParse.stringify(gitUrl, 'https'),
        gitFullName: gitUrl.full_name,
        gitPath: gitUrl.filepath
    };
};


exports.get = (deps) => {

    return _(deps)
        .keys()
        .sort()
        .map((dep) => {

            try {
                return internals.parseRepository(require(`${dep}/package.json`));
            }
            catch (error) {

                console.error(error.toString());
            }
        })
        .filter()
        .value();
};

exports.cachePath = Path.join(__dirname, '..', 'cache', 'git');
