import {Node, Parent} from 'unist'
import unified = require('unified')
import is = require('unist-util-is')

/*=== setup ===*/
interface Heading extends Parent {
  type: 'heading'
  depth: number
  children: Node[]
}

interface Element extends Parent {
  type: 'element'
  tagName: string
  properties: {
    [key: string]: unknown
  }
  content: Node
  children: Node[]
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

/*=== types cannot be narrowed without predicate ===*/
// $ExpectError
const maybeHeading: Heading = heading
// $ExpectError
const maybeElement: Element = element

/*=== missing params ===*/
// $ExpectError
is()
// $ExpectError
is<Node>()
// $ExpectError
is<Node>(heading)

/*=== invalid generic ===*/
// $ExpectError
is<string>(heading, 'heading')
// $ExpectError
is<boolean>(heading, 'heading')
// $ExpectError
is<{}>(heading, 'heading')

/*=== assignable to boolean ===*/
const wasItAHeading: boolean = is<Heading>(heading, 'heading')

/*=== type string test ===*/
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

/*=== type predicate function test ===*/
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

/*=== type object test ===*/
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

/*=== type array of tests ===*/
is(heading, ['heading', isElement, {type: 'ParagraphNode'}])
is(element, ['heading', isElement, {type: 'ParagraphNode'}])

/*=== usable in unified transform ===*/
unified().use(() => tree => {
  if (is<Heading>(tree, 'heading')) {
    // do something
  }
  return tree
})
