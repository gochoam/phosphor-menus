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
 * An options object which holds common menu item options.
 *
 * **See also:** [[IMenuItemTemplate]], [[IMenuItemOptions]]
 */
export
interface IMenuItemCommon {
  /**
   * The type of the menu item.
   *
   * **See also:** [[typeProperty]]
   */
  type?: string;

  /**
   * The text for the menu item.
   *
   * **See also:** [[textProperty]]
   */
  text?: string;

  /**
   * The keyboard shortcut for the menu item.
   *
   * **See also:** [[shortcutProperty]]
   */
  shortcut?: string;

  /**
   * Whether the menu item is disabled.
   *
   * **See also:** [[disabledProperty]]
   */
  disabled?: boolean;

  /**
   * Whether the menu item is hidden.
   *
   * **See also:** [[hiddenProperty]]
   */
  hidden?: boolean;

  /**
   * Whether a `'check'` type menu item is checked.
   *
   * **See also:** [[checkedProperty]]
   */
  checked?: boolean;

  /**
   * The extra class name to associate with the menu item.
   *
   * **See also:** [[classNameProperty]]
   */
  className?: string;

  /**
   * The handler function for the menu item.
   *
   * **See also:** [[handlerProperty]]
   */
  handler?: (item: MenuItem) => void;
}


/**
 * An options object for building a menu item from a template.
 */
export
interface IMenuItemTemplate extends IMenuItemCommon {
  /**
   * The template objects for the menu item submenu.
   *
   * **See also:** [[fromTemplate]]
   */
  submenu?: IMenuItemTemplate[];
}


/**
 * An options object used to initialize a menu item.
 */
export
interface IMenuItemOptions extends IMenuItemCommon {
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
   * Create a menu item from a template.
   *
   * @param template - The template object for the menu item.
   *
   * @returns A new menu item created from the template.
   *
   * #### Notes
   * If a submenu template is provided, the submenu will be created
   * by calling `Menu.fromTemplate`. If a custom menu is necessary,
   * use the `MenuItem` constructor directly.
   */
  static fromTemplate(template: IMenuItemTemplate): MenuItem {
    let item = new MenuItem();
    initFromTemplate(item, template);
    return item;
  }

  /**
   * The property descriptor for the menu item type.
   *
   * Valid types are: `'normal'`, `'check'`, and `'separator'`.
   *
   * #### Notes
   * If an invalid type is provided, a warning will be logged and a
   * `'normal'` type will be used instead.
   *
   * The default value is `'normal'`.
   *
   * Using a string for this value instead of an enum makes it easier
   * to create menu items from a JSON specification. For the type-safe
   * crowd, read-only getters are provided to assert the item type.
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
   * The text may have an ampersand `&` before the character to use
   * as the mnemonic for the menu item.
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
  constructor(options?: IMenuItemOptions) {
    if (options) initFromOptions(this, options);
  }

  /**
   * Get the type of the menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[typeProperty]].
   *
   * **See also:** [[isNormalType]], [[isCheckType]], [[isSeparatorType]]
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
   *
   * **See also:** [[type]], [[isCheckType]], [[isSeparatorType]]
   */
  get isNormalType(): boolean {
    return this.type === 'normal';
  }

  /**
   * Test whether the menu item is a `'check'` type.
   *
   * #### Notes
   * This is a read-only property.
   *
   * **See also:** [[type]], [[isNormalType]], [[isSeparatorType]]
   */
  get isCheckType(): boolean {
    return this.type === 'check';
  }

  /**
   * Test whether the menu item is a `'separator'` type.
   *
   * #### Notes
   * This is a read-only property.
   *
   * **See also:** [[type]], [[isNormalType]], [[isCheckType]]
   */
  get isSeparatorType(): boolean {
    return this.type === 'separator';
  }
}


/**
 * Initialize a menu item from a common options object.
 */
function initFromCommon(item: MenuItem, common: IMenuItemCommon): void {
  if (common.type !== void 0) {
    item.type = common.type;
  }
  if (common.text !== void 0) {
    item.text = common.text;
  }
  if (common.shortcut !== void 0) {
    item.shortcut = common.shortcut;
  }
  if (common.disabled !== void 0) {
    item.disabled = common.disabled;
  }
  if (common.hidden !== void 0) {
    item.hidden = common.hidden;
  }
  if (common.checked !== void 0) {
    item.checked = common.checked;
  }
  if (common.className !== void 0) {
    item.className = common.className;
  }
  if (common.handler !== void 0) {
    item.handler = common.handler;
  }
}


/**
 * Initialize a menu item from a template object.
 */
function initFromTemplate(item: MenuItem, template: IMenuItemTemplate): void {
  initFromCommon(item, template);
  if (template.submenu !== void 0) {
    item.submenu = Menu.fromTemplate(template.submenu);
  }
}


/**
 * Initialize a menu item from an options object.
 */
function initFromOptions(item: MenuItem, options: IMenuItemOptions): void {
  initFromCommon(item, options);
  if (options.submenu !== void 0) {
    item.submenu = options.submenu;
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
