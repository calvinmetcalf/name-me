name-me [![Build Status](https://travis-ci.org/calvinmetcalf/name-me.svg)](https://travis-ci.org/calvinmetcalf/name-me)
===

Comes up with a random name that is free on NPM.

```bash
npm install -g name-me
```

# CLI

```bash
name-me [name]
```
takes an optional argument for a name to work with

Options are 

- --length or -l which sets a max length from the dictionary (default 6).
- --package or -p which modifies the package.json of the current directory to use the generated name.

## Examples:

```
$ name-me
quipus
$ name-me ajax
ajax-js
$ name-me -p
# adds it to the package.js
$ name-me -l 3
node-oy
```

# node

```js
var nameMe = require('name-me');
```

takes 2 arguments both optional, a name to work with, which if available will be returned, or if not available will be 'improved' also takes a number which specifies max length of random words to get from the dictionary, returns a promise.

```js
nameMe().then(function (name) {
  console.log(name);
});
nameMe(2).then(function (name) {
  //build with max 3 letter words
  console.log(name);
});
nameMe(ajax).then(function (name) {
  //build around 'ajax' which isn't available
  console.log(name);
});
```