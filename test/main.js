/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {is} from '../index.js'
import * as mod from '../index.js'

test('is', async (t) => {
  assert.deepEqual(
    Object.keys(mod).sort(),
    ['convert', 'is'],
    'should expose the public api'
  )

  const node = {type: 'strong'}
  const parent = {type: 'paragraph', children: []}

  assert.throws(
    () => {
      // @ts-expect-error runtime.
      is(null, false)
    },
    /Expected function, string, or object as test/,
    'should throw when `test` is invalid'
  )

  assert.throws(
    () => {
      is(node, null, -1, parent)
    },
    /Expected positive finite index/,
    'should throw when `index` is invalid (#1)'
  )

  assert.throws(
    () => {
      is(node, null, Number.POSITIVE_INFINITY, parent)
    },
    /Expected positive finite index/,
    'should throw when `index` is invalid (#2)'
  )

  assert.throws(
    () => {
      // @ts-expect-error runtime.
      is(node, null, false, parent)
    },
    /Expected positive finite index/,
    'should throw when `index` is invalid (#3)'
  )

  assert.throws(
    () => {
      // @ts-expect-error runtime.
      is(node, null, 0, {})
    },
    /Expected parent node/,
    'should throw when `parent` is invalid (#1)'
  )

  assert.throws(
    () => {
      // @ts-expect-error runtime.
      is(node, null, 0, {type: 'paragraph'})
    },
    /Expected parent node/,
    'should throw when `parent` is invalid (#2)'
  )

  assert.throws(
    () => {
      // @ts-expect-error: both `index` and `parent` are needed.
      is(node, null, 0)
    },
    /Expected both parent and index/,
    'should throw `parent` xor `index` are given (#1)'
  )

  assert.throws(
    () => {
      // @ts-expect-error: both `index` and `parent` are needed.
      is(node, null, null, parent)
    },
    /Expected both parent and index/,
    'should throw `parent` xor `index` are given (#2)'
  )
  assert.ok(!is(), 'should not fail without node')
  assert.ok(is(node), 'should check if given a node (#1)')
  assert.ok(!is({children: []}, null), 'should check if given a node (#2)')

  assert.ok(is(node, 'strong'), 'should match types (#1)')
  assert.ok(!is(node, 'emphasis'), 'should match types (#2)')

  assert.ok(is(node, node), 'should match partially (#1)')
  assert.ok(is(node, {type: 'strong'}), 'should match partially (#2)')
  assert.ok(is(parent, {type: 'paragraph'}), 'should match partially (#3)')
  assert.ok(!is(node, {type: 'paragraph'}), 'should match partially (#4)')

  await t.test('should accept a test', () => {
    assert.ok(!is(node, test))
    assert.ok(!is(node, test, 0, parent))
    assert.ok(is(node, test, 5, parent))

    /**
     * @param {unknown} _
     * @param {number | null | undefined} n
     * @returns {boolean}
     */
    function test(_, n) {
      return n === 5
    }
  })

  await t.test('should call test', () => {
    const context = {foo: 'bar'}
    let calls = 0

    is(node, test, 5, parent, context)
    assert.equal(calls, 1)

    /**
     * @this {unknown}
     * @param {Node} a
     * @param {number | null | undefined} b
     * @param {Parent | null | undefined} c
     */
    function test(a, b, c) {
      assert.equal(this, context)
      assert.equal(a, node)
      assert.equal(b, 5)
      assert.equal(c, parent)
      calls++
    }
  })

  assert.ok(is(node, ['strong', 'emphasis']), 'should match arrays (#1)')
  assert.ok(!is(node, ['b', 'i']), 'should match arrays (#2)')

  await t.test('should match arrays (#3)', () => {
    const context = {foo: 'bar'}
    let calls = 0

    assert.ok(is(node, [test, 'strong'], 5, parent, context))
    assert.equal(calls, 1)

    /**
     * @this {unknown}
     * @param {Node} a
     * @param {number | null | undefined} b
     * @param {Parent | null | undefined} c
     * @returns {boolean}
     */
    function test(a, b, c) {
      assert.equal(this, context)
      assert.equal(a, node)
      assert.equal(b, 5)
      assert.equal(c, parent)
      calls++
      return false
    }
  })
})
