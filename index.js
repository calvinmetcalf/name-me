'use strict';
var words = require('word-list-json');
var uniqueRandom = require('unique-random');
var uniqueRandoms = {
	full: uniqueRandom(0, words.length - 1)
};
Object.keys(words.lengths).forEach(function (len) {
	uniqueRandoms[len] = uniqueRandom(0, words.lengths[len] - 1);
});
function randomWord(len) {
	len = len || 'full';
	var word = words[uniqueRandoms[len]()];
	return word;
}
var https = require('https');
var Promise = require('bluebird');
var randomNumber = uniqueRandom(0, 3);

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
function improve(name, len) {
	var num = randomNumber();
	if (num === 3) {
		name = 'node-' + name;
	} else if (num === 0) {
		name += '-js';
	} else {
		name += '-';
		name += randomWord(len);
	}
	return randomName(name, len);
}
function randomName(name, len) {
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