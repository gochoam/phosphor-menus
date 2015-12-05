/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  ICommand
} from 'phosphor-command';

import {
  IChangedArgs, Property
} from 'phosphor-properties';

import {
  ISignal, Signal
} from 'phosphor-signaling';

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
}


/**
 * An options object for initializing a menu item.
 */
export
interface IMenuItemOptions {
  /**
   * The type of the menu item.
   *
   * **See also:** [[typeProperty]]
   */
  type?: MenuItemType;

  /**
   * The text for the menu item.
   *
   * **See also:** [[textProperty]]
   */
  text?: string;

  /**
   * The icon class for the menu item.
   *
   * **See also:** [[iconProperty]]
   */
  icon?: string;

  /**
   * The keyboard shortcut for the menu item.
   *
   * **See also:** [[shortcutProperty]]
   */
  shortcut?: string;

  /**
   * The extra class name to associate with the menu item.
   *
   * **See also:** [[classNameProperty]]
   */
  className?: string;

  /**
   * The command for the menu item.
   *
   * **See also:** [[commandProperty]]
   */
  command?: ICommand;

  /**
   * The args object for the menu item command.
   *
   * **See also:** [[commandArgsProperty]]
   */
  commandArgs?: any;

  /**
   * The submenu for the menu item.
   *
   * **See also:** [[submenuProperty]]
   */
  submenu?: Menu;
}


/**
 * An item which can be added to a menu or menu bar.
 */
export
class MenuItem {
  /**
   * A signal emitted when the menu item state changes.
   *
   * **See also:** [[changed]].
   */
  static changedSignal = new Signal<MenuItem, IChangedArgs<any>>();

  /**
   * The property descriptor for the menu item type.
   *
   * #### Notes
   * The default value is `MenuItemType.Normal`.
   *
   * **See also:** [[type]]
   */
  static typeProperty = new Property<MenuItem, MenuItemType>({
    name: 'type',
    value: MenuItemType.Normal,
    notify: MenuItem.changedSignal,
  });

  /**
   * The property descriptor for the menu item text.
   *
   * #### Notes
   * The text may have an ampersand `&` before the character to use
   * as the mnemonic for the menu item.
   *
   * **See also:** [[text]]
   */
  static textProperty = new Property<MenuItem, string>({
    name: 'text',
    value: '',
    notify: MenuItem.changedSignal,
  });

  /**
   * The property descriptor for the menu item icon class.
   *
   * #### Notes
   * This will be added to the class name of the menu item icon node.
   *
   * Multiple class names can be separated with whitespace.
   *
   * **See also:** [[icon]]
   */
  static iconProperty = new Property<MenuItem, string>({
    name: 'icon',
    value: '',
    notify: MenuItem.changedSignal,
  });

  /**
   * The property descriptor for the menu item shortcut.
   *
   * #### Notes
   * This shortcut is for display purposes only, it does not perform
   * any actual keyboard event handling. Mapping a keyboard shortcut
   * to a command must be handled by external code.
   *
   * **See also:** [[shortcut]]
   */
  static shortcutProperty = new Property<MenuItem, string>({
    name: 'shortcut',
    value: '',
    notify: MenuItem.changedSignal,
  });

  /**
   * The property descriptor for the menu item class name.
   *
   * #### Notes
   * This will be added to the class name of the menu item node.
   *
   * Multiple class names can be separated with whitespace.
   *
   * **See also:** [[className]]
   */
  static classNameProperty = new Property<MenuItem, string>({
    name: 'className',
    value: '',
    notify: MenuItem.changedSignal,
  });

  /**
   * The property descriptor for the item command.
   *
   * #### Notes
   * This command will be executed when the menu item is clicked. The
   * command also controls the checked and enabled state of the item.
   *
   * **See also:** [[command]]
   */
  static commandProperty = new Property<MenuItem, ICommand>({
    name: 'command',
    value: null,
    coerce: (owner, value) => value || null,
    notify: MenuItem.changedSignal,
  });

  /**
   * The property descriptor for the item command arguments.
   *
   * #### Notes
   * This args object will be passed to the `execute` method of the
   * menu item's `command` when the menu item is clicked.
   *
   * **See also:** [[commandArgs]]
   */
  static commandArgsProperty = new Property<MenuItem, any>({
    name: 'commandArgs',
    value: null,
    coerce: (owner, value) => value || null,
    notify: MenuItem.changedSignal,
  });

