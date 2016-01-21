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
  Widget
} from 'phosphor-widget';

import {
  MenuItem
} from './menuitem';


/**
 * An abstract base class for implementing menu widgets.
 *
 * #### Notes
 * This class must be subclassed to create a useful menu.
 */
export
abstract class AbstractMenu extends Widget {
  /**
   * A method invoked to test whether an item is selectable.
   *
   * @param item - The menu item of interest.
   *
   * @returns `true` if the item is selectable, `false` otherwise.
   *
   * #### Notes
   * This method must be implemented by a subclass.
   */
  protected abstract isSelectable(item: MenuItem): boolean;

  /**
   * A method invoked when the menu items change.
   *
   * @param oldItems - The old menu items.
   *
   * @param newItems - The new menu items.
   *
   * #### Notes
   * This method must be implemented by a subclass.
   *
   * The active index is reset to `-1` before this method is called.
   */
  protected abstract onItemsChanged(oldItems: MenuItem[], newItems: MenuItem[]): void;

  /**
   * A method invoked when the active index changes.
   *
   * @param oldIndex - The old active index.
   *
   * @param newIndex - The new active index.
   *
   * #### Notes
   * This method must be implemented by a subclass.
   *
   * This method will not be called when the menu items are changed.
   */
  protected abstract onActiveIndexChanged(oldIndex: number, newIndex: number): void;

  /**
   * Get the array of menu items for the menu.
   *
   * #### Notes
   * The items array is frozen and cannot be modified in-place.
   */
  get items(): MenuItem[] {
    return this._items;
  }

  /**
   * Set the array of menu items for the menu.
   *
   * #### Notes
   * This creates a shallow copy of the assigned menu items.
   */
  set items(value: MenuItem[]) {
    if (this._items === value) {
      return;
    }
    this._activeIndex = -1;
    let oldItems = this._items;
    this._items = Object.freeze(value.slice());
    this.onItemsChanged(oldItems, this._items);
  }

  /**
   * Get the index of the currently active menu item.
   *
   * #### Notes
   * This will be `-1` if there is no active item.
   */
  get activeIndex(): number {
    return this._activeIndex;
  }

  /**
   * Set the index of the currently active menu item.
   *
   * #### Notes
   * If the index is out of range, or points to a menu item which is
   * not selectable, the index will be set to `-1`.
   */
  set activeIndex(value: number) {
    let newIndex = value | 0;
    let item = this._items[newIndex];
    if (!item || !this.isSelectable(item)) {
      newIndex = -1;
    }
    let oldIndex = this._activeIndex;
    if (oldIndex === newIndex) {
      return;
    }
    this._activeIndex = newIndex;
    this.onActiveIndexChanged(oldIndex, newIndex);
  }

  /**
   * Get the currently active menu item.
   *
   * #### Notes
   * This will be `null` if there is no active item.
   */
  get activeItem(): MenuItem {
    return this._items[this._activeIndex] || null;
  }

  /**
   * Set the currently active menu item.
   *
   * #### Notes
   * If the item is not contained in the menu, or is not a selectable
   * item, the active item will be set to `null`.
   */
  set activeItem(value: MenuItem) {
    this.activeIndex = this._items.indexOf(value);
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

  private _activeIndex = -1;
  private _items: MenuItem[] = Object.freeze([]);
}
