// Assert if `test` passes for `node`.
// When a `parent` node is known the `index` of node should also be given.
// eslint-disable-next-line max-params
export function is(node, test, index, parent, context) {
  var check = convert(test)

  if (
    index !== undefined &&
    index !== null &&
    (typeof index !== 'number' ||
      index < 0 ||
      index === Number.POSITIVE_INFINITY)
  ) {
    throw new Error('Expected positive finite index')
  }

  if (
    parent !== undefined &&
    parent !== null &&
    (!is(parent) || !parent.children)
  ) {
    throw new Error('Expected parent node')
  }

  if (
    (parent === undefined || parent === null) !==
    (index === undefined || index === null)
  ) {
    throw new Error('Expected both parent and index')
  }

  return node && node.type && typeof node.type === 'string'
    ? Boolean(check.call(context, node, index, parent))
    : false
}

export function convert(test) {
  if (test === undefined || test === null) {
    return ok
  }

  if (typeof test === 'string') {
    return typeFactory(test)
  }

  if (typeof test === 'object') {
    return 'length' in test ? anyFactory(test) : allFactory(test)
  }

  if (typeof test === 'function') {
    return test
  }

  throw new Error('Expected function, string, or object as test')
}

// Utility to assert each property in `test` is represented in `node`, and each
// values are strictly equal.
function allFactory(test) {
  return all

  function all(node) {
    var key

    for (key in test) {
      if (node[key] !== test[key]) return false
    }

    return true
  }
}

function anyFactory(tests) {
  var checks = []
  var index = -1

  while (++index < tests.length) {
    checks[index] = convert(tests[index])
  }

  return any

  function any(...parameters) {
    var index = -1

    while (++index < checks.length) {
      if (checks[index].call(this, ...parameters)) {
        return true
      }
    }

    return false
  }
}

// Utility to convert a string into a function which checks a given node’s type
// for said string.
function typeFactory(test) {
  return type

  function type(node) {
    return Boolean(node && node.type === test)
  }
}

// Utility to return true.
function ok() {
  return true
}
