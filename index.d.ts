// TypeScript Version: 3.5

import {Node, Parent} from 'unist'

declare namespace unistUtilIs {
  /**
   * Check that type property matches expectation for a node
   *
   * @typeParam T type of node that passes test
   */
  type TestType<T extends Node> = T['type']

  /**
   * Check that some attributes on a node are matched
   *
   * @typeParam T type of node that passes test
   */
  type TestObject<T extends Node> = Partial<T>

  /**
   * Check if a node matches a specific TypeScript type
   *
   * @param node node to check
   * @param index index of node in parent
   * @param parent parent of node
   * @typeParam T type of node that passes test
   * @returns true if type T is found, false otherwise
   */
  type TestFunction<T extends Node> = (
    node: unknown,
    index?: number,
    parent?: Parent
  ) => node is T

  /**
   * Check if a node matches arbitrary criteria
   * @param node node to check
   * @param index index of node in parent
   * @param parent parent of node
   * @returns boolean if the node is a match
   */
  type TestPredicate = (node: Node, index?: number, parent?: Parent) => boolean

  /**
   * Union of all the types of tests
   *
   * @typeParam T type of node that passes test
   */
  type Test<T extends Node> =
    | TestType<T>
    | TestObject<T>
    | TestFunction<T>
    | TestPredicate
}

/**
 * Unist utility to check if a node passes a test.
 *
 * @param node Node to check.
 * @param test When not given, checks if `node` is a `Node`.
 * When `string`, works like passing `function (node) {return node.type === test}`.
 * When `function` checks if function passed the node is true.
 * When `object`, checks that all keys in test are in node, and that they have (strictly) equal values.
 * When `array`, checks any one of the subtests pass.
 * @param index Position of `node` in `parent`
 * @param parent Parent of `node`
 * @param context Context object to invoke `test` with
 * @typeParam T type that node is compared with
 * @returns Whether test passed and `node` is a `Node` (object with `type` set to non-empty `string`).
 */
declare function unistUtilIs<T extends Node>(
  node: unknown,
  test: unistUtilIs.Test<T> | Array<unistUtilIs.Test<any>>,
  index?: number,
  parent?: Parent,
  context?: any
): node is T

export = unistUtilIs
