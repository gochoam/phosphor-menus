/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

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

  /**
   * A submenu menu item.
   */
  Submenu,
}


/**
 * A type alias for a menu item handler function.
 */
export
type MenuItemHandler = (item: MenuItem) => void;


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
   * The text for the menu item.
   */
  text?: string;

  /**
   * The icon class for the menu item.
   */
  icon?: string;

  /**
   * The keyboard shortcut for the menu item.
   */
  shortcut?: string;

  /**
   * The disabled state for the menu item.
   */
  disabled?: boolean;

  /**
   * The checked state for the menu item.
   */
  checked?: boolean;

  /**
   * The extra class name to associate with the menu item.
   */
  className?: string;

  /**
   * The handler function for the menu item.
   */
  handler?: MenuItemHandler;

  /**
   * The submenu for the menu item.
   */
  submenu?: Menu;
}


/**
 * An item which can be added to a menu widget.
 */
export
class MenuItem {
  /**
   * Construct a new menu item.
   *
   * @param options - The initialization options for the menu item.
   */
  constructor(options?: IMenuItemOptions) {
    if (options) MenuItemPrivate.initFrom(this, options);
  }

  /**
   * A signal emitted when the menu item state changes.
   */
  get changed(): ISignal<MenuItem, IChangedArgs<any>> {
    return MenuItemPrivate.changedSignal.bind(this);
  }

  /**
   * Get the type of the menu item.
   *
   * #### Notes
   * The default value is `MenuItemType.Normal`.
   */
  get type(): MenuItemType {
    return MenuItemPrivate.typeProperty.get(this);
  }

  /**
   * Set the type of the menu item.
   *
   * #### Notes
   * Items with submenus are forced to `MenuItemType.Submenu`.
   */
  set type(value: MenuItemType) {
    MenuItemPrivate.typeProperty.set(this, value);
  }

  /**
   * Get the text for the menu item.
   *
   * #### Notes
   * The default value is an empty string.
   *
   * An ampersand (`&`) before a character denotes the item mnemonic.
   */
  get text(): string {
    return MenuItemPrivate.textProperty.get(this);
  }

  /**
   * Set the text for the menu item.
   *
   * #### Notes
   * An ampersand (`&`) before a character denotes the item mnemonic.
   */
  set text(value: string) {
    MenuItemPrivate.textProperty.set(this, value);
  }

  /**
   * Get the icon class for the menu item.
   *
   * #### Notes
   * The default value is an empty string.
   *
   * This is the class name(s) added to a menu item icon node.
   */
  get icon(): string {
    return MenuItemPrivate.iconProperty.get(this);
  }

  /**
   * Set the icon class for the menu item.
   *
   * #### Notes
   * Multiple class names can be separated with whitespace.
   */
  set icon(value: string) {
    MenuItemPrivate.iconProperty.set(this, value);
  }

  /**
   * Get the shortcut key for the menu item.
   *
   * #### Notes
   * The default value is an empty string.
   *
   * The shortcut string is for decoration only.
   */
  get shortcut(): string {
    return MenuItemPrivate.shortcutProperty.get(this);
  }

  /**
   * Set the shortcut key for the menu item.
   *
   * #### Notes
   * The shortcut string is for decoration only.
   */
  set shortcut(value: string) {
    MenuItemPrivate.shortcutProperty.set(this, value);
  }

  /**
   * Get the disabled state for the menu item.
   *
   * #### Notes
   * The default value is `false`.
   */
  get disabled(): boolean {
    return MenuItemPrivate.disabledProperty.get(this);
  }

  /**
   * Set the disabled state for the menu item.
   *
   * #### Notes
   * The handler of a disabled menu item will not be invoked.
   */
  set disabled(value: boolean) {
    MenuItemPrivate.disabledProperty.set(this, value);
  }

  /**
   * Get the checked state for the menu item.
   *
   * #### Notes
   * The default value is `false`.
   */
  get checked(): boolean {
    return MenuItemPrivate.checkedProperty.get(this);
  }

  /**
   * Set the checked state for the menu item.
   *
   * #### Notes
   * Only a `Check` type menu item can be checked.
   */
  set checked(value: boolean) {
    MenuItemPrivate.checkedProperty.set(this, value);
  }

  /**
   * Get the extra class name for the menu item.
   *
   * #### Notes
   * The default value is an empty string.
   *
   * This is the class name(s) added to a menu item node.
   */
  get className(): string {
    return MenuItemPrivate.classNameProperty.get(this);
  }

