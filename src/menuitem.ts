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
   * The mnemonic for the menu item.
   */
  mnemonic?: string;

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
   * Whether a 'check' type menu item is checked.
   */
  checked?: boolean;

  /**
   * The submenu for the menu item.
   */
  submenu?: Menu;

  /**
   * The extra class name to associate with the menu item.
   */
  className?: string;
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
   * **See also:** [[text]]
   */
  static textProperty = new Property<MenuItem, string>({
    value: '',
  });

  /**
   * The property descriptor for the menu item mnemonic.
   *
   * The mnemonic must be a single character.
   *
   * **See also:** [[mnemonic]]
   */
  static mnemonicProperty = new Property<MenuItem, string>({
    value: '',
    coerce: (owner, value) => value.length <= 1 ? value : owner.mnemonic,
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
    coerce: (owner, val) => owner.type === MenuItemType.Check ? val : false
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
    if (options.mnemonic !== void 0) {
      this.mnemonic = options.mnemonic;
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
    if (options.submenu !== void 0) {
      this.submenu = options.submenu;
    }
    if (options.className !== void 0) {
      this.className = options.className;
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
   * Get the mnemonic key for the menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[mnemonicProperty]].
   */
  get mnemonic(): string {
    return MenuItem.mnemonicProperty.get(this);
  }

  /**
   * Set the mnemonic key for the menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[mnemonicProperty]].
   */
  set mnemonic(mnemonic: string) {
    MenuItem.mnemonicProperty.set(this, mnemonic);
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
}
