'use strict';
var randomWord = require('random-word-by-length');
var uniqueRandom = require('unique-random');
var https = require('https');
var Promise = require('bluebird');
var randomNumber = uniqueRandom(0, 3);

var base = 'https://skimdb.npmjs.com/registry/';
if (process.browser) {
	base = 'https://skimdb.iriscouch.com/registry/';
}
function checkName(name) {
	return new Promise (function (resolve, reject) {
		if (inValid(name)) {
		throw new Error(name + ' is an invalid npm name');
		}
		https.get(base + name, function (res) {
			res.on('data',function(){});
			if (res.statusCode > 399 || res.statusCode < 200) {
				return reject(res);
			}
			resolve();
		}).on('error', reject);
	});
}
function improve(name, len) {
	var num = randomNumber();
	if (num === 0 && name.slice(0, 5) !== 'node-') {
		name = 'node-' + name;
		return randomName(name, len);
	} 
	if (num === 1 && name.slice(-3) !== '-js') {
		name += '-js';
		return randomName(name, len);
	}
	if (name.slice(-3) === '-js') {
		name = randomWord(len) + '-' + name;
		return randomName(name, len);
	}
	name += '-';
	name += randomWord(len);
	return randomName(name, len);
	
}
var inValidStart = /^[_\.]/;
var noSlash = /[\/\\]/;
function inValid(name) {
	return inValidStart.test(name) || noSlash.test(name);
}
function randomName(name, len) {
	if (typeof name === 'number') {
		len = name;
		name = false;
	}
	name =  name || randomWord(len);
	return checkName(name).then(function () {
			return improve(name, len);
		}, function (e) {
			if (e.statusCode === 404) {
				return name;
			} else {
				throw e;
			}
		});
}
module.exports = randomName;