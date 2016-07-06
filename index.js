/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module unist:util:is
 * @fileoverview Utility to check if a node passes a test.
 */

'use strict';

/* eslint-env commonjs */
/* eslint-disable max-params */

/* Expose. */
module.exports = is;

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
  };
}

/**
 * Utility assert each property in `test` is represented
 * in `node`, and each values are strictly equal.
 *
 * @param {Object} test - Spec.
 * @return {is~test} - Tester.
 */
function matchesFactory(test) {
  return function (node) {
    var key;

    for (key in test) {
      if (node[key] !== test[key]) {
        return false;
      }
    }

    return true;
  };
}

/**
 * Assert if `test` passes for `node`.
 * When a `parent` node is known the `index` of node
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
  } else if (test === null || test === undefined) {
    test = first;
  } else if (typeof test === 'object') {
    test = matchesFactory(test);
  } else if (typeof test !== 'function') {
    throw new Error('Expected function, string, or object as test');
  }

  if (
    hasIndex &&
    (typeof index !== 'number' || index < 0 || index === Infinity)
  ) {
    throw new Error('Expected positive finite index or child node');
  }

  if (hasParent && (!is(null, parent) || !parent.children)) {
    throw new Error('Expected parent node');
  }

  if (!node || !node.type || typeof node.type !== 'string') {
    return false;
  }

  if (hasParent !== hasIndex) {
    throw new Error('Expected both parent and index');
  }

  return Boolean(test.call(context, node, index, parent));
}
