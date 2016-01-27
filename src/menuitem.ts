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


/**
 * An options object for initializing a menu item.
 */
export
interface IMenuItemOptions {
  /**
   * The command for the menu item.
   */
  command: Command;

  /**
   * The arguments for the command.
   */
  args?: any;

  /**
   * The keyboard shortcut decoration.
   */
  shortcut?: string;
}


/**
 * A read-only item which can be added to a menu group.
 */
export
class MenuItem {
  /**
   * Construct a new menu item.
   *
   * @param options - The options for initializing the menu item.
   */
  constructor(options: IMenuItemOptions) {
    this._command = options.command;
    this._args = options.args || null;
    this._shortcut = options.shortcut || '';
  }

  /**
   * Get the command for the menu item.
   *
   * #### Notes
   * This is a read-only property.
   */
  get command(): Command {
    return this._command;
  }

  /**
   * Get the arguments for the command.
   *
   * #### Notes
   * This is a read-only property.
   */
  get args(): any {
    return this._args;
  }

  /**
   * Get the keyboard shortcut decoration.
   *
   * #### Notes
   * This is a read-only property.
   */
  get shortcut(): string {
    return this._shortcut;
  }

  private _command: Command;
  private _args: any;
  private _shortcut: string;
}
