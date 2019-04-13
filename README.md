# analyze-npm-top-1000

Source: https://docs.google.com/spreadsheets/d/1lZDNYsLntwD2q9XaTw-XLuG0VpHH6cOV-Uoa7Y1aTSM/edit#gid=1745448509

## `npm i`

```
npm WARN deprecated path-is-absolute@2.0.0: This package is no longer relevant as Node.js 0.12 is unmaintained.
npm WARN deprecated os-tmpdir@2.0.0: This is not needed anymore. `require('os').tmpdir()` in Node.js 4 and up is good.
npm WARN deprecated os-homedir@2.0.0: This is not needed anymore. Use `require('os').homedir()` instead.
npm WARN deprecated opn@6.0.0: The package has been renamed to `open`
npm WARN deprecated strip-eof@2.0.0: Renamed to `strip-final-newline` to better represent its functionality.
npm WARN deprecated circular-json@0.5.9: CircularJSON is in maintenance only, flatted is its successor.
npm WARN deprecated unzip-response@3.0.0: Renamed to decompress-response

> fsevents@1.2.7 install /Users/dominykas/devel/experiments/analyze-npm-top-1000/node_modules/fsevents
> node install

node-pre-gyp WARN Using request for node-pre-gyp https download 
[fsevents] Success: "/Users/dominykas/devel/experiments/analyze-npm-top-1000/node_modules/fsevents/lib/binding/Release/node-v64-darwin-x64/fse.node" is installed via remote
added 2651 packages from 949 contributors and audited 2135241 packages in 52.449s
found 1 high severity vulnerability
  run `npm audit fix` to fix them, or `npm audit` for details
```
