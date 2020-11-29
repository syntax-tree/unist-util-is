import {Node, Parent} from 'unist'
import {Heading} from 'mdast'
import unified = require('unified')
import is = require('unist-util-is')
import convert = require('unist-util-is/convert')

/* Setup. */
interface Element extends Parent {
  type: 'element'
  tagName: string
  properties: Record<string, unknown>
  content: Node
  children: Node[]
}

interface Paragraph extends Parent {
  type: 'ParagraphNode'
}

const heading: Node = {
  type: 'heading',
  depth: 2,
  children: []
}

const element: Node = {
  type: 'element',
  tagName: 'section',
  properties: {},
  content: {type: 'text'},
  children: []
}

const isHeading = (node: unknown): node is Heading =>
  typeof node === 'object' && node !== null && (node as Node).type === 'heading'
const isElement = (node: unknown): node is Element =>
  typeof node === 'object' && node !== null && (node as Node).type === 'element'

/* Types cannot be narrowed without predicate. */
// $ExpectError
const maybeHeading: Heading = heading
// $ExpectError
const maybeElement: Element = element

/* Missing parameters. */
// $ExpectError
is()
// $ExpectError
is<Node>()
// $ExpectError
is<Node>(heading)

/* Incorrect generic. */
// $ExpectError
is<string>(heading, 'heading')
// $ExpectError
is<boolean>(heading, 'heading')
// $ExpectError
is<Record<string, unknown>>(heading, 'heading')

/* Should be assignable to boolean. */
const wasItAHeading: boolean = is<Heading>(heading, 'heading')

/* Should support string tests. */
is<Heading>(heading, 'heading')
is<Heading>(element, 'heading')
// $ExpectError
is<Heading>(heading, 'element')

if (is<Heading>(heading, 'heading')) {
  const maybeHeading: Heading = heading
  // $ExpectError
  const maybeNotHeading: Element = heading
}

is<Element>(element, 'element')
is<Element>(heading, 'element')
// $ExpectError
is<Element>(element, 'heading')

if (is<Element>(element, 'element')) {
  const maybeElement: Element = element
  // $ExpectError
  const maybeNotElement: Heading = element
}

/* Should support function tests. */
is(heading, isHeading)
is(element, isHeading)
// $ExpectError
is<Heading>(heading, isElement)

if (is(heading, isHeading)) {
  const maybeHeading: Heading = heading
  // $ExpectError
  const maybeNotHeading: Element = heading
}

is(element, isElement)
is(heading, isElement)
// $ExpectError
is<Element>(element, isHeading)

if (is(element, isElement)) {
  const maybeElement: Element = element
  // $ExpectError
  const maybeNotElement: Heading = element
}

/* Should support object tests. */
is<Heading>(heading, {type: 'heading', depth: 2})
is<Heading>(element, {type: 'heading', depth: 2})
// $ExpectError
is<Heading>(heading, {type: 'heading', depth: '2'})

if (is<Heading>(heading, {type: 'heading', depth: 2})) {
  const maybeHeading: Heading = heading
  // $ExpectError
  const maybeNotHeading: Element = heading
}

is<Element>(element, {type: 'element', tagName: 'section'})
is<Element>(heading, {type: 'element', tagName: 'section'})
// $ExpectError
is<Element>(element, {type: 'element', tagName: true})

if (is<Element>(element, {type: 'element', tagName: 'section'})) {
  const maybeElement: Element = element
  // $ExpectError
  const maybeNotElement: Heading = element
}

/* Should support array tests. */
is<Heading | Element | Paragraph>(heading, [
  'heading',
  isElement,
  {type: 'ParagraphNode'}
])

if (
  is<Heading | Element | Paragraph>(heading, [
    'heading',
    isElement,
    {type: 'ParagraphNode'}
  ])
) {
  switch (heading.type) {
    case 'heading': {
      heading // $ExpectType Heading
      break
    }

    case 'element': {
      heading // $ExpectType Element
      break
    }

    case 'ParagraphNode': {
      heading // $ExpectType Paragraph
      break
    }

    // $ExpectError
    case 'dne': {
      break
    }

    default: {
      break
    }
  }
}

/* Should support being used in a unified transform. */
unified().use(() => (tree) => {
  if (is<Heading>(tree, 'heading')) {
    // Do something
  }

  return tree
})

/* Should support `convert`. */
convert<Heading>('heading')
// $ExpectError
convert<Heading>('element')
convert<Heading>({type: 'heading', depth: 2})
// $ExpectError
convert<Element>({type: 'heading', depth: 2})
convert<Heading>(isHeading)
// $ExpectError
convert<Element>(isHeading)
