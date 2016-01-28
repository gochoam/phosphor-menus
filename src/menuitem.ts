/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  CommandItem
} from 'phosphor-command';

import {
  CommandPalette
} from 'phosphor-commandpalette';


/**
 * An enum of supported menu item types.
 */
export
enum MenuItemType {
  /**
   * The menu item represents a command item.
   */
  Command,

  /**
   * The menu item represents a palette item.
   */
  Palette,

  /**
   * The menu item represents a separator item.
   */
  Separator,
}


/**
 * An options object for initializing a menu item.
 */
export
interface IMenuItemOptions {
  /**
   * The type of the menu item.
   */
  type: MenuItemType;

  /**
   * The command item for a `Command` type menu item.
   */
  command?: CommandItem;

  /**
   * The command palette for a `Palette` type menu item.
   */
  palette?: CommandPalette;
}


/**
 * A read-only object which can be added to a menu.
 */
export
class MenuItem {
  /**
   * Create a new menu item with the given command item.
   *
   * @param command - The command item for the menu item.
   *
   * @returns A new `Command` type menu item.
   */
  static createCommandItem(command: CommandItem): MenuItem {
    return new MenuItem({ type: MenuItem.Command, command });
  }

  /**
   * Create a new menu item with the given command palette.
   *
   * @param palette - The command palette for the menu item.
   *
   * @returns A new `Palette` type menu item.
   */
  static createPaletteItem(palette: CommandPalette): MenuItem {
    return new MenuItem({ type: MenuItem.Palette, palette });
  }

  /**
   * Create a new separator menu item
   *
   * @returns A new `Separator` type menu item.
   */
  static createSeparatorItem(): MenuItem {
    return new MenuItem({ type: MenuItem.Separator });
  }

  /**
   * Construct a new menu item.
   *
   * @param options - The options for initializing the menu item.
   */
  constructor(options: IMenuItemOptions) {
    this._type = options.type;
    this._command = options.command || null;
    this._palette = options.palette || null;
  }

  /**
   * Get the type of the menu item.
   *
   * #### Notes
   * This is a read-only property.
   */
  get type(): MenuItemType {
    return this._type;
  }

  /**
   * Get the command item for a `Command` type menu item.
   *
   * #### Notes
   * This is a read-only property.
   */
  get command(): CommandItem {
    return this._command;
  }

  /**
   * Get the command palette for a `Palette` type menu item.
   *
   * #### Notes
   * This is a read-only property.
   */
  get palette(): CommandPalette {
    return this._palette;
  }

  private _type: MenuItemType;
  private _command: CommandItem;
  private _palette: CommandPalette;
}


/**
 * The namespace for the `MenuItem` class statics.
 */
export
namespace MenuItem {
  /**
   * A convenience alias of the `Command` menu item type.
   */
  export
  const Command = MenuItemType.Command;

  /**
   * A convenience alias of the `Palette` menu item type.
   */
  export
  const Palette = MenuItemType.Palette;

  /**
   * A convenience alias of the `Separator` menu item type.
   */
  export
  const Separator = MenuItemType.Separator;
}
