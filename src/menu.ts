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
  CommandItem, ICommandItemOptions
} from 'phosphor-command';

import {
  CommandPalette
} from 'phosphor-commandpalette';

import {
  ISignal, Signal
} from 'phosphor-signaling';

import {
  Widget
} from 'phosphor-widget';

import {
  MenuItem
} from './menuitem';


/**
 * The class name added to Menu instances.
 */
const MENU_CLASS = 'p-Menu';


/**
 * A widget which displays menu items as a popup menu.
 */
export
class Menu extends Widget {
  /**
   * Construct a new menu.
   */
  constructor() {
    super();
    this.addClass(MENU_CLASS);
  }

  /**
   * Dispose of the resources held by the menu.
   */
  dispose(): void {
    this._items.length = 0;
    super.dispose();
  }

  /**
   * A signal emitted when the menu is closed.
   */
  get closed(): ISignal<Menu, void> {
    return MenuPrivate.closedSignal.bind(this);
  }

  /**
   * Get an array of the current menu items.
   *
   * @returns A new array of the current menu items
   */
  items(): MenuItem[] {
    return this._items.slice();
  }

  /**
   * Get the number of menu items in the menu.
   *
   * @returns The number of menu items in the menu.
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
   * Add a menu item to the end of the menu.
   *
   * @param item - The menu item to add to the menu.
   */
  addItem(item: MenuItem): void {
    this._items.push(item);
  }

  /**
   * Insert a menu item at the specified index.
   *
   * @param index - The index at which to insert the menu item.
   *
   * @param item - The menu item to insert into the menu.
   */
  insertItem(index: number, item: MenuItem): void {
    arrays.insert(this._items, index, item);
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
   * Remove a menu item from the menu.
   *
   * @param item - The menu item to remove from the menu.
   */
  removeItem(item: MenuItem): void {
    arrays.remove(this._items, item);
  }

  /**
   * Remove all menu items from the menu.
   */
  clearItems(): void {
    this._items.length = 0;
  }

  /**
   * Create and add a new command menu item to the end of the menu.
   *
   * @param options - The options for creating the command item.
   *
   * @returns The newly created menu item.
   */
  addCommand(options: ICommandItemOptions): MenuItem {
    return this.insertCommand(this._items.length, options);
  }

  /**
   * Create and insert a new command menu item into the menu.
   *
   * @param index - The index at which to insert the menu item.
   *
   * @param options - The options for creating the command item.
   *
   * @returns The newly created menu item.
   */
  insertCommand(index: number, options: ICommandItemOptions): MenuItem {
    let command = MenuPrivate.createCommand(options);
    let item = MenuItem.createCommandItem(command);
    this.insertItem(index, item);
    return item;
  }

  /**
   * Create and add a new palette menu item to the end of the menu.
   *
   * @param options - The options for creating the command items.
   *
   * @returns The newly created menu item.
   */
  addPalette(options: ICommandItemOptions[]): MenuItem {
    return this.insertPalette(this._items.length, options);
  }

  /**
   * Create and insert a new palette menu item into the menu.
   *
   * @param index - The index at which to insert the menu item.
   *
   * @param options - The options for creating the command items.
   *
   * @returns The newly created menu item.
   */
  insertPalette(index: number, options: ICommandItemOptions[]): MenuItem {
    let palette = MenuPrivate.createPalette(options);
    let item = MenuItem.createPaletteItem(palette);
    this.insertItem(index, item);
    return item;
  }

  /**
   * Create and add a new separator item to the end of the menu.
   *
   * @returns The newly created menu item.
   */
  addSeparator(): MenuItem {
    return this.insertSeparator(this._items.length);
  }

  /**
   * Create and insert a new separator item into the menu.
   *
   * @param index - The index at which to insert the menu item.
   *
   * @returns The newly created menu item.
   */
  insertSeparator(index: number): MenuItem {
    let item = MenuItem.createSeparatorItem();
    this.insertItem(index, item);
    return item;
  }

  private _items: MenuItem[] = [];
}


/**
 * The namespace for the `Menu` class private data.
 */
namespace MenuPrivate {
  /**
   * A signal emitted when the menu is closed.
   */
  export
  const closedSignal = new Signal<Menu, void>();

  /**
   * Create a new command item from an options objects.
   */
  export
  function createCommand(options: ICommandItemOptions): CommandItem {
    return new CommandItem(options);
  }

  /**
   * Create a new command palette from an array of options.
   */
  export
  function createPalette(options: ICommandItemOptions[]): CommandPalette {
    let commands = options.map(createCommand);
    let palette = new CommandPalette();
    palette.add(commands);
    return palette;
  }
}
