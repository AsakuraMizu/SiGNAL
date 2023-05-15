// modified from https://github.com/TobiasNickel/tXml/blob/master/tXml.js

export interface INode<
  Name extends string = string,
  Attr extends Record<string, string> = Record<string, string>
> {
  tagName: Name;
  attributes: Attr;
  children: Child[];
}

export type Child = INode | string;

export type Filter = (node: Child, index: number, dept: number, path: string) => boolean;
export type Walker = (node: Child, index: number, dept: number, path: string) => void;

export interface ParseOptions {
  pos?: number;
  noChildNodes?: string[];
  keepComments?: boolean;
  keepWhitespace?: boolean;
  booleanAttribute?: boolean;
  filter?: Filter;
}

/**
 * parse XML / html into a DOM Object. with no validation and some failure tolerance
 */
export function parse(S: string, options?: ParseOptions): Child[] {
  options = options ?? {};

  let pos = options.pos ?? 0;
  const keepComments = !!options.keepComments;
  const keepWhitespace = !!options.keepWhitespace;
  const booleanAttribute = options.booleanAttribute ?? true;

  const openBracket = '<';
  const openBracketCC = '<'.charCodeAt(0);
  const closeBracket = '>';
  const closeBracketCC = '>'.charCodeAt(0);
  const minusCC = '-'.charCodeAt(0);
  const slashCC = '/'.charCodeAt(0);
  const exclamationCC = '!'.charCodeAt(0);
  const singleQuoteCC = "'".charCodeAt(0);
  const doubleQuoteCC = '"'.charCodeAt(0);
  const openCornerBracketCC = '['.charCodeAt(0);
  const closeCornerBracketCC = ']'.charCodeAt(0);

  /**
   * parsing a list of entries
   */
  function parseChildren(tagName: string) {
    const children: Child[] = [];
    while (S[pos]) {
      if (S.charCodeAt(pos) === openBracketCC) {
        if (S.charCodeAt(pos + 1) === slashCC) {
          const closeStart = pos + 2;
          pos = S.indexOf(closeBracket, pos);

          const closeTag = S.substring(closeStart, pos);
          if (closeTag.indexOf(tagName) === -1) {
            const parsedText = S.substring(0, pos).split('\n');
            throw new Error(
              'Unexpected close tag\nLine: ' +
                (parsedText.length - 1) +
                '\nColumn: ' +
                (parsedText[parsedText.length - 1].length + 1) +
                '\nChar: ' +
                S[pos]
            );
          }

          if (pos + 1) pos += 1;

          return children;
        } else if (S.charCodeAt(pos + 1) === exclamationCC) {
          if (S.charCodeAt(pos + 2) === minusCC) {
            //comment support
            const startCommentPos = pos;
            while (
              pos !== -1 &&
              !(
                S.charCodeAt(pos) === closeBracketCC &&
                S.charCodeAt(pos - 1) === minusCC &&
                S.charCodeAt(pos - 2) === minusCC &&
                pos !== -1
              )
            ) {
              pos = S.indexOf(closeBracket, pos + 1);
            }
            if (pos === -1) {
              pos = S.length;
            }
            if (keepComments) {
              children.push(S.substring(startCommentPos, pos + 1));
            }
          } else if (
            S.charCodeAt(pos + 2) === openCornerBracketCC &&
            S.charCodeAt(pos + 8) === openCornerBracketCC &&
            S.substring(pos + 3, pos + 8).toLowerCase() === 'cdata'
          ) {
            // cdata
            const cdataEndIndex = S.indexOf(']]>', pos);
            if (cdataEndIndex === -1) {
              children.push(S.substring(pos + 9));
              pos = S.length;
            } else {
              children.push(S.substring(pos + 9, cdataEndIndex));
              pos = cdataEndIndex + 3;
            }
            continue;
          } else {
            // doctypesupport
            const startDoctype = pos + 1;
            pos += 2;
            let encapsuled = false;
            while ((S.charCodeAt(pos) !== closeBracketCC || encapsuled === true) && S[pos]) {
              if (S.charCodeAt(pos) === openCornerBracketCC) {
                encapsuled = true;
              } else if (encapsuled === true && S.charCodeAt(pos) === closeCornerBracketCC) {
                encapsuled = false;
              }
              pos++;
            }
            children.push(S.substring(startDoctype, pos));
          }
          pos++;
          continue;
        }
        const node = parseNode();
        children.push(node);
        if (node.tagName[0] === '?') {
          children.push(...node.children);
          node.children = [];
        }
      } else {
        const text = parseText();
        if (keepWhitespace) {
          if (text.length > 0) {
            children.push(text);
          }
        } else {
          const trimmed = text.trim();
          if (trimmed.length > 0) {
            children.push(trimmed);
          }
        }
        pos++;
      }
    }
    return children;
  }

  /**
   *    returns the text outside of texts until the first '<'
   */
  function parseText() {
    const start = pos;
    pos = S.indexOf(openBracket, pos) - 1;
    if (pos === -2) pos = S.length;
    return S.slice(start, pos + 1);
  }
  /**
   *    returns text until the first nonAlphabetic letter
   */
  const nameSpacer = '\r\n\t>/= ';

  function parseName() {
    const start = pos;
    while (nameSpacer.indexOf(S[pos]) === -1 && S[pos]) {
      pos++;
    }
    return S.slice(start, pos);
  }
  /**
   *    is parsing a node, including tagName, Attributes and its children,
   * to parse children it uses the parseChildren again, that makes the parsing recursive
   */
  const NoChildNodes = options.noChildNodes || ['img', 'br', 'input', 'meta', 'link', 'hr'];

  function parseNode(): INode {
    pos++;
    const tagName = parseName();
    const attributes: Record<string, string> = {};
    let children: Child[] = [];

    // parsing attributes
    while (S.charCodeAt(pos) !== closeBracketCC && S[pos]) {
      const c = S.charCodeAt(pos);
      if ((c > 64 && c < 91) || (c > 96 && c < 123)) {
        //if('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(S[pos])!==-1 ){
        const name = parseName();
        // search beginning of the string
        let code = S.charCodeAt(pos);
        while (
          code &&
          code !== singleQuoteCC &&
          code !== doubleQuoteCC &&
          !((code > 64 && code < 91) || (code > 96 && code < 123)) &&
          code !== closeBracketCC
        ) {
          pos++;
          code = S.charCodeAt(pos);
        }
        let value;
        if (code === singleQuoteCC || code === doubleQuoteCC) {
          value = parseString();
          if (pos === -1) {
            return {
              tagName,
              attributes,
              children,
            };
          }
        } else {
          value = null;
          pos--;
        }
        if (booleanAttribute) value ??= 'true';
        if (value) attributes[name] = value;
      }
      pos++;
    }
    // optional parsing of children
    if (S.charCodeAt(pos - 1) !== slashCC) {
      if (tagName === 'script') {
        const start = pos + 1;
        pos = S.indexOf('</script>', pos);
        children = [S.slice(start, pos)];
        pos += 9;
      } else if (tagName === 'style') {
        const start = pos + 1;
        pos = S.indexOf('</style>', pos);
        children = [S.slice(start, pos)];
        pos += 8;
      } else if (NoChildNodes.indexOf(tagName) === -1) {
        pos++;
        children = parseChildren(tagName);
      } else {
        pos++;
      }
    } else {
      pos++;
    }
    return {
      tagName,
      attributes,
      children,
    };
  }

  /**
   *    is parsing a string, that starts with a char and with the same usually  ' or "
   */

  function parseString() {
    const startChar = S[pos];
    const startpos = pos + 1;
    pos = S.indexOf(startChar, startpos);
    return S.slice(startpos, pos);
  }

  let out = parseChildren('');

  if (options.filter) {
    out = filter(out, options.filter);
  }

  return out;
}

