/* tslint:disable:max-classes-per-file ... */
const defaultOption = {
  delimiter: '/',
};

interface ITrieNodeChildren {
  [key: string]: TrieNode,
}

class TrieNode {
  token: string;

  private value: any;
  private children: ITrieNodeChildren;

  constructor(token: string, value = null) {
    this.token = token;
    this.value = value;
    this.children = {};
  }

  // is store value
  isLoaded() {
    return this.value !== null;
  }

  setValue(value: any): TrieNode {
    this.value = value;
    return this;
  }

  getValue(): any {
    return this.value;
  }

  clearValue(): TrieNode {
    this.value = null;
    return this;
  }

  getChildren(): TrieNode[] {
    return Object.keys(this.children).map(key => this.children[key]);
  }

  addChild(token: string, childNode): TrieNode {
    this.children[token] = childNode;
    return this;
  }

  getChild(token: string): TrieNode {
    return this.children[token];
  }

  removeChild(token) {
    return delete this.children[token];
  }

  getChildrenNum(): number {
    return Object.keys(this.children).length;
  }

  hasChild(token): boolean {
    return this.children[token] !== undefined ? true : false;
  }
}

export default class Trie {
  private option: any;
  private root: TrieNode;

  constructor(dict: any, option?: any) {
    this.option = Object.assign({}, defaultOption, option);
    this.root = new TrieNode('@root');
    Object.keys(dict).forEach(key => this.add(key, dict[key]));
  }

  isEmpty() {
    return this.root.getChildrenNum() <= 0;
  }

  add(path: string | string[], value): void {
    const tokens = Array.isArray(path) ? path : this.splitPath(path);
    const bottomNode = tokens.reduce((parent, token) => {
      let node = parent.getChild(token);
      if (node === undefined) {
        node = new TrieNode(token);
        parent.addChild(token, node);
      }
      return node;
    }, this.root);
    bottomNode.setValue(value);
  }

  remove(path: string | string[]): boolean {
    const tokens = Array.isArray(path) ? path : this.splitPath(path);
    const node = this.findNode(this.root, tokens);
    if (!node) {
      return false;
    }

    if (node.getChildrenNum() <= 0) {
      const precedeTokens = tokens.slice(0, tokens.length - 1);
      return this.remove(precedeTokens);
    }

    node.clearValue();
    return true;
  }

  findPrefix(path: string | string[]): any {
    const tokens = Array.isArray(path) ? path : this.splitPath(path);
    const node = this.findPrefixNode(this.root, tokens);
    return node.getValue();
  }

  findPrefixNode(parent: TrieNode, tokens: string[]): TrieNode | null {
    const [top, ...rest] = tokens;
    if (top === undefined) {
      return parent;
    }

    const childNode = parent.getChild(top);
    if (childNode !== undefined) {
      return this.findPrefixNode(childNode, rest);
    }
    return parent;
  }

  findNode(parent: TrieNode, tokens: string[]): TrieNode | null {
    const [top, ...rest] = tokens;
    if (top === undefined) {
      return parent;
    }

    const childNode = parent.getChild(top);
    if (childNode !== undefined) {
      return this.findNode(childNode, rest);
    }
    return null;
  }

  findValueWithShortestBranch(): any[] {
    const nodeQueue = [this.root];
    const result = [];

    do {
      const curentNode = nodeQueue.shift();
      if (curentNode.isLoaded()) {
        result.push(curentNode.getValue());
      } else {
        const childrenNodes = curentNode.getChildren();
        nodeQueue.push(...childrenNodes);
      }
    } while (nodeQueue.length > 0)

    return result;
  }

  splitPath(path: string): string[] {
    let normalizePath = path;
    if (path[0] === this.option.delimiter) {
      normalizePath = normalizePath.substr(1)
    }
    if (path[path.length - 1] === this.option.delimiter) {
      normalizePath = normalizePath.substr(0, path.length - 1)
    }
    return normalizePath.split(this.option.delimiter);
  }
}
