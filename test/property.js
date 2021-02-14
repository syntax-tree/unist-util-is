'use strict'

var test = require('tape')
var fc = require('fast-check')
var _ = require('lodash')
var is = require('..')

test('unist-util-is properties', function (t) {
  t.plan(4)
  t.doesNotThrow(function () {
    fc.assert(
      fc.property(
        fc.record({type: fc.string({minLength: 1})}),
        function (node) {
          return is(node)
        }
      )
    )
  }, 'should check if given node (#1)')

  t.doesNotThrow(function () {
    fc.assert(
      fc.property(
        fc.dictionary(fc.string(), fc.string()).filter(function (node) {
          return typeof node.type === 'undefined'
        }),
        function (node) {
          return !is(node)
        }
      )
    )
  }, 'should check if given node (#2)')

  t.doesNotThrow(function () {
    fc.assert(
      fc.property(
        fc.record({type: fc.string({minLength: 1})}),
        function (node) {
          return is(node, node.type)
        }
      )
    )
  }, 'should match types')

  t.doesNotThrow(function () {
    fc.assert(
      fc.property(
        fc
          // generate an object with primitive values
          .dictionary(
            fc.string(),
            fc.oneof(fc.string(), fc.integer(), fc.bigInt(), fc.boolean())
          )
          // object must have some keys
          .filter(function (node) { return _.keys(node).length > 1})
          // return node and a list with a random subset of it's keys
          .chain(function (node) {
            return fc.tuple(fc.constant(node), fc.subarray(_.keys(node), {minLength: 1}))
          }),
        fc.string({minLength: 1}),
        function (nodeAndKeys, type) {
          var node = nodeAndKeys[0]
          var keys = nodeAndKeys[1]
          return is(_.assign(node, {type: type}), _.pick(_.cloneDeep(node), keys))
        }
      )
    )
  }, 'should match partially')
})
