/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module unist:util:is
 * @fileoverview Utility to check if a node passes a test.
 */

'use strict';

/* eslint-env commonjs */

/**
 * Test.
 *
 * @typedef {Function} is~test
 * @param {Node} node - Node to test.
 * @param {number} index - Position of `node` in `parent`.
 * @param {Node} parent - Parent of `node`.
 * @return {boolean?} - Whether this iteration passes.
 */

/**
 * Utility to return true.
 *
 * @type {is~test}
 */
function first() {
    return true;
}

/**
 * Utility to convert a string into a function which checks
 * a given node’s type for said string.
 *
 * @param {string} test - Node type to test.
 * @return {is~test} - Tester.
 */
function typeFactory(test) {
    return function (node) {
        return Boolean(node && node.type === test);
    }
}

/**
 * Utility to convert a node into a function which checks
 * a given node for strict equality.
 *
 * @param {Node} test - Node to test.
 * @return {is~test} - Tester.
 */
function nodeFactory(test) {
    return function (node) {
        return node === test;
    }
}

/**
 * Assert if `test` passes for `node`.
 * When a `parent` node is known the `index` of node
 *
 * @example
 *   is(null, {type: 'strong'}); // true
 *
 * @example
 *   is('strong', {type: 'strong'}); // true
 *   is('emphasis', {type: 'strong'}); // false
 *
 * @example
 *   var node = {type: 'strong'};
 *   is(node, node) // true
 *   is(node, {type: 'strong'}) // false
 *
 * @example
 *   var node = {type: 'strong'};
 *   var parent = {type: 'paragraph', children: [node]};
 *   function test(node, n) {return n === 5};
 *   is(test, {type: 'strong'}); // false
 *   is(test, {type: 'strong'}, 4, parent); // false
 *   is(test, {type: 'strong'}, 5, parent); // true
 *
 * @example
 *   var node = {type: 'strong'};
 *   var parent = {type: 'paragraph', children: [node]};
 *   is('strong'); // throws
 *   is('strong', node, 0) // throws
 *   is('strong', node, null, parent) // throws
 *   is('strong', node, 0, {type: 'paragraph'}) // throws
 *   is('strong', node, -1, parent) // throws
 *   is('strong', node, Infinity, parent) // throws
 *
 * @param {(string|Node|is~test)?} test - Tester.
 * @param {Node} node - Node to test.
 * @param {number?} [index] - Position of `node` in `parent`.
 * @param {Node?} [parent] - Parent of `node`.
 * @param {*} [context] - Context to invoke `test` with.
 * @return {boolean} - Whether `test` passes.
 */
function is(test, node, index, parent, context) {
    var hasParent = parent !== null && parent !== undefined;
    var hasIndex = index !== null && index !== undefined;

    if (typeof test === 'string') {
        test = typeFactory(test);
    } else if (test && test.type) {
        test = nodeFactory(test);
    } else if (test === null || test === undefined) {
        test = first;
    } else if (typeof test !== 'function') {
        throw new Error('Expected function, string, or node as test');
    }

    if (!node || !node.type) {
        throw new Error('Expected node');
    }

    if (
        hasIndex &&
        (typeof index !== 'number' || index < 0 || index === Infinity)
    ) {
        throw new Error('Expected positive finite index or child node');
    }

    if (hasParent && (!parent || !parent.type || !parent.children)) {
        throw new Error('Expected parent node');
    }

    if (hasParent !== hasIndex) {
        throw new Error('Expected both parent and index');
    }

    return Boolean(test.call(context, node, index, parent));
}

/*
 * Expose.
 */

module.exports = is;
