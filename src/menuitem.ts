/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  Command
} from 'phosphor-command';

import {
  Menu
} from './menu';


/**
 * An enum of the supported menu item types.
 */
export
enum MenuItemType {
  /**
   * A normal non-checkable menu item.
   */
  Normal,

  /**
   * A checkable menu item.
   */
  Check,

  /**
   * A separator menu item.
   */
  Separator,

  /**
   * A submenu menu item.
   */
  Submenu,
}


/**
 * An options object for initializing a menu item.
 */
export
interface IMenuItemOptions {
  /**
   * The type of the menu item.
   */
  type?: MenuItemType;

  /**
   * The command for the menu item.
   */
  command?: Command;

  /**
   * The arguments for the command.
   */
  args?: any;

  /**
   * The shortcut decoration for the menu item.
   */
  shortcut?: string;

  /**
   * The submenu for the menu item.
   */
  submenu?: Menu;
}


/**
 * An item which can be added to a menu.
 */
export
class MenuItem {
  /**
   * Construct a new menu item.
   *
   * @param options - The options for initializing the menu item.
   */
  constructor(options: IMenuItemOptions) {
    this._type = options.type || MenuItemType.Normal;
    this._command = options.command || null;
    this._args = options.args || null;
    this._shortcut = options.shortcut || '';
    this._submenu = options.submenu || null;
    if (this._submenu) this._type = MenuItemType.Submenu;
  }

  /**
   * Get the type of the menu item.
   *
   * #### Notes
   * If the item has a submenu, the type will always be `Submenu`.
   *
   * This is a read-only property.
   */
  get type(): MenuItemType {
    return this._type;
  }

  /**
   * Get the command object for the menu item.
   *
   * #### Notes
   * This is a read-only property.
   */
  get command(): Command {
    return this._command;
  }

  /**
   * Get the command arguments for the menu item.
   *
   * #### Notes
   * This is a read-only property.
   */
  get args(): any {
    return this._args;
  }

  /**
   * Get the shortcut decoration for the menu item.
   *
   * #### Notes
   * This is a read-only property.
   */
  get shortcut(): string {
    return this._shortcut;
  }

  /**
   * Get the submenu for the menu item.
   *
   * #### Notes
   * This is a read-only property.
   */
  get submenu(): Menu {
    return this._submenu;
  }

  private _type: MenuItemType;
  private _command: Command;
  private _args: any;
  private _shortcut: string;
  private _submenu: Menu;
}


/**
 * The namespace for the `MenuItem` class statics.
 */
export
namespace MenuItem {
  /**
   * A convenience alias of the `Normal` [[MenuItemType]].
   */
  export
  const Normal = MenuItemType.Normal;

  /**
   * A convenience alias of the `Check` [[MenuItemType]].
   */
  export
  const Check = MenuItemType.Check;

  /**
   * A convenience alias of the `Separator` [[MenuItemType]].
   */
  export
  const Separator = MenuItemType.Separator;

  /**
   * A convenience alias of the `Submenu` [[MenuItemType]].
   */
  export
  const Submenu = MenuItemType.Submenu;
}
