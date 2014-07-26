'use strict';
var crypto = require('crypto');
var words = require('word-list-json');
var uniqueRandom = require('unique-random')(0, words.length - 1);
function randomWord() {
	return words[uniqueRandom()];
}
var https = require('https');
var Promise = require('bluebird');
var randomBytes = Promise.promisify(crypto.randomBytes);

var base = 'https://skimdb.npmjs.com/registry/';
function checkName(name) {
	return new Promise (function (resolve, reject) {
		https.get(base + name, function (res) {
			res.on('data',function(){});
			if (res.statusCode > 399) {
				return reject(res);
			}
			resolve();
		}).on('error', reject);
	});
}
function improve(name) {
	return randomBytes(1).then(function (buf) {
		var num = buf.readUInt8(0);
		if (num < 64) {
			name = 'node-' + name;
		} else if (num > 192) {
			name += '-js';
		}
		return name;
	});
}
function randomName(name, append) {
	if (append) {
		name += '-'
		name += randomWord();
	} else if (!name) {
		name = randomWord();
	}
	return improve(name).then(function(name){
		return checkName(name).then(function () {
				return randomName(name, true);
			}, function (e) {
				if (e.statusCode === 404) {
					return name;
				} else {
					throw e;
				}
			});
	});
}
module.exports = randomName;