  /**
   * The property descriptor for the menu item submenu.
   *
   * **See also:** [[submenu]]
   */
  static submenuProperty = new Property<MenuItem, Menu>({
    name: 'submenu',
    value: null,
    coerce: (owner, value) => value || null,
    notify: MenuItem.changedSignal,
  });

  /**
   * Construct a new menu item.
   *
   * @param options - The initialization options for the menu item.
   */
  constructor(options?: IMenuItemOptions) {
    if (options) initFrom(this, options);
  }

  /**
   * A signal emitted when the menu item state changes.
   *
   * #### Notes
   * This is a pure delegate to the [[changedSignal]].
   */
  get changed(): ISignal<MenuItem, IChangedArgs<any>> {
    return MenuItem.changedSignal.bind(this);
  }

  /**
   * Get the type of the menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[typeProperty]].
   */
  get type(): MenuItemType {
    return MenuItem.typeProperty.get(this);
  }

  /**
   * Set the type of the menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[typeProperty]].
   */
  set type(value: MenuItemType) {
    MenuItem.typeProperty.set(this, value);
  }

  /**
   * Get the text for the menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[textProperty]].
   */
  get text(): string {
    return MenuItem.textProperty.get(this);
  }

  /**
   * Set the text for the menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[textProperty]].
   */
  set text(value: string) {
    MenuItem.textProperty.set(this, value);
  }

  /**
   * Get the icon class for the menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[iconProperty]].
   */
  get icon(): string {
    return MenuItem.iconProperty.get(this);
  }

  /**
   * Set the icon class for the menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[iconProperty]].
   */
  set icon(value: string) {
    MenuItem.iconProperty.set(this, value);
  }

  /**
   * Get the shortcut key for the menu item.
   *
   * #### Notes
   * The shortcut string is for decoration only.
   *
   * This is a pure delegate to the [[shortcutProperty]].
   */
  get shortcut(): string {
    return MenuItem.shortcutProperty.get(this);
  }

  /**
   * Set the shortcut key for the menu item.
   *
   * #### Notes
   * The shortcut string is for decoration only.
   *
   * This is a pure delegate to the [[shortcutProperty]].
   */
  set shortcut(value: string) {
    MenuItem.shortcutProperty.set(this, value);
  }

  /**
   * Get the extra class name for the menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[classNameProperty]].
   */
  get className(): string {
    return MenuItem.classNameProperty.get(this);
  }

  /**
   * Set the extra class name for the menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[classNameProperty]].
   */
  set className(value: string) {
    MenuItem.classNameProperty.set(this, value);
  }

  /**
   * Get the command for the menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[commandProperty]].
   */
  get command(): ICommand {
    return MenuItem.commandProperty.get(this);
  }

  /**
   * Set the command for the menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[commandProperty]].
   */
  set command(value: ICommand) {
    MenuItem.commandProperty.set(this, value);
  }

  /**
   * Get the command args for the menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[commandArgsProperty]].
   */
  get commandArgs(): any {
    return MenuItem.commandArgsProperty.get(this);
  }

  /**
   * Set the command args for the menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[commandArgsProperty]].
   */
  set commandArgs(value: any) {
    MenuItem.commandArgsProperty.set(this, value);
  }

  /**
   * Get the submenu for the menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[submenuProperty]].
   */
  get submenu(): Menu {
    return MenuItem.submenuProperty.get(this);
  }

  /**
   * Set the submenu for the menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[submenuProperty]].
   */
  set submenu(value: Menu) {
    MenuItem.submenuProperty.set(this, value);
  }
}


/**
 * Initialize a menu item from an options object.
 */
function initFrom(item: MenuItem, options: IMenuItemOptions): void {
  if (options.type !== void 0) {
    item.type = options.type;
  }
  if (options.text !== void 0) {
    item.text = options.text;
  }
  if (options.icon !== void 0) {
    item.icon = options.icon;
  }
  if (options.shortcut !== void 0) {
    item.shortcut = options.shortcut;
  }
  if (options.className !== void 0) {
    item.className = options.className;
  }
  if (options.command !== void 0) {
    item.command = options.command;
  }
  if (options.commandArgs !== void 0) {
    item.commandArgs = options.commandArgs;
  }
  if (options.submenu !== void 0) {
    item.submenu = options.submenu;
  }
}
