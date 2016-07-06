/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module unist:util:is
 * @fileoverview Test suite for `unit-util-is`.
 */

'use strict';

/* eslint-env node */

/* Dependencies. */
var test = require('tape');
var is = require('./');

/* Tests. */
test('unist-util-is', function (t) {
  var node = {type: 'strong'};
  var parent = {type: 'paragraph', children: []};

  t.throws(
    function () {
      is(false);
    },
    /Expected function, string, or object as test/,
    'should throw when `test` is invalid'
  );

  t.throws(
    function () {
      is(null, node, -1, parent);
    },
    /Expected positive finite index or child node/,
    'should throw when `index` is invalid (#1)'
  );

  t.throws(
    function () {
      is(null, node, Infinity, parent);
    },
    /Expected positive finite index or child node/,
    'should throw when `index` is invalid (#2)'
  );

  t.throws(
    function () {
      is(null, node, false, parent);
    },
    /Expected positive finite index or child node/,
    'should throw when `index` is invalid (#3)'
  );

  t.throws(
    function () {
      is(null, node, 0, {});
    },
    /Expected parent node/,
    'should throw when `parent` is invalid (#1)'
  );

  t.throws(
    function () {
      is(null, node, 0, {
        type: 'paragraph'
      });
    },
    /Expected parent node/,
    'should throw when `parent` is invalid (#2)'
  );

  t.throws(
    function () {
      is(null, node, 0);
    },
    /Expected both parent and index/,
    'should throw `parent` xor `index` are given (#1)'
  );

  t.throws(
    function () {
      is(null, node, null, parent);
    },
    /Expected both parent and index/,
    'should throw `parent` xor `index` are given (#2)'
  );

  t.throws(
    function () {
      is();
    },
    /Expected node/,
    'should fail without node'
  );

  t.equal(is(null, node), true, 'should return true without test');

  t.equal(is('strong', node), true, 'should match types (#1)');
  t.equal(is('emphasis', node), false, 'should match types (#2)');

  t.equal(is(node, node), true, 'should match partially (#1)');
  t.equal(is({type: 'strong'}, node), true, 'should match partially (#2)');
  t.equal(is({type: 'paragraph'}, parent), true, 'should match partially (#3)');
  t.equal(is({type: 'paragraph'}, node), false, 'should match partially (#4)');

  t.test('should accept a test', function (st) {
    /** Test. */
    function test(node, n) {
      return n === 5;
    }

    st.equal(is(test, node), false);
    st.equal(is(test, node, 0, parent), false);
    st.equal(is(test, node, 5, parent), true);

    st.end();
  });

  t.test('should invoke test', function (st) {
    var context = {foo: 'bar'};

    st.plan(4);

    /** Test. */
    function test(a, b, c) {
      st.equal(this, context);
      st.equal(a, node);
      st.equal(b, 5);
      st.equal(c, parent);
    }

    is(test, node, 5, parent, context);
  });

  t.end();
});
