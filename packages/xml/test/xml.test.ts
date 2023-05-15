import { describe, expect, test } from 'vitest';
import { parse, filter } from '../src';

describe('parse', () => {
  test('basic', () => {
    expect(parse('<test>')).toEqual([{ tagName: 'test', attributes: {}, children: [] }]);
    expect(parse('<test att="v" att2="two">')).toEqual([
      { tagName: 'test', attributes: { att: 'v', att2: 'two' }, children: [] },
    ]);
    expect(parse('<test att>')).toEqual([{ tagName: 'test', attributes: { att: 'true' }, children: [] }]);
    expect(parse('<test att>', { booleanAttribute: false })).toEqual([
      { tagName: 'test', attributes: {}, children: [] },
    ]);
    expect(parse('childTest')).toEqual(['childTest']);
    expect(parse('<test>childTest')).toEqual([{ tagName: 'test', attributes: {}, children: ['childTest'] }]);
    expect(parse('<test />test')).toEqual([{ tagName: 'test', attributes: {}, children: [] }, 'test']);

    expect(parse('<test></test>')).toEqual([{ tagName: 'test', attributes: {}, children: [] }]);
    expect(parse('<test><cc></cc><cc></cc></test>')).toEqual([
      {
        tagName: 'test',
        attributes: {},
        children: [
          { tagName: 'cc', attributes: {}, children: [] },
          { tagName: 'cc', attributes: {}, children: [] },
        ],
      },
    ]);
  });

  test('comments', () => {
    expect(
      parse(
        '<!-- some comment --><test><cc c="d"><!-- some comment --></cc><!-- some comment --><cc>value<!-- some comment --></cc></test><!-- ending with not closing comment'
      )
    ).toEqual([
      {
        tagName: 'test',
        attributes: {},
        children: [
          { tagName: 'cc', children: [], attributes: { c: 'd' } },
          { tagName: 'cc', attributes: {}, children: ['value'] },
        ],
      },
    ]);
    expect(parse('<!-- qwq --><test><!-- test --><!--></test>', { keepComments: true })).toEqual([
      '<!-- qwq -->',
      { tagName: 'test', attributes: {}, children: ['<!-- test -->', '<!-->'] },
    ]);
  });

  test('whitespace', () => {
    expect(parse('    ')).toEqual([]);
    expect(parse('    ', { keepWhitespace: true })).toEqual(['    ']);
    expect(parse('<test>  ', { keepWhitespace: true })).toEqual([
      { tagName: 'test', attributes: {}, children: ['  '] },
    ]);
  });

  test('special', () => {
    expect(parse('<!DOCTYPE html>')).toEqual(['!DOCTYPE html']);
    expect(
      parse(
        '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" [<!ENTITY ns_extend "http://ns.adobe.com/Extensibility/1.0/">]>'
      )
    ).toEqual([
      '!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" [<!ENTITY ns_extend "http://ns.adobe.com/Extensibility/1.0/">]',
    ]);
    expect(parse('<?xml version="1.0" encoding="utf-8"?>')).toEqual([
      {
        tagName: '?xml',
        attributes: {
          version: '1.0',
          encoding: 'utf-8',
        },
        children: [],
      },
    ]);
    expect(parse('<![CDATA[nothing]]>')).toEqual(['nothing']);
    expect(parse('<![CDATA[nothing')).toEqual(['nothing']);
    expect(parse('<script>$("<div>")</script>')).toEqual([
      { tagName: 'script', attributes: {}, children: ['$("<div>")'] },
    ]);
    expect(parse('<style>*{some:10px;}/* <tag> comment */</style>')).toEqual([
      { tagName: 'style', attributes: {}, children: ['*{some:10px;}/* <tag> comment */'] },
    ]);
    expect(parse('<br>')).toEqual([{ tagName: 'br', attributes: {}, children: [] }]);
  });

  test('problem', () => {
    expect(() => parse('<user><name>robert</firstName><user>')).toThrowError('Unexpected close tag');
    expect(parse('<test att="qwq')).toEqual([{ tagName: 'test', attributes: {}, children: [] }]);
    expect(parse('<test att qwq />')).toEqual([
      { tagName: 'test', attributes: { att: 'true', qwq: 'true' }, children: [] },
    ]);
    expect(parse('<test></')).toEqual([{ tagName: 'test', attributes: {}, children: [] }]);
  });
});

describe('filter', () => {
  test('function', () => {
    expect(filter(['qwq'], () => true)).toEqual(['qwq']);
  });

  test('option', () => {
    expect(
      parse('<test><cc></cc><cc>qwq</cc></test>', {
        filter: (el) => {
          if (typeof el === 'string') return el === 'qwq';
          else return el.tagName === 'cc';
        },
      })
    ).toEqual([
      { tagName: 'cc', attributes: {}, children: [] },
      { tagName: 'cc', attributes: {}, children: ['qwq'] },
      'qwq',
    ]);
  });
});
