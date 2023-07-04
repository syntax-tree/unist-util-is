/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {is} from 'unist-util-is'

test('is', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('unist-util-is')).sort(), [
      'convert',
      'is'
    ])
  })

  const node = {type: 'strong'}
  const parent = {type: 'paragraph', children: []}

  await t.test('should throw when `test` is invalid', async function () {
    assert.throws(function () {
      // @ts-expect-error: check that an error is thrown at runtime.
      is(null, false)
    }, /Expected function, string, or object as test/)
  })

  await t.test('should throw when `index` is invalid (#1)', async function () {
    assert.throws(function () {
      is(node, null, -1, parent)
    }, /Expected positive finite index/)
  })

  await t.test('should throw when `index` is invalid (#2)', async function () {
    assert.throws(function () {
      is(node, null, Number.POSITIVE_INFINITY, parent)
    }, /Expected positive finite index/)
  })

  await t.test('should throw when `index` is invalid (#3)', async function () {
    assert.throws(function () {
      // @ts-expect-error: check that an error is thrown at runtime.
      is(node, null, false, parent)
    }, /Expected positive finite index/)
  })

  await t.test('should throw when `parent` is invalid (#1)', async function () {
    assert.throws(function () {
      // @ts-expect-error: check that an error is thrown at runtime.
      is(node, null, 0, {})
    }, /Expected parent node/)
  })

  await t.test('should throw when `parent` is invalid (#2)', async function () {
    assert.throws(function () {
      // @ts-expect-error: check that an error is thrown at runtime.
      is(node, null, 0, {type: 'paragraph'})
    }, /Expected parent node/)
  })

  await t.test(
    'should throw `parent` xor `index` are given (#1)',
    async function () {
      assert.throws(function () {
        is(node, null, 0)
      }, /Expected both parent and index/)
    }
  )

  await t.test(
    'should throw `parent` xor `index` are given (#2)',
    async function () {
      assert.throws(function () {
        is(node, null, null, parent)
      }, /Expected both parent and index/)
    }
  )

  await t.test('should not fail without node', async function () {
    assert.ok(!is())
  })

  await t.test('should check if given a node (#1)', async function () {
    assert.ok(is(node))
  })

  await t.test('should check if given a node (#2)', async function () {
    assert.ok(!is({children: []}, null))
  })

  await t.test('should match types (#1)', async function () {
    assert.ok(is(node, 'strong'))
  })

  await t.test('should match types (#2)', async function () {
    assert.ok(!is(node, 'emphasis'))
  })

  await t.test('should match partially (#1)', async function () {
    assert.ok(is(node, node))
  })

  await t.test('should match partially (#2)', async function () {
    assert.ok(is(node, {type: 'strong'}))
  })

  await t.test('should match partially (#3)', async function () {
    assert.ok(is(parent, {type: 'paragraph'}))
  })

  await t.test('should match partially (#4)', async function () {
    assert.ok(!is(node, {type: 'paragraph'}))
  })

  await t.test('should accept a test', function () {
    assert.ok(!is(node, test))
    assert.ok(!is(node, test, 0, parent))
    assert.ok(is(node, test, 5, parent))

    /**
     * @param {unknown} _
     * @param {number | undefined} n
     * @returns {boolean}
     */
    function test(_, n) {
      return n === 5
    }
  })

  await t.test('should call test', function () {
    const context = {foo: 'bar'}
    let calls = 0

    is(node, test, 5, parent, context)
    assert.equal(calls, 1)

    /**
     * @this {unknown}
     * @param {Node} a
     * @param {number | undefined} b
     * @param {Parent | undefined} c
     */
    function test(a, b, c) {
      assert.equal(this, context)
      assert.equal(a, node)
      assert.equal(b, 5)
      assert.equal(c, parent)
      calls++
    }
  })

  await t.test('should match arrays (#1)', async function () {
    assert.ok(is(node, ['strong', 'emphasis']))
  })

  await t.test('should match arrays (#2)', async function () {
    assert.ok(!is(node, ['b', 'i']))
  })

  await t.test('should match arrays (#3)', function () {
    const context = {foo: 'bar'}
    let calls = 0

    assert.ok(is(node, [test, 'strong'], 5, parent, context))
    assert.equal(calls, 1)

    /**
     * @this {unknown}
     * @param {Node} a
     * @param {number | undefined} b
     * @param {Parent | undefined} c
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
