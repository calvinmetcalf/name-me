#!/usr/bin/env node

'use strict';
var crypto = require('crypto');

var randomWord = require('random-word');
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
function randomName() {
	var name = randomWord();
	return randomBytes(1).then(function (buf) {
		var num = buf.readUInt8(0);
		if (num < 64) {
			name = 'node-' + name;
		} else if (num > 192) {
			name += '-js';
		}
		return name;
	}).then(function(name){
		return checkName(name).then(function () {
				return randomName();
			}, function (e) {
				if (e.statusCode === 404) {
					console.log(name);
					process.exit();
				} else {
					process.nextTick(function () {
						throw e;	
					});
				}
			});
	});
}
randomName();