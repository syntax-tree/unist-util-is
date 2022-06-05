# unist-util-is

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[unist][] utility to check if nodes pass a test.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`is(node[, test[, index, parent[, context]]])`](#isnode-test-index-parent-context)
    *   [`convert(test)`](#converttest)
*   [Examples](#examples)
    *   [Example of `convert`](#example-of-convert)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a small utility that checks that a node is a certain node.

## When should I use this?

Use this small utility if you find yourself repeating code for checking what
nodes are.

A similar package, [`hast-util-is-element`][hast-util-is-element], works on hast
elements.

For more advanced tests, [`unist-util-select`][unist-util-select] can be used
to match against CSS selectors.

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, 16.0+, 18.0+), install with [npm][]:

```sh
npm install unist-util-is
```

In Deno with [`esm.sh`][esmsh]:

```js
import {is} from "https://esm.sh/unist-util-is@5"
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {is} from "https://esm.sh/unist-util-is@5?bundle"
</script>
```

## Use

```js
import {is} from 'unist-util-is'

const node = {type: 'strong'}
const parent = {type: 'paragraph', children: [node]}

is() // => false
is({children: []}) // => false
is(node) // => true
is(node, 'strong') // => true
is(node, 'emphasis') // => false

is(node, node) // => true
is(parent, {type: 'paragraph'}) // => true
is(parent, {type: 'strong'}) // => false

is(node, test) // => false
is(node, test, 4, parent) // => false
is(node, test, 5, parent) // => true

function test(node, n) {
  return n === 5
}
```

## API

This package exports the identifiers `is` and `convert`.
There is no default export.

### `is(node[, test[, index, parent[, context]]])`

Check if `node` passes a test.
When a `parent` node is given the `index` of node should also be given.

###### Parameters

*   `node` ([`Node`][node]) — node to check
*   `test` ([`Function`][test], `string`, `Object`, or `Array<Test>`, optional)
    — check:
    *   when nullish, checks if `node` is a [`Node`][node]
    *   when `string`, works like passing `node => node.type === test`
    *   when `array`, checks if any one of the subtests pass
    *   when `object`, checks that all fields in `test` are in `node` and that
        they have strictly equal values
    *   when `function` checks if function passed the node is true
*   `index` (`number`, optional) — position of `node` in `parent`.
*   `parent` ([`Node`][node], optional) — parent of `node`
*   `context` (`*`, optional) — context object to call `test` with

###### Returns

Whether `test` passed *and* `node` is a [`Node`][node] (`boolean`).

#### `test(node[, index, parent])`

Arbitrary function to define whether a node passes.

###### Parameters

*   `this` (`*`) — the to `is` given `context`.
*   `node` ([`Node`][node]) — node to check
*   `index` (`number?`) — [index][] of `node` in `parent`
*   `parent` ([`Node?`][node]) — [parent][] of `node`

###### Returns

Whether `node` matches (`boolean?`).

### `convert(test)`

Create a test function from `test` that can later be called with a `node`,
`index`, and `parent`.
Useful if you’re going to test many nodes, for example when creating a utility
where something else passes an is-compatible test.

The created function is slightly faster that using `is` because it expects valid
input only.
Therefore, passing invalid input yields unexpected results.

###### Returns

Check function that can be called as `check(node, index, parent)`.

## Examples

### Example of `convert`

```js
import {u} from 'unist-builder'
import {convert} from 'unist-util-is'

const test = convert('leaf')

const tree = u('tree', [
  u('node', [u('leaf', '1')]),
  u('leaf', '2'),
  u('node', [u('leaf', '3'), u('leaf', '4')]),
  u('leaf', '5')
])

const leafs = tree.children.filter((child, index) => test(child, index, tree))

console.log(leafs)
```

Yields:

```js
[{type: 'leaf', value: '2'}, {type: 'leaf', value: '5'}]
```

## Types

This package is fully typed with [TypeScript][].
It exports the additional types:

*   `Test`
    — models any arbitrary test that can be given
*   `TestFunctionAnything`
    — models any test function
*   `TestFunctionPredicate<Kind>` (where `Kind` extends `Node`)
    — models a test function for `Kind`
*   `AssertAnything`
    — models a check function as returned by `convert`
*   `AssertPredicate<Kind>` (where `Kind` extends `Node`)
    — models a check function for `Kind` as returned by `convert`

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, 16.0+, and 18.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

## Related

*   [`unist-util-find-after`](https://github.com/syntax-tree/unist-util-find-after)
    — find a node after another node
*   [`unist-util-find-before`](https://github.com/syntax-tree/unist-util-find-before)
    — find a node before another node
*   [`unist-util-find-all-after`](https://github.com/syntax-tree/unist-util-find-all-after)
    — find all nodes after another node
*   [`unist-util-find-all-before`](https://github.com/syntax-tree/unist-util-find-all-before)
    — find all nodes before another node
*   [`unist-util-find-all-between`](https://github.com/mrzmmr/unist-util-find-all-between)
    — find all nodes between two nodes
*   [`unist-util-filter`](https://github.com/syntax-tree/unist-util-filter)
    — create a new tree with nodes that pass a check
*   [`unist-util-remove`](https://github.com/syntax-tree/unist-util-remove)
    — remove nodes from tree

## Contribute

See [`contributing.md`][contributing] in [`syntax-tree/.github`][health] for
ways to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/syntax-tree/unist-util-is/workflows/main/badge.svg

[build]: https://github.com/syntax-tree/unist-util-is/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/unist-util-is.svg

[coverage]: https://codecov.io/github/syntax-tree/unist-util-is

[downloads-badge]: https://img.shields.io/npm/dm/unist-util-is.svg

[downloads]: https://www.npmjs.com/package/unist-util-is

[size-badge]: https://img.shields.io/bundlephobia/minzip/unist-util-is.svg

[size]: https://bundlephobia.com/result?p=unist-util-is

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/syntax-tree/unist/discussions

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[license]: license

[author]: https://wooorm.com

[health]: https://github.com/syntax-tree/.github

[contributing]: https://github.com/syntax-tree/.github/blob/main/contributing.md

[support]: https://github.com/syntax-tree/.github/blob/main/support.md

[coc]: https://github.com/syntax-tree/.github/blob/main/code-of-conduct.md

[unist]: https://github.com/syntax-tree/unist

[node]: https://github.com/syntax-tree/unist#node

[parent]: https://github.com/syntax-tree/unist#parent-1

[index]: https://github.com/syntax-tree/unist#index

[hast-util-is-element]: https://github.com/syntax-tree/hast-util-is-element

[unist-util-select]: https://github.com/syntax-tree/unist-util-select

[test]: #testnode-index-parent
