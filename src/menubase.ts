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
    this.activeIndex = arrays.findIndex(this.items, isSelectable, i, true);
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
    this.activeIndex = arrays.rfindIndex(this.items, isSelectable, i, true);
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
      if (!isSelectable(item)) {
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
   * The coerce handler for the [[activeIndexProperty]].
   *
   * #### Notes
   * Subclasses may reimplement this method as needed.
   */
  protected coerceActiveIndex(index: number): number {
    let i = index | 0;
    let item = this.items[i];
    return (item && isSelectable(item)) ? i : -1;
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
 * Test whether a menu item is selectable.
 */
function isSelectable(item: MenuItem): boolean {
  return !item.hidden && !item.disabled && !item.isSeparatorType;
}
