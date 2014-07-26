'use strict';
var crypto = require('crypto');
var words = require('word-list-json');
var uniqueRandom = require('unique-random')(0, words.length - 1);
function randomWord(len) {
	var word = words[uniqueRandom()];
	if (!len) {
		return word;
	}
	while (word.length > len) {
		word =  words[uniqueRandom()];
	}
	return word;
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
function randomName(name, append, len) {
	if (append) {
		name += '-'
	} else if (!name) {
		name = '';
	}
	name += randomWord(len);
	return improve(name).then(function(name){
		return checkName(name).then(function () {
				return randomName(name, true, len);
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