import {visit} from 'unist-util-visit';

/**
 * file format:
 * :::file
 * [[<filename>]]
 * <file content>
 * :::
 *
 * note that file content may apart into multiple paragraph.
 */

function fileMarkdownPlugin() {
  return (tree: any) => {
    const cache = {
      name: "",
      content: "",
      last: false,
      cursor: 0,
    }

    function parse(data: string, index: number, parent: any) {
        if (data.startsWith(':::file')) {
          cache.name = "";
          cache.content = "";
          cache.last = true;
          cache.cursor = index;

          const part = data.slice(7);
          if (part.length > 0) {
            parse(part.trimStart(), index, parent);
          }
        } else if (data.startsWith(':::')) {
          cache.last = false;
          parent.children.splice(cache.cursor, index - cache.cursor + 1, {
            type: 'div',
            data: {
              hName: 'div',
              hProperties: {
                className: 'file-instance',
                file: cache.name,
                content: cache.content,
              },
            }
          });
          cache.name = "";
          cache.content = "";
        } else if (cache.last) {
          if (cache.name.length === 0 && data.startsWith('[[')) {
            // may contain content
            const end = data.indexOf(']]');
            if (end !== -1) {
              cache.name = data.slice(2, end);
              parse(data.slice(end + 2).trimStart(), index, parent);
            } else {
              cache.name = data.slice(2);
            }
          } else {
            cache.content += data;
          }
        }
      }

    visit(tree, 'paragraph', (node, index, parent) => {
      for (const child of node.children) {
        parse((child.value || ""), index as number, parent);
      }
    });
  };
}

export default fileMarkdownPlugin;
