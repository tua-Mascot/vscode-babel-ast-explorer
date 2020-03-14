import { Node, buildChildren } from '@babel/types';
import simpleTemplate from './simpleTemplate';
import { isNumber } from 'util';

export default async function renderAst(ast: Node): Promise<string> {
  const ret = await Promise.all(
    Object.entries(ast).map(async ([key, node]) => {
      const isArrayNode =
        node && typeof node === 'object' && isNumber(node.length);
      const isEmpty =
        (!isNumber(node) && !node) ||
        (isArrayNode && !node.length) ||
        (typeof node === 'object' && !Object.keys(node).length);
      let childType = typeof node as string;
      if (node === null) {
        childType = 'null';
      } else if (isArrayNode) {
        childType = 'array';
      }

      let child = '';
      if (node && typeof node === 'object') {
        child = await renderAst(node);
      } else {
        child = '' + node;
      }

      return simpleTemplate('node.html', {
        key,
        type: node?.type || '',
        child,
        childType,
        line: '' + (node?.loc?.start.line || ''),
        colStart: isNumber(node?.start) ? '' + node?.start : '',
        colEnd: isNumber(node?.end) ? '' + node?.end : '',
        class: isEmpty ? `empty` : ''
      });
    })
  );
  return ret.join('\n');
}
