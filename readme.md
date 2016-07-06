# unist-util-is [![Build Status][travis-badge]][travis] [![Coverage Status][codecov-badge]][codecov]

<!--lint disable heading-increment list-item-spacing no-duplicate-headings-->

[**Unist**][unist] utility to check if a node passes a test.

## Installation

[npm][npm-install]:

```bash
npm install unist-util-is
```

## Usage

```js
var is = require('unist-util-is');

var node = {type: 'strong'};
var parent = {type: 'paragraph', children: [node]};

function test(node, n) { return n === 5 }

is(); // false
is(null, {children: []}); // false
is(null, node); // true
is('strong', node); // true
is('emphasis', node); // false

is(node, node) // true
is({type: 'paragraph'}, parent) // true
is({type: 'strong'}, parent) // false

is(test, node); // false
is(test, node, 4, parent); // false
is(test, node, 5, parent); // true
```

## API

### `is(test, node[, index, parent[, context]])`

###### Parameters

*   `test` ([`Function`][test], `string`, or `Node`, optional)
    —  When not given, checks if `node` is a [`Node`][node].
    When `string`, works like passing `function (node) {return
    node.type === test}`.
    When `object`, checks that all keys in `test` are in `node`,
    and that they have (strictly) equal values.
*   `node` ([`Node`][node]) — Node to check.  `false` is returned;
*   `index` (`number`, optional) — Position of `node` in `parent`;
*   `parent` (`Node`, optional) — Parent of `node`;
*   `context` (`*`, optiona) — Context object to invoke `test` with.

###### Returns

`boolean` — Whether `test` passed _and_ `node` is a [`Node`][node] (object
with `type` set to non-empty `string`).

#### `function test(node[, index, parent])`

###### Parameters

*   `node` (`Node`) — Node to test;
*   `index` (`number`?) — Position of `node` in `parent`.
*   `parent` (`Node`?) — Parent of `node`.

###### Context

`*` — The to `is` given `context`.

###### Returns

`boolean?` — Whether `node` matches.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[travis-badge]: https://img.shields.io/travis/wooorm/unist-util-is.svg

[travis]: https://travis-ci.org/wooorm/unist-util-is

[codecov-badge]: https://img.shields.io/codecov/c/github/wooorm/unist-util-is.svg

[codecov]: https://codecov.io/github/wooorm/unist-util-is

[npm-install]: https://docs.npmjs.com/cli/install

[license]: LICENSE

[author]: http://wooorm.com

[unist]: https://github.com/wooorm/unist

[node]: https://github.com/wooorm/unist#node

[test]: #function-testnode-index-parent
