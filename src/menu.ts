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
  Message, sendMessage
} from 'phosphor-messaging';

import {
  PanelLayout
} from 'phosphor-panel';

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
 * The class name added to a menu content widget.
 */
const CONTENT_CLASS = 'p-Menu-content';

/**
 * The class name added to a menu item node.
 */
const ITEM_CLASS = 'p-Menu-item';

/**
 * The class name added to a menu item icon cell.
 */
const ICON_CLASS = 'p-Menu-itemIcon';

/**
 * The class name added to a menu item text cell.
 */
const TEXT_CLASS = 'p-Menu-itemText';

/**
 * The class name added to a menu item shortcut cell.
 */
const SHORTCUT_CLASS = 'p-Menu-itemShortcut';

/**
 * The class name added to a command menu item.
 */
const COMMAND_TYPE_CLASS = 'p-type-command';

/**
 * The class name added to a palette menu item.
 */
const PALETTE_TYPE_CLASS = 'p-type-palette';

/**
 * The class name added to a separator menu item.
 */
const SEPARATOR_TYPE_CLASS = 'p-type-separator';

/**
 * The class name added to a disabled menu item.
 */
const DISABLED_CLASS = 'p-mod-disabled';

/**
 * The class name added to a checked menu item.
 */
const CHECKED_CLASS = 'p-mod-checked';


/**
 * A widget which displays menu items as a popup menu.
 */
export
class Menu extends Widget {
  /**
   * Create a new item node for a menu item.
   *
   * @returns A new DOM node to use as a menu item node.
   *
   * #### Notes
   * This method may be reimplemented to create custom items.
   */
  static createItemNode(): HTMLElement {
    let node = document.createElement('li');
    let icon = document.createElement('span');
    let text = document.createElement('span');
    let shortcut = document.createElement('span');
    node.className = ITEM_CLASS;
    icon.className = ICON_CLASS;
    text.className = TEXT_CLASS;
    shortcut.className = SHORTCUT_CLASS;
    node.appendChild(icon);
    node.appendChild(text);
    node.appendChild(shortcut);
    return node;
  }

  /**
   * Update an item node to reflect the current state of a menu item.
   *
   * @param node - A node created by a call to [[createItemNode]].
   *
   * @param item - The menu item to use for the item state.
   *
   * #### Notes
   * This is called automatically when the item should be updated.
   *
   * If the [[createItemNode]] method is reimplemented, this method
   * should also be reimplemented so that the item state is properly
   * updated.
   */
  static updateItemNode(node: HTMLElement, item: MenuItem): void {
    let type = '';
    let text = '';
    let icon = '';
    let extra = '';
    let shortcut = '';
    let disabled = false;
    let checked = false;

    switch (item.type) {
    case MenuItem.Command:
      let command = item.command;
      type = COMMAND_TYPE_CLASS;
      text = command.text;
      icon = command.icon;
      extra = command.className;
      shortcut = command.shortcut;
      disabled = !command.isEnabled;
      checked = command.isChecked;
      break;
    case MenuItem.Palette:
      let palette = item.palette;
      let title = palette.title;
      type = PALETTE_TYPE_CLASS;
      text = title.text;
      icon = title.icon;
      extra = title.className;
      // TODO support disabled
    case MenuItem.Separator:
      type = SEPARATOR_TYPE_CLASS;
      break;
    }

    let itemClass = ITEM_CLASS;
    let iconClass = ICON_CLASS;
    if (type) itemClass += ' ' + type;
    if (extra) itemClass += ' ' + extra;
    if (disabled) itemClass += ' ' + DISABLED_CLASS;
    if (checked) itemClass += ' ' + CHECKED_CLASS;
    if (icon) iconClass += ' ' + icon;

    let iconNode = node.firstChild as HTMLElement;
    let textNode = iconNode.nextSibling as HTMLElement;
    let shortcutNode = textNode.nextSibling as HTMLElement;

    node.className = itemClass;
    iconNode.className = iconClass;
    textNode.textContent = text;
    shortcutNode.textContent = shortcut;
  }

  /**
   * Construct a new menu.
   */
  constructor() {
    super();
    this.addClass(MENU_CLASS);

    let content = new MenuContent();
    content.addClass(CONTENT_CLASS);

    let layout = new PanelLayout();
    layout.addChild(content);

    this._content = content;
    this.layout = layout;
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
    // TODO handle changes during attach
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
    // TODO handle changes during attach
    arrays.insert(this._items, index, item);
  }

  /**
   * Remove the menu item at the specified index.
   *
   * @param index - The index of the menu item of interest.
   */
  removeItemAt(index: number): void {
    // TODO handle changes during attach
    arrays.removeAt(this._items, index);
  }

  /**
   * Remove a menu item from the menu.
   *
   * @param item - The menu item to remove from the menu.
   */
  removeItem(item: MenuItem): void {
    // TODO handle changes during attach
    arrays.remove(this._items, item);
  }

  /**
   * Remove all menu items from the menu.
   */
  clearItems(): void {
    // TODO handle changes during attach
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

  /**
   *
   */
  open(clientX: number, clientY: number): void {
    if (this.isAttached) {
      return;
    }

    sendMessage(this, Widget.MsgUpdateRequest);

    let style = this.node.style;
    style.top = `${clientY}px`;
    style.left = `${clientX}px`;
    this.attach(document.body);
  }

  /**
   *
   */
  protected onUpdateRequest(msg: Message): void {
    let items = this._items;
    let content = this._content.node;
    let children = content.children;
    let constructor = this.constructor as typeof Menu;
    while (children.length > items.length) {
      content.removeChild(content.lastChild);
    }
    while (children.length < items.length) {
      content.appendChild(constructor.createItemNode());
    }
    for (let i = 0, n = items.length; i < n; ++i) {
      constructor.updateItemNode(children[i] as HTMLElement, items[i]);
    }
  }

  private _content: MenuContent;
  private _items: MenuItem[] = [];
}


/**
 *
 */
class MenuContent extends Widget {
  /**
   *
   */
  static createNode(): HTMLElement {
    return document.createElement('ul');
  }
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
