# SuperWatch
### `super-watch`
 A CLI tool to watch for `.ts`, `.pug`, .`scss` and compile them.

## Installation
- Local
```
npm i --save-dev super-watch
```
- Global
```
npm i -g super-watch
```
## Usage
```
super-watch -i [source-path] -o [dest-path] -a
```
## What It Does
Watch all files and folders in the given directory, reports errors, and compiles changes.

```
Options:
      --version                           Show version number          [boolean]
      --scss, --sass, --css, --styles     Compile .sass and .scss files
      --ts, --js, --mts, --scripts        Compile .ts and .mts files
      --pug, --jade, --templates, --html  Compile .pug files
  -a, --all                               Compile all possible files
  -i, --src, --root, --in                 Root directory to watch
  -o, --dist, --dest, --build, --out      Root directory to watch
  -w, --watch                             Watch option
      --help                              Show help                    [boolean]
```