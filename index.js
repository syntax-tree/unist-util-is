/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 *
 * @typedef {string} Type
 * @typedef {Record<string, unknown>} Props
 *
 * @typedef {null|undefined|Type|Props|TestFunctionAnything|Array<Type|Props|TestFunctionAnything>} Test
 */

/**
 * Check if a node passes a test
 *
 * @callback TestFunctionAnything
 * @param {Node} node
 * @param {number|null|undefined} [index]
 * @param {Parent|null|undefined} [parent]
 * @returns {boolean|void}
 */

/**
 * Check if a node passes a certain node test
 *
 * @template {Node} X
 * @callback TestFunctionPredicate
 * @param {Node} node
 * @param {number|null|undefined} [index]
 * @param {Parent|null|undefined} [parent]
 * @returns {node is X}
 */

/**
 * @callback AssertAnything
 * @param {unknown} [node]
 * @param {number|null|undefined} [index]
 * @param {Parent|null|undefined} [parent]
 * @returns {boolean}
 */

/**
 * Check if a node passes a certain node test
 *
 * @template {Node} Y
 * @callback AssertPredicate
 * @param {unknown} [node]
 * @param {number|null|undefined} [index]
 * @param {Parent|null|undefined} [parent]
 * @returns {node is Y}
 */

/**
 * Check if a node passes a test.
 * When a `parent` node is known the `index` of node should also be given.
 *
 * @param node
 *   Node to check, can be anything.
 * @param test
 *   *   When nullish, checks if `node` is a `Node`.
 *   *   When `string`, works like passing `(node) => node.type === test`.
 *   *   When `function` checks if function passed the node is true.
 *   *   When `object`, checks that all keys in test are in node, and that they have (strictly) equal values.
 *   *   When `array`, checks any one of the subtests pass.
 * @param index
 *   Position of `node` in `parent`, must be a number if `parent` is also given.
 * @param parent
 *   Parent of `node`, must be given if `index` is also given.
 * @param context
 *   Context object to invoke `test` with, optional
 * @returns
 *   Whether test passed and `node` is a `Node` (object with `type` set to
 *   non-empty `string`).
 */
export const is =
  /**
   * @type {(
   *   (<ExplicitNode extends Node>(node: unknown, test: ExplicitNode['type']|Partial<ExplicitNode>|TestFunctionPredicate<ExplicitNode>|Array<ExplicitNode['type']|Partial<ExplicitNode>|TestFunctionPredicate<ExplicitNode>>, index: number, parent: Parent, context?: unknown) => node is ExplicitNode) &
   *   (<ExplicitNode extends Node>(node: unknown, test: ExplicitNode['type']|Partial<ExplicitNode>|TestFunctionPredicate<ExplicitNode>|Array<ExplicitNode['type']|Partial<ExplicitNode>|TestFunctionPredicate<ExplicitNode>>, index?: null|undefined, parent?: null|undefined, context?: unknown) => node is ExplicitNode) &
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

export const convert =
  /**
   * @type {(
   *   (<ExplicitNode extends Node>(test: ExplicitNode['type']|Partial<ExplicitNode>|TestFunctionPredicate<ExplicitNode>) => AssertPredicate<ExplicitNode>) &
   *   ((test?: Test) => AssertAnything)
   * )}
   */
  (
    /**
     * Generate an assertion from a check.
     * @param {Test} [test]
     * When nullish, checks if `node` is a `Node`.
     * When `string`, works like passing `function (node) {return node.type === test}`.
     * When `function` checks if function passed the node is true.
     * When `object`, checks that all keys in test are in node, and that they have (strictly) equal values.
     * When `array`, checks any one of the subtests pass.
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
 * Utility to assert each property in `test` is represented in `node`, and each
 * values are strictly equal.
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
 * Utility to convert a string into a function which checks a given node’s type
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
 * Utility to convert a string into a function which checks a given node’s type
 * for said string.
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

// Utility to return true.
function ok() {
  return true
}
