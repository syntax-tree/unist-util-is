/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module unist:util:is
 * @fileoverview Test suite for `unit-util-is`.
 */

'use strict';

/* eslint-env node, mocha */

/*
 * Dependencies.
 */

var assert = require('assert');
var is = require('./');

/*
 * Methods.
 */

var throws = assert.throws;
var equal = assert.strictEqual;

/*
 * Tests.
 */

describe('unist-util-is', function () {
    var node = {
        'type': 'strong'
    };

    var parent = {
        'type': 'paragraph',
        'children': []
    };

    it('should throw when `test` is invalid', function () {
        throws(function () {
            is(false);
        }, /Expected function, string, or node as test/);
    });

    it('should throw when `index` is invalid', function () {
        throws(function () {
            is(null, node, -1, parent);
        }, /Expected positive finite index or child node/);

        throws(function () {
            is(null, node, Infinity, parent);
        }, /Expected positive finite index or child node/);

        throws(function () {
            is(null, node, false, parent);
        }, /Expected positive finite index or child node/);
    });

    it('should throw when `parent` is invalid', function () {
        throws(function () {
            is(null, node, 0, {});
        }, /Expected parent node/);

        throws(function () {
            is(null, node, 0, {
                'type': 'paragraph'
            });
        }, /Expected parent node/);
    });

    it('should throw `parent` xor `index` are given', function () {
        throws(function () {
            is(null, node, 0);
        }, /Expected both parent and index/);

        throws(function () {
            is(null, node, null, parent);
        }, /Expected both parent and index/);
    });

    it('should fail without node', function () {
        throws(function () {
            is();
        }, /Expected node/);
    });

    it('should return true without test', function () {
        equal(is(null, node), true);
    });

    it('should match types', function () {
        equal(is('strong', node), true);
        equal(is('emphasis', node), false);
    });

    it('should match nodes', function () {
        equal(is(node, node), true);
        equal(is(node, {
            'type': 'strong'
        }), false);
    });

    it('should accept a test', function () {
        /** Test. */
        function test(node, n) {
            return n === 5;
        }

        equal(is(test, node), false);
        equal(is(test, node, 0, parent), false);
        equal(is(test, node, 5, parent), true);
    });

    it('should invoke test', function (done) {
        var context = {
            'foo': 'bar'
        };

        /** Test. */
        function test(a, b, c) {
            equal(this, context);
            equal(a, node);
            equal(b, 5);
            equal(c, parent);
            done();
        }

        is(test, node, 5, parent, context);
    });
});
