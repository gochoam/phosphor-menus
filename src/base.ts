/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

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
   * Trigger the currently active menu item.
   *
   * #### Notes
   * This method must be implemented by a subclass.
   *
   * This is a no-op if there is no active menu item.
   *
   * This is equivalent to clicking on the active menu item.
   */
  abstract triggerActiveItem(): void;

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
  abstract protected isSelectable(item: MenuItem): boolean;

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
  abstract protected onItemsChanged(oldItems: MenuItem[], newItems: MenuItem[]): void;

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
  abstract protected onActiveIndexChanged(oldIndex: number, newIndex: number): void;

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
   *
   * Setting the active index has O(1) complexity.
   */
  set activeIndex(value: number) {
    let newIndex = value | 0;
    let item = this._items[newIndex];
    if (!item || !this.isSelectable(item)) {
      newIndex = -1;
    }
    if (this._activeIndex === newIndex) {
      return;
    }
    let oldIndex = this._activeIndex;
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
   *
   * Setting the active item has O(n) complexity.
   */
  set activeItem(value: MenuItem) {
    this.activeIndex = this._items.indexOf(value);
  }

  private _activeIndex = -1;
  private _items: MenuItem[] = Object.freeze([]);
}
