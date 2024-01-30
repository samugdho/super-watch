#!/usr/bin/env node

import watch from './main.mjs';
import yargs from 'yargs';

const argv = yargs(process.argv.slice(2))
	.option('scss', {
		alias: ['sass', 'css', 'styles'],
		describe: 'Compile .sass and .scss files'
	})
	.option('ts', {
		alias: ['js', 'mts', 'scripts'],
		describe: 'Compile .ts and .mts files'
	})
	.option('pug', {
		alias: ['jade', 'templates', 'html'],
		describe: 'Compile .pug files'
	})
	.option('a', {
		alias: ['all'],
		describe: 'Compile all possible files'
	})
	.option('i', {
		alias: ['src', 'root', 'in'],
		describe: 'Root directory to watch',
	})
	.option('o', {
		alias: ['dist', 'dest', 'build', 'out'],
		describe: 'Root directory to watch',
	})
	.option('w', {
		alias: ['watch',],
		describe: 'Watch option',
	})
	.help()
	.parse();

watch(argv);