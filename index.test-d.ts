import type {Content, Heading, Paragraph, Root} from 'mdast'
import {expectAssignable, expectNotType, expectType} from 'tsd'
import type {Node, Parent} from 'unist'
import {convert, is} from './index.js'

// # Setup

const mdastNode = (function (): Root | Content {
  return {type: 'paragraph', children: []}
})()

const unknownValue = (function (): unknown {
  return {type: 'something'}
})()

// # `is`

// No node.
expectType<false>(is())

// No test.
expectType<boolean>(is(mdastNode))

if (is(unknownValue)) {
  expectType<Node>(unknownValue)
}

/* Nullish test. */
expectType<boolean>(is(mdastNode, null))
expectType<boolean>(is(mdastNode, undefined))

// String test.
if (is(mdastNode, 'heading')) {
  console.log('??', mdastNode)
  expectType<Heading>(mdastNode)
}

if (is(mdastNode, 'paragraph')) {
  expectType<Paragraph>(mdastNode)
}

// Object test.
expectType<boolean>(is(mdastNode, {type: 'heading', depth: 2}))

if (is(mdastNode, {type: 'heading', depth: 2})) {
  expectType<Heading>(mdastNode)
}

// TS makes this `type: string`.
if (is(mdastNode, {type: 'paragraph'})) {
  expectNotType<Heading>(mdastNode)
}

if (is(mdastNode, {type: 'paragraph'} as const)) {
  expectType<Paragraph>(mdastNode)
}

if (is(mdastNode, {type: 'heading', depth: 2})) {
  expectType<Heading>(mdastNode)
  expectNotType<2>(mdastNode.depth) // TS can’t narrow this normally.
}

if (is(mdastNode, {type: 'heading', depth: 2} as const)) {
  expectAssignable<Heading>(mdastNode)
  expectType<2>(mdastNode.depth)
}

// Function test (with explicit assertion).
expectType<boolean>(is(mdastNode, isHeading))

if (is(mdastNode, isHeading)) {
  expectType<Heading>(mdastNode)
}

if (is(mdastNode, isParagraph)) {
  expectType<Paragraph>(mdastNode)
}

if (is(mdastNode, isParagraph)) {
  expectNotType<Heading>(mdastNode)
}

if (is(mdastNode, isHeading2)) {
  expectAssignable<Heading>(mdastNode)
  expectType<2>(mdastNode.depth)
}

// Function test (implicit assertion).
expectType<boolean>(is(mdastNode, isHeadingLoose))

if (is(mdastNode, isHeadingLoose)) {
  expectNotType<Heading>(mdastNode)
}

if (is(mdastNode, isParagraphLoose)) {
  expectNotType<Heading>(mdastNode)
}

if (is(mdastNode, isHead)) {
  expectNotType<Heading>(mdastNode)
}

// Array tests.
// Can’t narrow down.
expectType<boolean>(
  is(mdastNode, ['heading', isHeading, isHeadingLoose, {type: 'heading'}])
)

// Can’t narrow down.
if (is(mdastNode, ['heading', isHeading, isHeadingLoose, {type: 'heading'}])) {
  expectNotType<Heading>(mdastNode)
}

// # `check`

// No node.
const checkNone = convert()
expectType<boolean>(checkNone())

// No test.
expectType<boolean>(checkNone(mdastNode))

if (checkNone(unknownValue)) {
  expectType<Node>(unknownValue)
}

/* Nullish test. */
const checkNull = convert(null)
const checkUndefined = convert(null)
expectType<boolean>(checkNull(mdastNode))
expectType<boolean>(checkUndefined(mdastNode))

// String test.
const checkHeading = convert('heading')
const checkParagraph = convert('paragraph')

if (checkHeading(mdastNode)) {
  expectType<Heading>(mdastNode)
}

if (checkParagraph(mdastNode)) {
  expectType<Paragraph>(mdastNode)
}

// Object test.
expectType<boolean>(is(mdastNode, {type: 'heading', depth: 2}))

if (is(mdastNode, {type: 'heading', depth: 2})) {
  expectType<Heading>(mdastNode)
}

// TS makes this `type: string`.
const checkParagraphProps = convert({type: 'paragraph'})
const checkParagraphPropsConst = convert({type: 'paragraph'} as const)
const checkHeading2Props = convert({type: 'heading', depth: 2})
const checkHeading2PropsConst = convert({
  type: 'heading',
  depth: 2
} as const)

if (checkParagraphProps(mdastNode)) {
  expectNotType<Paragraph>(mdastNode)
}

if (checkParagraphPropsConst(mdastNode)) {
  expectType<Paragraph>(mdastNode)
}

if (checkHeading2Props(mdastNode)) {
  expectType<Heading>(mdastNode)
  expectNotType<2>(mdastNode.depth) // TS can’t narrow this normally.
}

if (checkHeading2PropsConst(mdastNode)) {
  expectAssignable<Heading>(mdastNode)
  expectType<2>(mdastNode.depth)
}

// Function test (with explicit assertion).
const checkHeadingFn = convert(isHeading)
const checkParagraphFn = convert(isParagraph)
const checkHeading2Fn = convert(isHeading2)

expectType<boolean>(checkHeadingFn(mdastNode))

if (checkHeadingFn(mdastNode)) {
  expectType<Heading>(mdastNode)
}

if (checkParagraphFn(mdastNode)) {
  expectType<Paragraph>(mdastNode)
}

if (checkParagraphFn(mdastNode)) {
  expectNotType<Heading>(mdastNode)
}

if (checkHeading2Fn(mdastNode)) {
  expectAssignable<Heading>(mdastNode)
  expectType<2>(mdastNode.depth)
}

// Function test (implicit assertion).
const checkHeadingLooseFn = convert(isHeadingLoose)
const checkParagraphLooseFn = convert(isParagraphLoose)
const checkHeadFn = convert(isHead)

expectType<boolean>(checkHeadingLooseFn(mdastNode))

if (checkHeadingLooseFn(mdastNode)) {
  expectNotType<Heading>(mdastNode)
}

if (checkParagraphLooseFn(mdastNode)) {
  expectNotType<Heading>(mdastNode)
}

if (checkHeadFn(mdastNode)) {
  expectNotType<Heading>(mdastNode)
}

// Array tests.
// Can’t narrow down.
const isHeadingArray = convert([
  'heading',
  isHeading,
  isHeadingLoose,
  {type: 'heading'}
])

expectType<boolean>(isHeadingArray(mdastNode))

// Can’t narrow down.
if (isHeadingArray(mdastNode)) {
  expectNotType<Heading>(mdastNode)
}

function isHeading(node: Node): node is Heading {
  return node ? node.type === 'heading' : false
}

function isHeading2(node: Node): node is Heading & {depth: 2} {
  return isHeading(node) && node.depth === 2
}

function isHeadingLoose(node: Node) {
  return node ? node.type === 'heading' : false
}

function isParagraph(node: Node): node is Paragraph {
  return node ? node.type === 'paragraph' : false
}

function isParagraphLoose(node: Node) {
  return node ? node.type === 'paragraph' : false
}

function isHead(
  node: Node,
  index: number | undefined,
  parent: Parent | undefined
) {
  return parent ? index === 0 : false
}
