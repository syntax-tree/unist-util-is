'use strict'

var test = require('tape')
var is = require('.')

test('unist-util-is', function(t) {
  var node = {type: 'strong'}
  var parent = {type: 'paragraph', children: []}

  t.throws(
    function() {
      is(null, false)
    },
    /Expected function, string, or object as test/,
    'should throw when `test` is invalid'
  )

  t.throws(
    function() {
      is(node, null, -1, parent)
    },
    /Expected positive finite index or child node/,
    'should throw when `index` is invalid (#1)'
  )

  t.throws(
    function() {
      is(node, null, Infinity, parent)
    },
    /Expected positive finite index or child node/,
    'should throw when `index` is invalid (#2)'
  )

  t.throws(
    function() {
      is(node, null, false, parent)
    },
    /Expected positive finite index or child node/,
    'should throw when `index` is invalid (#3)'
  )

  t.throws(
    function() {
      is(node, null, 0, {})
    },
    /Expected parent node/,
    'should throw when `parent` is invalid (#1)'
  )

  t.throws(
    function() {
      is(node, null, 0, {type: 'paragraph'})
    },
    /Expected parent node/,
    'should throw when `parent` is invalid (#2)'
  )

  t.throws(
    function() {
      is(node, null, 0)
    },
    /Expected both parent and index/,
    'should throw `parent` xor `index` are given (#1)'
  )

  t.throws(
    function() {
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

  t.test('should accept a test', function(st) {
    function test(node, n) {
      return n === 5
    }

    t.notok(is(node, test))
    t.notok(is(node, test, 0, parent))
    st.ok(is(node, test, 5, parent))

    st.end()
  })

  t.test('should invoke test', function(st) {
    var context = {foo: 'bar'}

    st.plan(4)

    function test(a, b, c) {
      st.equal(this, context)
      st.equal(a, node)
      st.equal(b, 5)
      st.equal(c, parent)
    }

    is(node, test, 5, parent, context)
  })

  t.ok(is(node, ['strong', 'emphasis']), 'should match arrays (#1)')
  t.notok(is(node, ['b', 'i']), 'should match arrays (#2)')

  t.test('should match arrays (#3)', function(st) {
    var context = {foo: 'bar'}

    st.plan(5)

    st.ok(is(node, [test, 'strong'], 5, parent, context))

    function test(a, b, c) {
      st.equal(this, context)
      st.equal(a, node)
      st.equal(b, 5)
      st.equal(c, parent)
      return false
    }
  })

  t.end()
})
