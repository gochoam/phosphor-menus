/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  MenuItem
} from './menuitem';


/**
 * The class name added to collapsed separator nodes.
 */
const COLLAPSED_CLASS = 'p-mod-collapsed';


/**
 * Collapse leading, trailing, and consecutive visible separators.
 *
 * This function is **not** part of the public Phosphor API, and can
 * be removed at any time without warning. We mean it!.
 *
 * @param items - The array of menu items of interest. This should be
 *   the same length as the `nodes` array.
 *
 * @param nodes - The nodes representing the menu item. This should be
 *   the same length as the `items` array.
 */
export
function collapseSeparators(items: MenuItem[], nodes: HTMLElement[]): void {
  // Collapse the leading visible separators.
  let k1: number;
  for (k1 = 0; k1 < items.length; ++k1) {
    let item = items[k1];
    let node = nodes[k1];
    if (item.hidden) {
      node.classList.remove(COLLAPSED_CLASS);
      continue;
    }
    if (!item.isSeparatorType) {
      node.classList.remove(COLLAPSED_CLASS);
      break;
    }
    node.classList.add(COLLAPSED_CLASS);
  }

  // Collapse the trailing visible separators.
  let k2: number;
  for (k2 = items.length - 1; k2 >= 0; --k2) {
    let item = items[k2];
    let node = nodes[k2];
    if (item.hidden) {
      node.classList.remove(COLLAPSED_CLASS);
      continue;
    }
    if (!item.isSeparatorType) {
      node.classList.remove(COLLAPSED_CLASS);
      break;
    }
    node.classList.add(COLLAPSED_CLASS);
  }

  // Collapse the remaining consecutive visible separators.
  let collapse = false;
  while (++k1 < k2) {
    let item = items[k1];
    let node = nodes[k1];
    if (item.hidden) {
      node.classList.remove(COLLAPSED_CLASS);
      continue;
    }
    if (collapse && item.isSeparatorType) {
      node.classList.add(COLLAPSED_CLASS);
    } else {
      node.classList.remove(COLLAPSED_CLASS);
      collapse = item.isSeparatorType;
    }
  }
}
