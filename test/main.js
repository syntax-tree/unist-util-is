/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 */

import test from 'tape'
import {is} from '../index.js'

test('unist-util-is', (t) => {
  const node = {type: 'strong'}
  const parent = {type: 'paragraph', children: []}

  t.throws(
    () => {
      // @ts-expect-error runtime.
      is(null, false)
    },
    /Expected function, string, or object as test/,
    'should throw when `test` is invalid'
  )

  t.throws(
    () => {
      is(node, null, -1, parent)
    },
    /Expected positive finite index/,
    'should throw when `index` is invalid (#1)'
  )

  t.throws(
    () => {
      is(node, null, Number.POSITIVE_INFINITY, parent)
    },
    /Expected positive finite index/,
    'should throw when `index` is invalid (#2)'
  )

  t.throws(
    () => {
      // @ts-expect-error runtime.
      is(node, null, false, parent)
    },
    /Expected positive finite index/,
    'should throw when `index` is invalid (#3)'
  )

  t.throws(
    () => {
      // @ts-expect-error runtime.
      is(node, null, 0, {})
    },
    /Expected parent node/,
    'should throw when `parent` is invalid (#1)'
  )

  t.throws(
    () => {
      // @ts-expect-error runtime.
      is(node, null, 0, {type: 'paragraph'})
    },
    /Expected parent node/,
    'should throw when `parent` is invalid (#2)'
  )

  t.throws(
    () => {
      // @ts-expect-error: both `index` and `parent` are needed.
      is(node, null, 0)
    },
    /Expected both parent and index/,
    'should throw `parent` xor `index` are given (#1)'
  )

  t.throws(
    () => {
      // @ts-expect-error: both `index` and `parent` are needed.
      is(node, null, null, parent)
    },
    /Expected both parent and index/,
    'should throw `parent` xor `index` are given (#2)'
  )
  t.notok(is(), 'should not fail without node')
  t.ok(is(node), 'should check if given a node (#1)')
  t.notok(is({children: []}, null), 'should check if given a node (#2)')

  t.ok(is(node, 'strong'), 'should match types (#1)')
  t.notok(is(node, 'emphasis'), 'should match types (#2)')

  t.ok(is(node, node), 'should match partially (#1)')
  t.ok(is(node, {type: 'strong'}), 'should match partially (#2)')
  t.ok(is(parent, {type: 'paragraph'}), 'should match partially (#3)')
  t.notok(is(node, {type: 'paragraph'}), 'should match partially (#4)')

  t.test('should accept a test', (t) => {
    /**
     * @param {unknown} _
     * @param {number|null|undefined} n
     * @returns {boolean}
     */
    function test(_, n) {
      return n === 5
    }

    t.notok(is(node, test))
    t.notok(is(node, test, 0, parent))
    t.ok(is(node, test, 5, parent))

    t.end()
  })

  t.test('should call test', (t) => {
    const context = {foo: 'bar'}

    t.plan(4)

    /**
     * @this {context}
     * @param {Node} a
     * @param {number|null|undefined} b
     * @param {Parent|null|undefined} c
     */
    function test(a, b, c) {
      t.equal(this, context)
      t.equal(a, node)
      t.equal(b, 5)
      t.equal(c, parent)
    }

    is(node, test, 5, parent, context)
  })

  t.ok(is(node, ['strong', 'emphasis']), 'should match arrays (#1)')
  t.notok(is(node, ['b', 'i']), 'should match arrays (#2)')

  t.test('should match arrays (#3)', (t) => {
    const context = {foo: 'bar'}

    t.plan(5)

    t.ok(is(node, [test, 'strong'], 5, parent, context))

    /**
     * @this {context}
     * @param {Node} a
     * @param {number|null|undefined} b
     * @param {Parent|null|undefined} c
     * @returns {boolean}
     */
    function test(a, b, c) {
      t.equal(this, context)
      t.equal(a, node)
      t.equal(b, 5)
      t.equal(c, parent)
      return false
    }
  })

  t.end()
})
