// src/index.ts
function parse(S, options) {
  options = options ?? {};
  let pos = options.pos ?? 0;
  const keepComments = !!options.keepComments;
  const keepWhitespace = !!options.keepWhitespace;
  const booleanAttribute = options.booleanAttribute ?? true;
  const openBracket = "<";
  const openBracketCC = "<".charCodeAt(0);
  const closeBracket = ">";
  const closeBracketCC = ">".charCodeAt(0);
  const minusCC = "-".charCodeAt(0);
  const slashCC = "/".charCodeAt(0);
  const exclamationCC = "!".charCodeAt(0);
  const singleQuoteCC = "'".charCodeAt(0);
  const doubleQuoteCC = '"'.charCodeAt(0);
  const openCornerBracketCC = "[".charCodeAt(0);
  const closeCornerBracketCC = "]".charCodeAt(0);
  function parseChildren(tagName) {
    const children = [];
    while (S[pos]) {
      if (S.charCodeAt(pos) === openBracketCC) {
        if (S.charCodeAt(pos + 1) === slashCC) {
          const closeStart = pos + 2;
          pos = S.indexOf(closeBracket, pos);
          const closeTag = S.substring(closeStart, pos);
          if (closeTag.indexOf(tagName) === -1) {
            const parsedText = S.substring(0, pos).split("\n");
            throw new Error(
              "Unexpected close tag\nLine: " + (parsedText.length - 1) + "\nColumn: " + (parsedText[parsedText.length - 1].length + 1) + "\nChar: " + S[pos]
            );
          }
          if (pos + 1)
            pos += 1;
          return children;
        } else if (S.charCodeAt(pos + 1) === exclamationCC) {
          if (S.charCodeAt(pos + 2) === minusCC) {
            const startCommentPos = pos;
            while (pos !== -1 && !(S.charCodeAt(pos) === closeBracketCC && S.charCodeAt(pos - 1) === minusCC && S.charCodeAt(pos - 2) === minusCC && pos !== -1)) {
              pos = S.indexOf(closeBracket, pos + 1);
            }
            if (pos === -1) {
              pos = S.length;
            }
            if (keepComments) {
              children.push(S.substring(startCommentPos, pos + 1));
            }
          } else if (S.charCodeAt(pos + 2) === openCornerBracketCC && S.charCodeAt(pos + 8) === openCornerBracketCC && S.substring(pos + 3, pos + 8).toLowerCase() === "cdata") {
            const cdataEndIndex = S.indexOf("]]>", pos);
            if (cdataEndIndex === -1) {
              children.push(S.substring(pos + 9));
              pos = S.length;
            } else {
              children.push(S.substring(pos + 9, cdataEndIndex));
              pos = cdataEndIndex + 3;
            }
            continue;
          } else {
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
        if (node.tagName[0] === "?") {
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
  function parseText() {
    const start = pos;
    pos = S.indexOf(openBracket, pos) - 1;
    if (pos === -2)
      pos = S.length;
    return S.slice(start, pos + 1);
  }
  const nameSpacer = "\r\n	>/= ";
  function parseName() {
    const start = pos;
    while (nameSpacer.indexOf(S[pos]) === -1 && S[pos]) {
      pos++;
    }
    return S.slice(start, pos);
  }
  const NoChildNodes = options.noChildNodes || ["img", "br", "input", "meta", "link", "hr"];
  function parseNode() {
    pos++;
    const tagName = parseName();
    const attributes = {};
    let children = [];
    while (S.charCodeAt(pos) !== closeBracketCC && S[pos]) {
      const c = S.charCodeAt(pos);
      if (c > 64 && c < 91 || c > 96 && c < 123) {
        const name = parseName();
        let code = S.charCodeAt(pos);
        while (code && code !== singleQuoteCC && code !== doubleQuoteCC && !(code > 64 && code < 91 || code > 96 && code < 123) && code !== closeBracketCC) {
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
              children
            };
          }
        } else {
          value = null;
          pos--;
        }
        if (booleanAttribute)
          value ??= "true";
        if (value)
          attributes[name] = value;
      }
      pos++;
    }
    if (S.charCodeAt(pos - 1) !== slashCC) {
      if (tagName === "script") {
        const start = pos + 1;
        pos = S.indexOf("</script>", pos);
        children = [S.slice(start, pos)];
        pos += 9;
      } else if (tagName === "style") {
        const start = pos + 1;
        pos = S.indexOf("</style>", pos);
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
      children
    };
  }
  function parseString() {
    const startChar = S[pos];
    const startpos = pos + 1;
    pos = S.indexOf(startChar, startpos);
    return S.slice(startpos, pos);
  }
  let out = parseChildren("");
  if (options.filter) {
    out = filter(out, options.filter);
  }
  return out;
}
function filter(children, f, dept = 0, path = "") {
  let out = [];
  children.forEach(function(child, i) {
    if (f(child, i, dept, path))
      out.push(child);
    if (typeof child === "object" && child.children) {
      const kids = filter(
        child.children,
        f,
        dept + 1,
        (path ? path + "." : "") + i + "." + child.tagName
      );
      out = out.concat(kids);
    }
  });
  return out;
}
function walk(children, f, dept = 0, path = "") {
  children.forEach(function(child, i) {
    f(child, i, dept, path);
    if (typeof child === "object" && child.children) {
      walk(child.children, f, dept + 1, (path ? path + "." : "") + i + "." + child.tagName);
    }
  });
}
function stringify(O) {
  let out = "";
  function writeChildren(O2) {
    if (O2) {
      for (let i = 0; i < O2.length; i++) {
        if (typeof O2[i] === "string") {
          out += O2[i].trim();
        } else {
          writeNode(O2[i]);
        }
      }
    }
  }
  function writeNode(N) {
    out += "<" + N.tagName;
    for (const i in N.attributes) {
      if (N.attributes[i] === null) {
        out += " " + i;
      } else if (N.attributes[i].indexOf('"') === -1) {
        out += " " + i + '="' + N.attributes[i].trim() + '"';
      } else {
        out += " " + i + "='" + N.attributes[i].trim() + "'";
      }
    }
    if (N.tagName[0] === "?") {
      out += "?>";
      return;
    }
    out += ">";
    writeChildren(N.children);
    out += "</" + N.tagName + ">";
  }
  writeChildren(O);
  return out;
}
export {
  filter,
  parse,
  stringify,
  walk
};
