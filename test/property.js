import test from 'tape'
import fc from 'fast-check'
import lodash from 'lodash'
import {is} from '../index.js'

var {isObject, isPlainObject, pick, cloneDeep} = lodash

test('unist-util-is properties', (t) => {
  t.plan(4)
  t.doesNotThrow(
    () =>
      fc.assert(
        fc.property(fc.record({type: fc.string({minLength: 1})}), (node) =>
          is(node)
        )
      ),
    'should see any object w/ a non-empty `type` as a node'
  )

  t.doesNotThrow(
    () =>
      fc.assert(
        fc.property(
          fc.unicodeJsonObject().filter(
            // @ts-ignore Looks like a node.
            (node) => !(isPlainObject(node) && typeof node.type === 'string')
          ),
          (node) => !is(node)
        )
      ),
    'should see any object w/o a `type` as a non-node'
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
            // Return node and a list with a random subset of its primitive value keys
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
          (
            /** @type {[Object.<string, unknown>, Array.<string>]} */ nodeAndKeys,
            /** @type {string} */ type
          ) => {
            const nodeProperties = nodeAndKeys[0]
            const keys = nodeAndKeys[1]

            const node = {...nodeProperties, type}
            const subsetOfNode = pick(cloneDeep(node), keys)
            return is(node, subsetOfNode)
          }
        )
      ),
    'should match partially'
  )
})
