//@ts-check
import chokidar from 'chokidar';
import path from 'path';

import * as sass from 'sass';
import fs from 'fs';
import fse from 'fs-extra';
import pug from 'pug';
import ts from 'typescript';




const Reset = "\x1b[0m";
const Dim = "\x1b[2m";
const Bright = "\x1b[1m"
const FgGray = "\x1b[90m";
const FgGreen = "\x1b[32m"
const FgBlue = "\x1b[34m";
const FgCyan = "\x1b[36m";
const Link = Bright + FgCyan;
const BgRed = "\x1b[41m";
function t(){
	return `[${Dim + FgGray + (new Date().toLocaleTimeString()) + Reset}]`;
}
/**
 * 
 * @param {string} file 
 * @param {string} data 
 * @param {{input: string, output: string}} folderIO 
 */
function save(file, data, folderIO){
	const dir = path.dirname(file);
	fse.ensureDirSync(dir);
	fs.writeFileSync(file, data);
	console.log(t() + FgGreen + ' saved \n  ' + Link + path.relative(folderIO.input, file) + Reset);
}
/**
 * Checks in argv for type and all
 * @param {string} type 
 * @param {*} argv
 */
function check(type, argv){
	return type in argv || 'a' in argv;
}
/**
 * @type {ts.TranspileOptions}
 */
const tsConfig = {
	reportDiagnostics: true, 
	compilerOptions: {
		target: ts.ScriptTarget.ES2017,
		noImplicitAny: true,
		// strict: true,
		noImplicitReturn: true,
		moduleResolution: ts.ModuleResolutionKind.Node10,
	}
}

/**
 * 
 * @param {string} chk Check string to
 * @param {string[]} exts 
 * @param {path.ParsedPath} parsed 
 * @param {string} filePath 
 * @param {(filePath: string) => [boolean, string]} compile 
 * @param {string} ext 
 * @param {string} errt 
 * @param {any} argv 
 * @param {{input: string, output: string}} folderIO 
 */
function handler(chk, exts, parsed, filePath, compile, ext, errt, folderIO, argv){
	if(check(chk, argv)){
		if(exts.includes(parsed.ext)){
			try{
				const file = fs.readFileSync(filePath);
				const [success, data] = compile(file.toString());
				if(success){
					const out = path.join(folderIO.output, parsed.dir, parsed.name + ext);
					save(out, data, folderIO);
				}else{
					throw new Error(data);
				}
			}catch(err){
				if(err instanceof Error){
					console.log(t() + ' ' + BgRed + ' ' + errt + ' Error ' + Reset + '\n  ' + err.message);
				}else{
					console.log(err);
				}
			}
		}
	}
}
/**
 * 
 * @param {ts.TranspileOutput} result 
 * @returns {[boolean, string]}
 */
function tshandler(result){
	if (result.diagnostics && result.diagnostics.length > 0) {
		/** @type {string[]} */
		const messages = [];
		result.diagnostics.forEach((diagnostic) => {
			const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
			if (diagnostic.file) {
				const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start || 0);
				messages.push(
					`${pos(line, character)}: ${message}`
				);
			} else {
				messages.push(message);
			}
		});
		return [false, '\b\b'+messages.join('\n')];
	} else {
		// No compilation errors, print the compiled JavaScript code.
		return [true, result.outputText];
	}
}
/**
 * 
 * @param {number} line 
 * @param {number} character 
 * @returns {string}
 */
function pos(line, character) {
	return '(' + Dim + FgGray + 'Ln ' + Reset + line + Dim + FgGray + ', Col ' + Reset + character +')'
}

/**
 * 
 * @param {object} argv 
 */
export default function start(argv){



	const folderIO = {
		input: path.resolve('./'),
		output: path.resolve('./'),
	}

	if('i' in argv && typeof argv.i === 'string') {
		folderIO.input = path.resolve(argv['i']);
		folderIO.output = folderIO.input;
	}
	if('o' in argv && typeof argv.o === 'string') {
		folderIO.output = path.resolve(argv['o']);
	}
	
	const watcher = chokidar.watch(`${folderIO.input}`, { 
		ignored: /(^|[/\\])\../, 
		persistent: true, 
		ignoreInitial: true, 
		depth: 99 
	});
	watcher.on('all', (event, filePath) => {
		const relativePath = path.relative(folderIO.input, filePath);
		// const isFolder = event.endsWith('Dir');
		console.log(t() + ` ${FgGreen + event + Reset}\n  ${Link + relativePath + Reset}`);
		if(['add', 'change', ].includes(event)){
			const parsed = path.parse(relativePath);
			handler('css', ['.scss', '.sass'], parsed, 
				filePath, f => [true, sass.compileString(f).css], '.css', 'Sass', folderIO, argv);
			handler('pug', ['.pug'], parsed, 
				filePath, f => [true,pug.render(f)], '.html', 'Pug', folderIO, argv);
			handler('ts', ['.ts', '.mts'], parsed, 
				filePath, f => tshandler(ts.transpileModule(f, tsConfig)), 
				(parsed.ext.length == 4 ? '.mjs' : '.js'), 'TypeScript', folderIO, argv);
		}
	});
	const types = [];
	if(check('css', argv)) types.push('Sass');
	if(check('js', argv)) types.push('TypeScript');
	if(check('pug', argv)) types.push('Pug');
	console.log(`${t() + FgGreen + " watch" + Reset + ' (' + (types.length > 0 ? types.join(', ') : 'None') + ')'}\n  ${Link + folderIO.input + Reset}`);
	if(folderIO.output != folderIO.input) {
		console.log(`${t() + FgGreen + " out" + Reset}\n  ` + Link + folderIO.output + Reset);
	}
	const bar = Dim + FgGray +  '==========================' + Reset;
	console.log(bar);

	// Gracefully stop the watcher when the process is terminated
	process.on('SIGINT', () => {
		console.log('exit...');
		watcher.close();
		process.exit();
	});
}
