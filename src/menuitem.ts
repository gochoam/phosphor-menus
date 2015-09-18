/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  Property
} from 'phosphor-properties';

import {
  Menu
} from './menu';


/**
 * The type of a menu item.
 */
export
enum MenuItemType {
  /**
   * A normal menu item.
   */
  Normal,

  /**
   * A checkable menu item.
   */
  Check,

  /**
   * A non-interactive separator.
   */
  Separator,
}


/**
 * An options object used to initialize a menu item.
 */
export
interface IMenuItemOptions {
  /**
   * The type of the menu item.
   */
  type?: MenuItemType;

  /**
   * The text for the menu item.
   */
  text?: string;

  /**
   * The keyboard shortcut for the menu item.
   */
  shortcut?: string;

  /**
   * Whether the menu item is disabled.
   */
  disabled?: boolean;

  /**
   * Whether the menu item is hidden.
   */
  hidden?: boolean;

  /**
   * Whether a `Check` type menu item is checked.
   */
  checked?: boolean;

  /**
   * The extra class name to associate with the menu item.
   */
  className?: string;

  /**
   * The command id for the menu item.
   */
  command?: string;

  /**
   * The handler function for the menu item.
   */
  handler?: (item: MenuItem) => void;

  /**
   * The submenu for the menu item.
   */
  submenu?: Menu;
}


/**
 * An item which can be added to a menu or menu bar.
 */
export
class MenuItem {
  /**
   * A convenience alias of the `Normal` [[MenuItemType]].
   */
  static Normal = MenuItemType.Normal;

  /**
   * A convenience alias of the `Check` [[MenuItemType]].
   */
  static Check = MenuItemType.Check;

  /**
   * A convenience alias of the `Separator` [[MenuItemType]].
   */
  static Separator = MenuItemType.Separator;

  /**
   * The property descriptor for the menu item type.
   *
   * **See also:** [[type]]
   */
  static typeProperty = new Property<MenuItem, MenuItemType>({
    value: MenuItemType.Normal,
    changed: owner => MenuItem.checkedProperty.coerce(owner),
  });

  /**
   * The property descriptor for the menu item text.
   *
   * The text may have an ampersand `&` before the character
   * to use as the mnemonic for the menu item.
   *
   * **See also:** [[text]]
   */
  static textProperty = new Property<MenuItem, string>({
    value: '',
  });

  /**
   * The property descriptor for the menu item shortcut.
   *
   * **See also:** [[shortcut]]
   */
  static shortcutProperty = new Property<MenuItem, string>({
    value: '',
  });

  /**
   * The property descriptor controlling the menu item disabled state.
   *
   * **See also:** [[disabled]]
   */
  static disabledProperty = new Property<MenuItem, boolean>({
    value: false,
  });

  /**
   * The property descriptor controlling the menu item hidden state.
   *
   * **See also:** [[hidden]]
   */
  static hiddenProperty = new Property<MenuItem, boolean>({
    value: false,
  });

  /**
   * The property descriptor controlling the menu item checked state.
   *
   * **See also:** [[checked]]
   */
  static checkedProperty = new Property<MenuItem, boolean>({
    value: false,
    coerce: (owner, val) => owner.type === MenuItemType.Check ? val : false,
  });

  /**
   * The property descriptor for the menu item class name.
   *
   * This is an extra class name which item renderers will add to
   * the DOM node which represents the menu item.
   *
   * **See also:** [[className]]
   */
  static classNameProperty = new Property<MenuItem, string>({
    value: '',
  });

  /**
   * The property descriptor for the item command id.
   *
   * If a command id is provided, the [[handler]] for the menu item
   * will be ignored, and the `Menu` widget which consumes the menu
   * item will request that the given command be executed instead.
   *
   * **See also:** [[command]]
   */
  static commandProperty = new Property<MenuItem, string>({
    value: '',
  });

  /**
   * The property descriptor for the item handler.
   *
   * If a command id is not provided, this callback will be invoked
   * when the menu item is triggered.
   *
   * **See also:** [[handler]]
   */
  static handlerProperty = new Property<MenuItem, (item: MenuItem) => void>({
    value: null,
    coerce: (owner, value) => value || null,
  });

