import type {Content, Heading, Paragraph, Root} from 'mdast'
import {expectAssignable, expectNotType, expectType} from 'tsd'
import type {Node, Parent} from 'unist'
import {convert, is} from 'unist-util-is'

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
const checkParagraphProperties = convert({type: 'paragraph'})
const checkParagraphPropertiesConst = convert({type: 'paragraph'} as const)
const checkHeading2Properties = convert({type: 'heading', depth: 2})
const checkHeading2PropertiesConst = convert({
  type: 'heading',
  depth: 2
} as const)

if (checkParagraphProperties(mdastNode)) {
  expectNotType<Paragraph>(mdastNode)
}

if (checkParagraphPropertiesConst(mdastNode)) {
  expectType<Paragraph>(mdastNode)
}

if (checkHeading2Properties(mdastNode)) {
  expectType<Heading>(mdastNode)
  expectNotType<2>(mdastNode.depth) // TS can’t narrow this normally.
}

if (checkHeading2PropertiesConst(mdastNode)) {
  expectAssignable<Heading>(mdastNode)
  expectType<2>(mdastNode.depth)
}

// Function test (with explicit assertion).
const checkHeadingFunction = convert(isHeading)
const checkParagraphFunction = convert(isParagraph)
const checkHeading2Function = convert(isHeading2)

expectType<boolean>(checkHeadingFunction(mdastNode))

if (checkHeadingFunction(mdastNode)) {
  expectType<Heading>(mdastNode)
}

if (checkParagraphFunction(mdastNode)) {
  expectType<Paragraph>(mdastNode)
}

if (checkParagraphFunction(mdastNode)) {
  expectNotType<Heading>(mdastNode)
}

if (checkHeading2Function(mdastNode)) {
  expectAssignable<Heading>(mdastNode)
  expectType<2>(mdastNode.depth)
}

// Function test (implicit assertion).
const checkHeadingLooseFunction = convert(isHeadingLoose)
const checkParagraphLooseFunction = convert(isParagraphLoose)
const checkHeadFunction = convert(isHead)

expectType<boolean>(checkHeadingLooseFunction(mdastNode))

if (checkHeadingLooseFunction(mdastNode)) {
  expectNotType<Heading>(mdastNode)
}

if (checkParagraphLooseFunction(mdastNode)) {
  expectNotType<Heading>(mdastNode)
}

if (checkHeadFunction(mdastNode)) {
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