/**
 * behaves the same way as Array.filter, if the filter method return true, the element is in the resultList
 */
export function filter(children: Child[], f: Filter, dept = 0, path = ''): Child[] {
  let out: Child[] = [];
  children.forEach(function (child, i) {
    if (f(child, i, dept, path)) out.push(child);
    if (typeof child === 'object' && child.children) {
      const kids = filter(
        child.children,
        f,
        dept + 1,
        (path ? path + '.' : '') + i + '.' + child.tagName
      );
      out = out.concat(kids);
    }
  });
  return out;
}

/**
 * walk on the tree
 */
export function walk(children: Child[], f: Walker, dept = 0, path = '') {
  children.forEach(function (child, i) {
    f(child, i, dept, path);
    if (typeof child === 'object' && child.children) {
      walk(child.children, f, dept + 1, (path ? path + '.' : '') + i + '.' + child.tagName);
    }
  });
}

/**
 * stringify a previously parsed string object.
 * this is useful,
 * 1. to remove whitespace
 * 2. to recreate xml data, with some changed data.
 */
export function stringify(O: Child[]) {
  let out = '';

  function writeChildren(O: Child[]) {
    if (O) {
      for (let i = 0; i < O.length; i++) {
        if (typeof O[i] === 'string') {
          out += (O[i] as string).trim();
        } else {
          writeNode(O[i] as INode);
        }
      }
    }
  }

  function writeNode(N: INode) {
    out += '<' + N.tagName;
    for (const i in N.attributes) {
      if (N.attributes[i] === null) {
        out += ' ' + i;
      } else if (N.attributes[i].indexOf('"') === -1) {
        out += ' ' + i + '="' + N.attributes[i].trim() + '"';
      } else {
        out += ' ' + i + "='" + N.attributes[i].trim() + "'";
      }
    }
    if (N.tagName[0] === '?') {
      out += '?>';
      return;
    }
    out += '>';
    writeChildren(N.children);
    out += '</' + N.tagName + '>';
  }
  writeChildren(O);

  return out;
}