  /**
   * The property descriptor for the menu item submenu.
   *
   * **See also:** [[submenu]]
   */
  static submenuProperty = new Property<MenuItem, Menu>({
    value: null,
  });

  /**
   * Construct a new menu item.
   *
   * @param options - The initialization options for the menu item.
   */
  constructor(options: IMenuItemOptions = {}) {
    if (options.type !== void 0) {
      this.type = options.type;
    }
    if (options.text !== void 0) {
      this.text = options.text;
    }
    if (options.shortcut !== void 0) {
      this.shortcut = options.shortcut;
    }
    if (options.disabled !== void 0) {
      this.disabled = options.disabled;
    }
    if (options.hidden !== void 0) {
      this.hidden = options.hidden;
    }
    if (options.checked !== void 0) {
      this.checked = options.checked;
    }
    if (options.className !== void 0) {
      this.className = options.className;
    }
    if (options.command !== void 0) {
      this.command = options.command;
    }
    if (options.handler !== void 0) {
      this.handler = options.handler;
    }
    if (options.submenu !== void 0) {
      this.submenu = options.submenu;
    }
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
  set type(type: MenuItemType) {
    MenuItem.typeProperty.set(this, type);
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
  set text(text: string) {
    MenuItem.textProperty.set(this, text);
  }

  /**
   * Get the shortcut key for the menu item (decoration only).
   *
   * #### Notes
   * This is a pure delegate to the [[shortcutProperty]].
   */
  get shortcut(): string {
    return MenuItem.shortcutProperty.get(this);
  }

  /**
   * Set the shortcut key for the menu item (decoration only).
   *
   * #### Notes
   * This is a pure delegate to the [[shortcutProperty]].
   */
  set shortcut(shortcut: string) {
    MenuItem.shortcutProperty.set(this, shortcut);
  }

  /**
   * Get whether the menu item is disabled.
   *
   * #### Notes
   * This is a pure delegate to the [[disabledProperty]].
   */
  get disabled(): boolean {
    return MenuItem.disabledProperty.get(this);
  }

  /**
   * Set whether the menu item is disabled.
   *
   * #### Notes
   * This is a pure delegate to the [[disabledProperty]].
   */
  set disabled(disabled: boolean) {
    MenuItem.disabledProperty.set(this, disabled);
  }

  /**
   * Get whether the menu item is hidden.
   *
   * #### Notes
   * This is a pure delegate to the [[hiddenProperty]].
   */
  get hidden(): boolean {
    return MenuItem.hiddenProperty.get(this);
  }

  /**
   * Set whether the menu item is hidden.
   *
   * #### Notes
   * This is a pure delegate to the [[hiddenProperty]].
   */
  set hidden(hidden: boolean) {
    MenuItem.hiddenProperty.set(this, hidden);
  }

  /**
   * Get whether the menu item is checked.
   *
   * #### Notes
   * This is a pure delegate to the [[checkedProperty]].
   */
  get checked(): boolean {
    return MenuItem.checkedProperty.get(this);
  }

  /**
   * Set whether the menu item is checked.
   *
   * #### Notes
   * This is a pure delegate to the [[checkedProperty]].
   */
  set checked(checked: boolean) {
    MenuItem.checkedProperty.set(this, checked);
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
  set className(name: string) {
    MenuItem.classNameProperty.set(this, name);
  }

  /**
   * Get the command id for the menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[commandProperty]].
   */
  get command(): string {
    return MenuItem.commandProperty.get(this);
  }

  /**
   * Set the command id for the menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[commandProperty]].
   */
  set command(name: string) {
    MenuItem.commandProperty.set(this, name);
  }

  /**
   * Get the handler for the menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[handlerProperty]].
   */
  get handler(): (item: MenuItem) => void {
    return MenuItem.handlerProperty.get(this);
  }

  /**
   * Set the handler for the menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[handlerProperty]].
   */
  set handler(name: (item: MenuItem) => void) {
    MenuItem.handlerProperty.set(this, name);
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
  set submenu(submenu: Menu) {
    MenuItem.submenuProperty.set(this, submenu);
  }
}
