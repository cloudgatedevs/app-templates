import { Injectable } from '@angular/core';
import { StringIterator } from 'lodash';
import { filter as _filter, forEach as _forEach } from 'lodash-es';

@Injectable()
export class TreeDataHelperService {
  findNode(data: string | null | undefined, selector: StringIterator<boolean> | undefined): any {
    let nodes = _filter(data, selector);
    if (nodes && nodes.length === 1) {
      return nodes[0];
    }

    let foundNode: null = null;

    _forEach(data, (d: any) => {
      if (!foundNode) {
        foundNode = this.findNode(d.children, selector);
      }
    });

    return foundNode;
  }

  findParent(data: any, nodeSelector: any) {
    let node = this.findNode(data, nodeSelector);
    if (!node) {
      return null;
    }

    return node.parent;
  }

  findChildren(data: any, selector: any) {
    let traverseChildren = function (node: { children: any }) {
      let names: any[] = [];
      if (node.children) {
        _forEach(node.children, (c) => {
          names.push(c.data.name);
          names = names.concat(traverseChildren(c));
        });
      }
      return names;
    };

    let foundNode = this.findNode(data, selector);
    if (foundNode) {
      return traverseChildren(foundNode);
    } else {
      return [];
    }
  }
}
