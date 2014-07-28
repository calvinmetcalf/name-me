var test = require('tape');
var Promise = require('bluebird');
var nameMe = require('./');

test('generates a name', function (t) {
  t.plan(1);
  nameMe().then(function (resp) {
    t.ok(resp.length > 2);
  });
});
test('generates a name with input', function (t) {
  t.plan(1);
  nameMe('foo').then(function (resp) {
    t.ok(~resp.indexOf('foo'));
  });
});
test('reject a name with invalid input', function (t) {
  t.plan(1);
  nameMe('.foo').then(function (resp) {
    t.ok(false, 'this should not run');
  }, function () {
    t.ok(true);
  });
});
test('reject a name with invalid input', function (t) {
  var len = 100;
  t.plan(len);
  var a = new Array(len);
  var i = -1;
  while (++i < len) {
    a[i] = nameMe(5);
  }
  Promise.all(a).then(function (list) {
    list.forEach(function (item) {
      t.ok(item.split('-').every(function (i){
        return i.length < 6;
      }), item);
    });
  });
});