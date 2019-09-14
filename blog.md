- 999 packages scanned

In April/2019:
- 885 point to git repos with a .travis.yml (742 unique repos, due to monorepo, etc; earlier numbers where based on the count of repos, not the count of packages)
- 384 had neither 10, nor `lts/*` in their supported list
    - 115 of these had a keyword for a "default" node (i.e. latest stable, i.e. 11 at the time of the scan) 
- 501 (56%) were testing in the LTS at the time of writing

In Sep/2019
- 388 packages had a new release since last check
- 877 point to git repos with a .travis.yml
    - sigh... diff?
- 315 have neither 10 nor lts
    - 106 use a default
- 562 testing in an LTS

Actual numbers:

v | packages
--- | -------
1 | 61
2 | 61
3 | 113
4 | 345
5 | 194
6 | 586
7 | 173
8 | 566
9 | 143
10 | 485
11 | 184
12 | 46
0.1 | 6
0.10 | 262
0.11 | 46
0.12 | 252
0.4 | 17
0.6 | 43
0.8 | 103
0.9 | 18
? | 7
default (11) | 305
lts (10) | 37

September:

v | packages
--- | -------
1 | 61
2 | 61
3 | 108
4 | 296
5 | 179
6 | 497
7 | 167
8 | 581
9 | 142
10 | 543
11 | 190
12 | 220
13 | 1
0.1 | 6
0.10 | 248
0.11 | 45
0.12 | 240
0.4 | 18
0.6 | 44
0.8 | 101
0.9 | 19
? | 7
default (12) | 308
lts | 45

---

## Ideas

- Now is a good time, prep for v12, v8 deprecation
- Don't forget to bump major if you're dropping support
- Introduce keywords?
- Mention CITGM

## Things to check

- Can greenkeeper upgrade node?
- Can scan Circle CI?
- Can scan GH actions?
