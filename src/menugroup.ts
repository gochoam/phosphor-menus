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
  MenuItem
} from './menuitem';


/**
 * An object which holds a collection of menu items.
 */
export
class MenuGroup {
  /**
   * Construct a new menu group.
   */
  constructor() { }

  /**
   * Get an array of the current menu items.
   *
   * @returns A new array of the current menu items.
   */
  items(): MenuItem[] {
    return this._items.slice();
  }

  /**
   * Get the number of menu items in the menu group.
   *
   * @returns The number of menu items in the menu group.
   */
  itemCount(): number {
    return this._items.length;
  }

  /**
   * Get the menu item at the specified index.
   *
   * @param index - The index of the menu item of interest.
   *
   * @returns The menu item at the specified index, or `undefined`.
   */
  itemAt(index: number): MenuItem {
    return this._items[index];
  }

  /**
   * Get the index of the specified menu item.
   *
   * @param item - The menu item of interest.
   *
   * @returns The index of the specified menu item, or `-1`.
   */
  itemIndex(item: MenuItem): number {
    return this._items.indexOf(item);
  }

  /**
   * Add a menu item to the end of the menu group.
   *
   * @param item - The menu item to add to the group, or the options
   *   object for initializing a new menu item.
   */
  addItem(item: IMenuItemOptions | MenuItem): void {
    this._items.push(MenuGroupPrivate.coerceItem(item));
  }

  /**
   * Insert a menu item at the specified index.
   *
   * @param index - The index at which to insert the menu item.
   *
   * @param item - The menu item to add to the group, or the options
   *   object for initializing a new menu item.
   */
  insertItem(index: number, item: IMenuItemOptions | MenuItem): void {
    arrays.insert(this._items, index, MenuGroupPrivate.coerceItem(item));
  }

  /**
   * Remove the menu item at the specified index.
   *
   * @param index - The index of the menu item of interest.
   */
  removeItemAt(index: number): void {
    arrays.removeAt(this._items, index);
  }

  /**
   * Remove a menu item from the menu group.
   *
   * @param item - The menu item to remove from the group.
   */
  removeItem(item: MenuItem): void {
    arrays.remove(this._items, item);
  }

  /**
   * Remove all menu items from the menu group.
   */
  clearItems(): void {
    this._items.length = 0;
  }

  private _items: MenuItem[] = [];
}


/**
 * The namespace for the `MenuGroup` class private data.
 */
namespace MenuGroupPrivate {
  /**
   * Coerce a menu item or item options into a concrete menu item.
   */
  export
  function coerceItem(item: IMenuItemOptions | MenuItem): MenuItem {
    if (item instanceof MenuItem) return item;
    return new MenuItem(item as IMenuItemOptions);
  }
}
