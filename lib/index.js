/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 * @typedef {string} Type
 * @typedef {Record<string, unknown>} Props
 * @typedef {null|undefined|Type|Props|TestFunctionAnything|Array<Type|Props|TestFunctionAnything>} Test
 *
 * @callback TestFunctionAnything
 *   Arbitrary function to define whether a node passes.
 * @param {unknown} this
 *   The to `is` given `context`
 * @param {Node} node
 *   Node to check.
 * @param {number|null|undefined} [index]
 *   Index of `node` in `parent`.
 * @param {Parent|null|undefined} [parent]
 *   Parent of `node`.
 * @returns {boolean|void}
 *   Whether `node` matches.
 *
 * @callback AssertAnything
 *   Check if a node is an element and passes a certain node test.
 * @param {unknown} [node]
 *   Thing to check and check that it’s a node.
 * @param {number|null|undefined} [index]
 *   Index of `node` in `parent`.
 * @param {Parent|null|undefined} [parent]
 *   Parent of `node`.
 * @returns {boolean}
 *   Whether `node` matches.
 */

/**
 * @template {Node} Kind
 * @callback TestFunctionPredicate
 *   Arbitrary function to define whether a node passes, using a TypeScript type
 *   predicate.
 * @param {Node} node
 *   Node to check.
 * @param {number|null|undefined} [index]
 *   Index of `node` in `parent`.
 * @param {Parent|null|undefined} [parent]
 *   Parent of `node`.
 * @returns {node is Kind}
 *   Whether `node` matches.
 */

/**
 * @template {Node} Kind
 * @callback AssertPredicate
 *   Check if a node is an element and passes a certain node test, using a
 *   TypeScript type predicate.
 * @param {unknown} [node]
 *   Thing to check and check that it’s a node.
 * @param {number|null|undefined} [index]
 *   Index of `node` in `parent`.
 * @param {Parent|null|undefined} [parent]
 *   Parent of `node`.
 * @returns {node is Kind}
 *   Whether `node` matches.
 */

/**
 * Check if `node` passes a test.
 * When a `parent` node is given the `index` of node should also be given.
 *
 * @param node
 *   Node to check, can be anything.
 * @param test
 *   *   when nullish, checks if `node` is a `Node`.
 *   *   when `string`, works like passing `(node) => node.type === test`.
 *   *   when `array`, checks any one of the subtests pass.
 *   *   when `object`, checks that all keys in test are in node, and that they have (strictly) equal values.
 *   *   when `function` checks if function passed the node is true.
 * @param index
 *   Position of `node` in `parent`, must be a number if `parent` is also given.
 * @param parent
 *   Parent of `node`, must be given if `index` is also given.
 * @param context
 *   Context object to call `test` with
 * @returns
 *   Whether test passed and `node` is a `Node` (object with `type` set to
 *   non-empty `string`).
 */
export const is =
  /**
   * @type {(
   *   (<Kind extends Node>(node: unknown, test: Kind['type']|Partial<Kind>|TestFunctionPredicate<Kind>|Array<Kind['type']|Partial<Kind>|TestFunctionPredicate<Kind>>, index: number, parent: Parent, context?: unknown) => node is Kind) &
   *   (<Kind extends Node>(node: unknown, test: Kind['type']|Partial<Kind>|TestFunctionPredicate<Kind>|Array<Kind['type']|Partial<Kind>|TestFunctionPredicate<Kind>>, index?: null|undefined, parent?: null|undefined, context?: unknown) => node is Kind) &
   *   ((node: unknown, test: Test, index: number, parent: Parent, context?: unknown) => boolean) &
   *   ((node?: unknown, test?: Test, index?: null|undefined, parent?: null|undefined, context?: unknown) => boolean)
   * )}
   */
  (
    /**
     * @param {unknown} [node]
     * @param {Test} [test]
     * @param {number|null|undefined} [index]
     * @param {Parent|null|undefined} [parent]
     * @param {unknown} [context]
     * @returns {boolean}
     */
    // eslint-disable-next-line max-params
    function is(node, test, index, parent, context) {
      const check = convert(test)

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

      // @ts-expect-error Looks like a node.
      return node && node.type && typeof node.type === 'string'
        ? Boolean(check.call(context, node, index, parent))
        : false
    }
  )

/**
 * Create a test function from `test` that can later be called with a `node`,
 * `index`, and `parent`.
 * Useful if you’re going to test many nodes, for example when creating a
 * utility where something else passes an is-compatible test.
 *
 * The created function is slightly faster that using `is` because it expects
 * valid input only.
 * Therefore, passing invalid input yields unexpected results.
 *
 * @param test
 *   *   when nullish, checks if `node` is a `Node`.
 *   *   when `string`, works like passing `(node) => node.type === test`.
 *   *   when `array`, checks any one of the subtests pass.
 *   *   when `object`, checks that all keys in test are in node, and that they have (strictly) equal values.
 *   *   when `function` checks if function passed the node is true.
 * @returns
 *   Check function that can be called as `check(node, index, parent)`.
 */
export const convert =
  /**
   * @type {(
   *   (<Kind extends Node>(test: Kind['type']|Partial<Kind>|TestFunctionPredicate<Kind>) => AssertPredicate<Kind>) &
   *   ((test?: Test) => AssertAnything)
   * )}
   */
  (
    /**
     * @param {Test} [test]
     * @returns {AssertAnything}
     */
    function (test) {
      if (test === undefined || test === null) {
        return ok
      }

      if (typeof test === 'string') {
        return typeFactory(test)
      }

      if (typeof test === 'object') {
        return Array.isArray(test) ? anyFactory(test) : propsFactory(test)
      }

      if (typeof test === 'function') {
        return castFactory(test)
      }

      throw new Error('Expected function, string, or object as test')
    }
  )

/**
 * @param {Array<Type|Props|TestFunctionAnything>} tests
 * @returns {AssertAnything}
 */
function anyFactory(tests) {
  /** @type {Array<AssertAnything>} */
  const checks = []
  let index = -1

  while (++index < tests.length) {
    checks[index] = convert(tests[index])
  }

  return castFactory(any)

  /**
   * @this {unknown}
   * @param {Array<unknown>} parameters
   * @returns {boolean}
   */
  function any(...parameters) {
    let index = -1

    while (++index < checks.length) {
      if (checks[index].call(this, ...parameters)) return true
    }

    return false
  }
}

/**
 * Assert each field in `test` is present in `node` and each values are strictly
 * equal.
 *
 * @param {Props} check
 * @returns {AssertAnything}
 */
function propsFactory(check) {
  return castFactory(all)

  /**
   * @param {Node} node
   * @returns {boolean}
   */
  function all(node) {
    /** @type {string} */
    let key

    for (key in check) {
      // @ts-expect-error: hush, it sure works as an index.
      if (node[key] !== check[key]) return false
    }

    return true
  }
}

/**
 * Convert a string into a function which checks a given node’s type
 * for said string.
 *
 * @param {Type} check
 * @returns {AssertAnything}
 */
function typeFactory(check) {
  return castFactory(type)

  /**
   * @param {Node} node
   */
  function type(node) {
    return node && node.type === check
  }
}

/**
 * Convert a string into a function which checks a given node’s type
 * for said string.
 *
 * @param {TestFunctionAnything} check
 * @returns {AssertAnything}
 */
function castFactory(check) {
  return assertion

  /**
   * @this {unknown}
   * @param {Array<unknown>} parameters
   * @returns {boolean}
   */
  function assertion(...parameters) {
    // @ts-expect-error: spreading is fine.
    return Boolean(check.call(this, ...parameters))
  }
}

function ok() {
  return true
}
