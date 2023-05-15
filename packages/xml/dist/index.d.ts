interface INode<Name extends string = string, Attr extends Record<string, string> = Record<string, string>> {
    tagName: Name;
    attributes: Attr;
    children: Child[];
}
type Child = INode | string;
type Filter = (node: Child, index: number, dept: number, path: string) => boolean;
type Walker = (node: Child, index: number, dept: number, path: string) => void;
interface ParseOptions {
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
declare function parse(S: string, options?: ParseOptions): Child[];
/**
 * behaves the same way as Array.filter, if the filter method return true, the element is in the resultList
 */
declare function filter(children: Child[], f: Filter, dept?: number, path?: string): Child[];
/**
 * walk on the tree
 */
declare function walk(children: Child[], f: Walker, dept?: number, path?: string): void;
/**
 * stringify a previously parsed string object.
 * this is useful,
 * 1. to remove whitespace
 * 2. to recreate xml data, with some changed data.
 */
declare function stringify(O: Child[]): string;

export { Child, Filter, INode, ParseOptions, Walker, filter, parse, stringify, walk };