  /**
   * Set the extra class name for the menu item.
   *
   * #### Notes
   * Multiple class names can be separated with whitespace.
   */
  set className(value: string) {
    MenuItemPrivate.classNameProperty.set(this, value);
  }

  /**
   * Get the handler function for the menu item.
   *
   * #### Notes
   * The default value is null.
   *
   * The handler will be invoked when the menu item is clicked.
   */
  get handler(): MenuItemHandler {
    return MenuItemPrivate.handlerProperty.get(this);
  }

  /**
   * Set the handler function for the menu item.
   *
   * #### Notes
   * The handler will be invoked when the menu item is clicked.
   */
  set handler(value: MenuItemHandler) {
    MenuItemPrivate.handlerProperty.set(this, value);
  }

  /**
   * Get the submenu for the menu item.
   *
   * #### Notes
   * The default value is null.
   *
   * An item with a submenu will have type `MenuItemType.Submenu`.
   */
  get submenu(): Menu {
    return MenuItemPrivate.submenuProperty.get(this);
  }

  /**
   * Set the submenu for the menu item.
   *
   * #### Notes
   * The `type` will be automatically set to `MenuItemType.Submenu`.
   */
  set submenu(value: Menu) {
    MenuItemPrivate.submenuProperty.set(this, value);
  }
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


/**
 * The namespace for the menu item private data.
 */
namespace MenuItemPrivate {
  /**
   * A signal emitted when the menu item state changes.
   */
  export
  const changedSignal = new Signal<MenuItem, IChangedArgs<any>>();

  /**
   * The property descriptor for the menu item type.
   */
  export
  const typeProperty = new Property<MenuItem, MenuItemType>({
    name: 'type',
    value: MenuItemType.Normal,
    coerce: (owner, value) => owner.submenu ? MenuItemType.Submenu : value,
    changed: owner => { checkedProperty.coerce(owner); },
    notify: changedSignal,
  });

  /**
   * The property descriptor for the menu item text.
   */
  export
  const textProperty = new Property<MenuItem, string>({
    name: 'text',
    value: '',
    notify: changedSignal,
  });

  /**
   * The property descriptor for the menu item icon class.
   */
  export
  const iconProperty = new Property<MenuItem, string>({
    name: 'icon',
    value: '',
    notify: changedSignal,
  });

  /**
   * The property descriptor for the menu item shortcut.
   */
  export
  const shortcutProperty = new Property<MenuItem, string>({
    name: 'shortcut',
    value: '',
    notify: changedSignal,
  });

  /**
   * The property descriptor for the menu item disabled state.
   */
  export
  const disabledProperty = new Property<MenuItem, boolean>({
    name: 'disabled',
    value: false,
    notify: changedSignal,
  });

  /**
   * The property descriptor for the menu item checked state.
   */
  export
  const checkedProperty = new Property<MenuItem, boolean>({
    name: 'checked',
    value: false,
    coerce: (owner, value) => owner.type === MenuItemType.Check ? value : false,
    notify: changedSignal,
  });

  /**
   * The property descriptor for the menu item class name.
   */
  export
  const classNameProperty = new Property<MenuItem, string>({
    name: 'className',
    value: '',
    notify: changedSignal,
  });

  /**
   * The property descriptor for the menu item handler.
   */
  export
  const handlerProperty = new Property<MenuItem, MenuItemHandler>({
    name: 'handler',
    value: null,
    coerce: (owner, value) => value || null,
    notify: changedSignal,
  });

  /**
   * The property descriptor for the menu item submenu.
   */
  export
  const submenuProperty = new Property<MenuItem, Menu>({
    name: 'submenu',
    value: null,
    coerce: (owner, value) => value || null,
    changed: owner => { typeProperty.coerce(owner); },
    notify: changedSignal,
  });

  /**
   * Initialize a menu item from an options object.
   */
  export
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
    if (options.disabled !== void 0) {
      item.disabled = options.disabled;
    }
    if (options.checked !== void 0) {
      item.checked = options.checked;
    }
    if (options.className !== void 0) {
      item.className = options.className;
    }
    if (options.handler !== void 0) {
      item.handler = options.handler;
    }
    if (options.submenu !== void 0) {
      item.submenu = options.submenu;
    }
  }
}
