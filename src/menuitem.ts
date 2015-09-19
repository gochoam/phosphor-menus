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
 * An options object used to initialize a menu item.
 */
export
interface IMenuItemOptions {
  /**
   * The type of the menu item.
   */
  type?: string;

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
   * Whether a `'check'` type menu item is checked.
   */
  checked?: boolean;

  /**
   * The extra class name to associate with the menu item.
   */
  className?: string;

  /**
   * The handler function for the menu item.
   */
  handler?: (item: MenuItem) => void;
}


////
// Design Notes:
//
// The `type` of a `MenuItem` should rightfully be an enum instead of
// a string. However, using a string is more amenable to creating menu
// items from a JSON specification.
//
// Basically, we sacrifice some purity in order to make it simpler
// for other code to generate menu items from JSON. This decision
// will probably not impact anyone other than hard-core TypeScript
// enthusiasts, since using string literals is standard JS design.
//
// To make things more type-safe for TypeScript code, explicit read-
// only getters are provided to check the type (`isSeparator`, etc.).
////


/**
 * An item which can be added to a menu or menu bar.
 */
export
class MenuItem {
  /**
   * The property descriptor for the menu item type.
   *
   * Valid types are: `'normal'`, `'check'`, and `'separator'`.
   *
   * #### Notes
   * If an invalid type is provided, a warning will be logged and
   * a `'normal'` type will be used instead.
   *
   * The default value is `'normal'`.
   *
   * **See also:** [[type]]
   */
  static typeProperty = new Property<MenuItem, string>({
    value: 'normal',
    coerce: coerceMenuItemType,
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
   * #### Notes
   * Only a `'check'` type menu item can be checked.
   *
   * **See also:** [[checked]]
   */
  static checkedProperty = new Property<MenuItem, boolean>({
    value: false,
    coerce: (owner, val) => owner.type === 'check' ? val : false,
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
   * The property descriptor for the item handler.
   *
   * This callback will be invoked when the menu item is triggered.
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
    coerce: (owner, value) => value || null,
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
    if (options.handler !== void 0) {
      this.handler = options.handler;
    }
  }

  /**
   * Get the type of the menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[typeProperty]].
   */
  get type(): string {
    return MenuItem.typeProperty.get(this);
  }

  /**
   * Set the type of the menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[typeProperty]].
   */
  set type(value: string) {
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
  set shortcut(value: string) {
    MenuItem.shortcutProperty.set(this, value);
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
  set disabled(value: boolean) {
    MenuItem.disabledProperty.set(this, value);
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
  set hidden(value: boolean) {
    MenuItem.hiddenProperty.set(this, value);
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
  set checked(value: boolean) {
    MenuItem.checkedProperty.set(this, value);
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
  set handler(value: (item: MenuItem) => void) {
    MenuItem.handlerProperty.set(this, value);
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

  /**
   * Test whether the menu item is a `'normal'` type.
   *
   * #### Notes
   * This is a read-only property.
   */
  get isNormalType(): boolean {
    return this.type === 'normal';
  }

  /**
   * Test whether the menu item is a `'check'` type.
   *
   * #### Notes
   * This is a read-only property.
   */
  get isCheckType(): boolean {
    return this.type === 'check';
  }

  /**
   * Test whether the menu item is a `'separator'` type.
   *
   * #### Notes
   * This is a read-only property.
   */
  get isSeparatorType(): boolean {
    return this.type === 'separator';
  }
}


/**
 * The coerce handler for the menu item type.
 */
function coerceMenuItemType(item: MenuItem, value: string): string {
  if (value === 'normal' || value === 'check' || value === 'separator') {
    return value;
  }
  console.warn('invalid menu item type:', value);
  return 'normal';
}
