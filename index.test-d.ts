import {Node, Parent} from 'unist'
import {expectType, expectNotType, expectError} from 'tsd'
import {Heading} from 'mdast'
import * as unified from 'unified'
import {is, convert} from './index.js'

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

is()

/* Missing parameters. */
expectError(is<Node>())

/* Types cannot be narrowed without predicate. */
expectType<boolean>(is(heading))

/* Incorrect generic. */
expectError(is<string>(heading, 'heading'))
expectError(is<boolean>(heading, 'heading'))
expectError(is<Record<string, unknown>>(heading, 'heading'))

/* Should be assignable to boolean. */
expectType<boolean>(is<Heading>(heading, 'heading'))

/* Test is optional */
expectType<boolean>(is(heading))
expectType<boolean>(is(heading, null))
expectType<boolean>(is(heading, undefined))
/* But not with a type predicate */
expectError(is<Node>(heading)) // But not with a type predicate
expectError(is<Node>(heading, null))
expectError(is<Node>(heading, undefined))

/* Should support string tests. */
expectType<boolean>(is<Heading>(heading, 'heading'))
expectType<boolean>(is<Heading>(element, 'heading'))
expectError(is<Heading>(heading, 'element'))

if (is<Heading>(heading, 'heading')) {
  expectType<Heading>(heading)
  expectNotType<Element>(heading)
}

expectType<boolean>(is<Element>(element, 'element'))
expectType<boolean>(is<Element>(heading, 'element'))
expectError(is<Element>(element, 'heading'))

if (is<Element>(element, 'element')) {
  expectType<Element>(element)
  expectNotType<Heading>(element)
}

/* Should support function tests. */
expectType<boolean>(is(heading, isHeading))
expectType<boolean>(is(element, isHeading))
expectError(is<Heading>(heading, isElement))

if (is(heading, isHeading)) {
  expectType<Heading>(heading)
  expectNotType<Element>(heading)
}

expectType<boolean>(is(element, isElement))
expectType<boolean>(is(heading, isElement))
expectError(is<Element>(element, isHeading))

if (is(element, isElement)) {
  expectType<Element>(element)
}

/* Should support object tests. */
expectType<boolean>(
  is<Heading>(heading, {type: 'heading', depth: 2})
)
expectType<boolean>(
  is<Heading>(element, {type: 'heading', depth: 2})
)
expectError(
  is<Heading>(heading, {type: 'heading', depth: '2'})
)

if (is<Heading>(heading, {type: 'heading', depth: 2})) {
  expectType<Heading>(heading)
  expectNotType<Element>(heading)
}

expectType<boolean>(
  is<Element>(element, {type: 'element', tagName: 'section'})
)
expectType<boolean>(
  is<Element>(heading, {type: 'element', tagName: 'section'})
)
expectError(
  is<Element>(element, {type: 'element', tagName: true})
)

if (is<Element>(element, {type: 'element', tagName: 'section'})) {
  expectType<Element>(element)
  expectNotType<Heading>(element)
}

/* Should support array tests. */
expectType<boolean>(
  is<Heading | Element | Paragraph>(heading, [
    'heading',
    isElement,
    {type: 'ParagraphNode'}
  ])
)

if (
  is<Heading | Element | Paragraph>(heading, [
    'heading',
    isElement,
    {type: 'ParagraphNode'}
  ])
) {
  switch (heading.type) {
    case 'heading': {
      expectType<Heading>(heading)
      break
    }

    case 'element': {
      expectType<Element>(heading)
      break
    }

    case 'ParagraphNode': {
      expectType<Paragraph>(heading)
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
    expectType<Heading>(tree)
    // Do something
  }

  return tree
})

/* Should support `convert`. */
convert<Heading>('heading')
expectError(convert<Heading>('element'))
convert<Heading>({type: 'heading', depth: 2})
expectError(
  convert<Element>({type: 'heading', depth: 2})
)
convert<Heading>(isHeading)
expectError(convert<Element>(isHeading))
convert()
convert(null)
convert(undefined)
expectError(convert<Element>())
