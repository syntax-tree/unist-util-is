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
          .unicodeJsonObject()
          // Filter for JSON objects which unist can work with
          .filter(function (node) {
            return (
              // json needs to be a plain object
              _.isPlainObject(node) &&
              // also needs to have some keys with primitive values
              _.some(_.keys(node), function (key) {
                return !_.isObject(node[key])
              })
            )
          })
          // Return node and a list with a random subset of it's primitive value keys
          .chain(function (node) {
            return fc.tuple(
              fc.constant(node),
              fc.subarray(
                _.keys(node).filter(function (key) {
                  return !_.isObject(node[key])
                }),
                {minLength: 1}
              )
            )
          }),
        fc.string({minLength: 1}),
        function (nodeAndKeys, type) {
          var nodeProperties = nodeAndKeys[0]
          var keys = nodeAndKeys[1]

          var node = _.assign(nodeProperties, {type: type})
          var subsetOfNode = _.pick(_.cloneDeep(node), keys)
          return is(node, subsetOfNode)
        }
      )
    )
  }, 'should match partially')
})
