/**
 * @typedef {import('unist').Node} Node
 */

import test from 'tape'
import fc from 'fast-check'
import lodash from 'lodash'
import {is} from '../index.js'

const {isObject, isPlainObject, pick, cloneDeep} = lodash

test('unist-util-is properties', (t) => {
  t.plan(4)
  t.doesNotThrow(
    () =>
      fc.assert(
        // @ts-expect-error: fine.
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
          fc.unicodeJsonValue().filter(
            // @ts-expect-error Looks like a node.
            (node) => !(isPlainObject(node) && typeof node.type === 'string')
          ),
          // @ts-expect-error: fine.
          (node) => !is(node)
        )
      ),
    'should see any object w/o a `type` as a non-node'
  )

  t.doesNotThrow(
    () =>
      fc.assert(
        // @ts-expect-error: fine.
        fc.property(fc.record({type: fc.string({minLength: 1})}), (node) => {
          is(node, node.type)
        })
      ),
    'should match types'
  )

  t.doesNotThrow(
    () =>
      fc.assert(
        fc.property(
          fc
            .unicodeJsonValue()
            // Filter for JSON objects which unist can work with
            .filter(
              (node) =>
                isPlainObject(node) &&
                // @ts-expect-error: hush
                Object.keys(node).some((key) => !isObject(node[key]))
            )
            // Return node and a list with a random subset of its primitive value keys
            .chain((node) =>
              fc.tuple(
                fc.constant(node),
                fc.subarray(
                  // @ts-expect-error: hush
                  Object.keys(node).filter((key) => !isObject(node[key])),
                  {minLength: 1}
                )
              )
            ),
          // @ts-expect-error: fine.
          fc.string({minLength: 1}),
          (
            /** @type {[Record<string, unknown>, Array<string>]} */ nodeAndKeys,
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
