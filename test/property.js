'use strict'

const test = require('tape')
const fc = require('fast-check')
const {isObject, isPlainObject, pick, cloneDeep} = require('lodash')
const is = require('..')

test('unist-util-is properties', (t) => {
  t.plan(4)
  t.doesNotThrow(
    () =>
      fc.assert(
        fc.property(fc.record({type: fc.string({minLength: 1})}), (node) =>
          is(node)
        )
      ),
    'should check if given node (#1)'
  )

  t.doesNotThrow(
    () =>
      fc.assert(
        fc.property(
          fc
            .dictionary(fc.string(), fc.string())
            .filter((node) => typeof node.type === 'undefined'),
          (node) => !is(node)
        )
      ),
    'should check if given node (#2)'
  )

  t.doesNotThrow(
    () =>
      fc.assert(
        fc.property(fc.record({type: fc.string({minLength: 1})}), (node) =>
          is(node, node.type)
        )
      ),
    'should match types'
  )

  t.doesNotThrow(
    () =>
      fc.assert(
        fc.property(
          fc
            .unicodeJsonObject()
            // Filter for JSON objects which unist can work with
            .filter(
              (node) =>
                isPlainObject(node) &&
                Object.keys(node).some((key) => !isObject(node[key]))
            )
            // Return node and a list with a random subset of it's primitive value keys
            .chain((node) =>
              fc.tuple(
                fc.constant(node),
                fc.subarray(
                  Object.keys(node).filter((key) => !isObject(node[key])),
                  {minLength: 1}
                )
              )
            ),
          fc.string({minLength: 1}),
          (nodeAndKeys, type) => {
            const nodeProperties = nodeAndKeys[0]
            const keys = nodeAndKeys[1]

            const node = {...nodeProperties, type: type}
            const subsetOfNode = pick(cloneDeep(node), keys)
            return is(node, subsetOfNode)
          }
        )
      ),
    'should match partially'
  )
})
