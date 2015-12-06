/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import * as arrays
  from 'phosphor-arrays';

import {
  Property
} from 'phosphor-properties';

import {
  Widget
} from 'phosphor-widget';

import {
  MenuItem
} from './menuitem';


/**
 * The class name added to collapsed separator nodes.
 */
const COLLAPSED_CLASS = 'p-mod-collapsed';


/**
 * A base class for implementing widgets which display menu items.
 */
export
class MenuBase extends Widget {
  /**
   * The property descriptor for the array of menu items.
   *
   * #### Notes
   * This property creates a frozen shallow copy of the assigned items
   * array. This means that the menu items can only be changed in bulk
   * and that in-place modifications to the array are not allowed.
   *
   * **See also:** [[items]]
   */
  static itemsProperty = new Property<MenuBase, MenuItem[]>({
    name: 'items',
    value: Object.freeze([]),
    coerce: (owner, value) => Object.freeze(value ? value.slice() : []),
    changed: (owner, old, value) => owner.onItemsChanged(old, value),
  });

  /**
   * The property descriptor for the index of the active menu item.
   *
   * **See also:** [[activeIndex]]
   */
  static activeIndexProperty = new Property<MenuBase, number>({
    name: 'activeIndex',
    value: -1,
    coerce: (owner, index) => owner.coerceActiveIndex(index),
    changed: (owner, old, index) => owner.onActiveIndexChanged(old, index),
  });

  /**
   * Get the array of menu items.
   *
   * #### Notes
   * This is a pure delegate to the [[itemsProperty]].
   */
  get items(): MenuItem[] {
    return MenuBase.itemsProperty.get(this);
  }

  /**
   * Set the array of menu items.
   *
   * #### Notes
   * This is a pure delegate to the [[itemsProperty]].
   */
  set items(value: MenuItem[]) {
    MenuBase.itemsProperty.set(this, value);
  }

  /**
   * Get the index of the active menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[activeIndexProperty]].
   */
  get activeIndex(): number {
    return MenuBase.activeIndexProperty.get(this);
  }

  /**
   * Set the index of the active menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[activeIndexProperty]].
   */
  set activeIndex(value: number) {
    MenuBase.activeIndexProperty.set(this, value);
  }

  /**
   * Activate the next selectable menu item.
   *
   * #### Notes
   * The search starts with the currently active item, and progresses
   * forward until the next selectable item is found. The search will
   * wrap around at the end of the menu.
   */
  activateNextItem(): void {
    let k = this.activeIndex + 1;
    let i = k >= this.items.length ? 0 : k;
    let pred = (item: MenuItem) => this.isSelectable(item);
    this.activeIndex = arrays.findIndex(this.items, pred, i, true);
  }

  /**
   * Activate the previous selectable menu item.
   *
   * #### Notes
   * The search starts with the currently active item, and progresses
   * backward until the next selectable item is found. The search will
   * wrap around at the front of the menu.
   */
  activatePreviousItem(): void {
    let k = this.activeIndex;
    let i = k <= 0 ? this.items.length - 1 : k - 1;
    let pred = (item: MenuItem) => this.isSelectable(item);
    this.activeIndex = arrays.rfindIndex(this.items, pred, i, true);
  }

  /**
   * Activate the next selectable menu item with the given mnemonic.
   *
   * #### Notes
   * The search starts with the currently active item, and progresses
   * forward until the next selectable item with the given mnemonic is
   * found. The search will wrap around at the end of the menu, and the
   * mnemonic matching is case-insensitive.
   */
  activateMnemonicItem(char: string): void {
    let c = char.toUpperCase();
    let k = this.activeIndex + 1;
    let i = k >= this.items.length ? 0 : k;
    this.activeIndex = arrays.findIndex(this.items, item => {
      if (!this.isSelectable(item)) {
        return false;
      }
      let match = item.text.match(/&\w/);
      if (!match) {
        return false;
      }
      return match[0][1].toUpperCase() === c;
    }, i, true);
  }

  /**
   * Open the active menu item.
   *
   * #### Notes
   * This is a no-op if there is no active menu item, or if the active
   * menu item does not have a submenu.
   */
  openActiveItem(): void {
    let i = this.activeIndex;
    let item = this.items[i];
    if (item && item.submenu) {
      this.onOpenItem(i, item);
    }
  }

  /**
   * Trigger the active menu item.
   *
   * #### Notes
   * This is a no-op if there is no active menu item. If the active
   * menu item has a submenu, this is equivalent to `openActiveItem`.
   */
  triggerActiveItem(): void {
    let i = this.activeIndex;
    let item = this.items[i];
    if (item && item.submenu) {
      this.onOpenItem(i, item);
    } else if (item) {
      this.onTriggerItem(i, item);
    }
  }

  /**
   * Test whether an item is selectable.
   *
   * @param item - The menu item of interest.
   *
   * @returns `true` if the item is selectable, `false` otherwise.
   *
   * #### Notes
   * Subclasses may reimplement this method as needed.
   *
   * The default implementation of this method ignores separators.
   */
  protected isSelectable(item: MenuItem): boolean {
    return item.type !== MenuItem.Separator;
  }

  /**
   * The coerce handler for the [[activeIndexProperty]].
   *
   * #### Notes
   * Subclasses may reimplement this method as needed.
   */
  protected coerceActiveIndex(index: number): number {
    let i = index | 0;
    let item = this.items[i];
    return (item && this.isSelectable(item)) ? i : -1;
  }

  /**
   * A method invoked when the menu items change.
   *
   * The default implementation of this method is a no-op.
   */
  protected onItemsChanged(old: MenuItem[], items: MenuItem[]): void { }

  /**
   * A method invoked when the active index changes.
   *
   * The default implementation of this method is a no-op.
   */
  protected onActiveIndexChanged(old: number, index: number): void { }

  /**
   * A method invoked when a menu item should be opened.
   *
   * The default implementation of this handler is a no-op.
   */
  protected onOpenItem(index: number, item: MenuItem): void { }

  /**
   * A method invoked when a menu item should be triggered.
   *
   * The default implementation of this handler is a no-op.
   */
  protected onTriggerItem(index: number, item: MenuItem): void { }
}


/**
 * Collapse leading, trailing, and consecutive separators.
 *
 * @param items - The array of menu items of interest. This should be
 *   the same length as the `nodes` array.
 *
 * @param nodes - The nodes representing the menu item. This should be
 *   the same length as the `items` array.
 */
export
function collapseSeparators(items: MenuItem[], nodes: HTMLElement[]): void {
  // Collapse the leading separators.
  let k1: number;
  for (k1 = 0; k1 < items.length; ++k1) {
    let item = items[k1];
    let node = nodes[k1];
    if (item.type !== MenuItem.Separator) {
      node.classList.remove(COLLAPSED_CLASS);
      break;
    }
    node.classList.add(COLLAPSED_CLASS);
  }

  // Collapse the trailing separators.
  let k2: number;
  for (k2 = items.length - 1; k2 >= 0; --k2) {
    let item = items[k2];
    let node = nodes[k2];
    if (item.type !== MenuItem.Separator) {
      node.classList.remove(COLLAPSED_CLASS);
      break;
    }
    node.classList.add(COLLAPSED_CLASS);
  }

  // Collapse the remaining consecutive separators.
  let collapse = false;
  while (++k1 < k2) {
    let item = items[k1];
    let node = nodes[k1];
    if (collapse && item.type === MenuItem.Separator) {
      node.classList.add(COLLAPSED_CLASS);
    } else {
      node.classList.remove(COLLAPSED_CLASS);
      collapse = item.type === MenuItem.Separator;
    }
  }
}
