# unist-util-is [![Build Status](https://img.shields.io/travis/wooorm/unist-util-is.svg)](https://travis-ci.org/wooorm/unist-util-is) [![Coverage Status](https://img.shields.io/codecov/c/github/wooorm/unist-util-is.svg)](https://codecov.io/github/wooorm/unist-util-is?branch=master)

[**Unist**](https://github.com/wooorm/unist) utility to check if a node passes
a test. Useful when working with [**mdast**](https://github.com/wooorm/mdast)
or [**retext**](https://github.com/wooorm/retext).

## Installation

[npm](https://docs.npmjs.com/cli/install):

```bash
npm install unist-util-is
```

**unist-util-is** is also available for [bower](http://bower.io/#install-packages),
[component](https://github.com/componentjs/component), and
[duo](http://duojs.org/#getting-started), and as an AMD, CommonJS, and globals
module, [uncompressed](unist-util-is.js) and
[compressed](unist-util-is.min.js).

## Usage

```js
var is = require('.');
var node = {
    'type': 'strong'
};
var parent = {
    'type': 'paragraph',
    'children': [node]
};

function test(node, n) {
    return n === 5
}

is(null, node); // true
is('strong', node); // true
is('emphasis', node); // false

is(node, node) // true
is(node, {type: 'strong'}) // false

is(test, node); // false
is(test, node, 4, parent); // false
is(test, node, 5, parent); // true
```

## API

### is(test, node\[, index, parent\[, context\]\])

Utility to check if a node passes a test.

**Parameters**:

*   `test` ([`Function`](#function-testnode-index-parent), `string`, or
    `Node`, optional)
    — When not given, return is return `true`.

    Passing a `string` is equal to passing
    `function (node) {return node.type === test}`.

    Passing a `node` is equal to passing
    `function (node) {return node === test}`.

*   `node` (`Node`)
    — [Node](https://github.com/wooorm/unist#unist-nodes) to test;

*   `index` (`number`, optional) — Position of `node` in `parent`;

*   `parent` (`Node`, optional) — Parent of `node`;

*   `context` (`*`, optional) — Parent of `node`.

**Returns**: `boolean`, whether `test` passed.

### function test(node\[, index, parent\])

**Parameters**:

*   `node` (`Node`) — Node to test;
*   `index` (`number`?) — Position of `node` in `parent`.
*   `parent` (`Node`?) — Parent of `node`.

**Context**: The to `is` given context.

**Returns**: `boolean?`, whether this iteration passes.

## License

[MIT](LICENSE) © [Titus Wormer](http://wooorm.com)
