/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  hitTest
} from 'phosphor-domutil';

import {
  Message
} from 'phosphor-messaging';

import {
  Property
} from 'phosphor-properties';

import {
  Menu
} from './menu';

import {
  MenuBase
} from './menubase';

import {
  IMenuItemTemplate, MenuItem
} from './menuitem';


/**
 * A widget which displays menu items as a menu bar.
 *
 * #### Notes
 * A `MenuBar` widget does not support child widgets. Adding children
 * to a `MenuBar` will result in undefined behavior.
 */
export
class MenuBar extends MenuBase {
  /**
   * The class name added to a menu bar widget.
   */
  static p_MenuBar = 'p-MenuBar';

  /**
   * The class name added to a menu bar content node.
   */
  static p_MenuBar_content = 'p-MenuBar-content';

  /**
   * The class name added to an open menu bar menu.
   */
  static p_MenuBar_menu = 'p-MenuBar-menu';

  /**
   * The class name added to a menu item node.
   */
  static p_MenuBar_item = 'p-MenuBar-item';

  /**
   * The class name added to a menu item icon cell.
   */
  static p_MenuBar_item_icon = 'p-MenuBar-item-icon';

  /**
   * The class name added to a menu item text cell.
   */
  static p_MenuBar_item_text = 'p-MenuBar-item-text';

  /**
   * The modifier class name added to a separator type menu item.
   */
  static p_mod_separator_type = 'p-mod-separator-type';

  /**
   * The modifier class name added to an active menu bar and menu item.
   */
  static p_mod_active = 'p-mod-active';

  /**
   * The modifier class name added to a disabled menu item.
   */
  static p_mod_disabled = 'p-mod-disabled';

  /**
   * The modifier class name added to a force hidden menu item.
   */
  static p_mod_force_hidden = 'p-mod-force-hidden';

  /**
   * Create the DOM node for a menu bar.
   */
  static createNode(): HTMLElement {
    var node = document.createElement('div');
    var content = document.createElement('div');
    content.className = MenuBar.p_MenuBar_content;
    node.appendChild(content);
    return node;
  }

  /**
   * A convenience method to create a menu bar from a template.
   *
   * @param array - The menu item templates for the menu bar.
   *
   * @returns A new menu bar created from the menu item templates.
   *
   * #### Notes
   * Submenu templates will be recursively created using the
   * `Menu.fromTemplate` method. If custom menus or menu items
   * are required, use the relevant constructors directly.
   */
  static fromTemplate(array: IMenuItemTemplate[]): MenuBar {
    var bar = new MenuBar();
    bar.items = array.map(createMenuItem);
    return bar;
  }

  /**
   * Construct a new menu bar.
   */
  constructor() {
    super();
    this.addClass(MenuBar.p_MenuBar);
  }

  /**
   * Dispose of the resources held by the panel.
   */
  dispose(): void {
    this._reset();
    super.dispose();
  }

  /**
   * Get the child menu of the menu bar.
   *
   * #### Notes
   * This will be `null` if the menu bar does not have an open menu.
   */
  get childMenu(): Menu {
    return this._childMenu;
  }

  /**
   * Handle the DOM events for the menu bar.
   *
   * @param event - The DOM event sent to the menu bar.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the menu's DOM nodes. It should
   * not be called directly by user code.
   */
  handleEvent(event: Event): void {
    switch (event.type) {
    case 'mousedown':
      this._evtMouseDown(event as MouseEvent);
      break;
    case 'mousemove':
      this._evtMouseMove(event as MouseEvent);
      break;
    case 'mouseleave':
      this._evtMouseLeave(event as MouseEvent);
      break;
    case 'contextmenu':
      this._evtContextMenu(event as MouseEvent);
      break;
    case 'keydown':
      this._evtKeyDown(event as KeyboardEvent);
      break;
    case 'keypress':
      this._evtKeyPress(event as KeyboardEvent);
      break;
    }
  }

  /**
   * A method invoked when the menu items change.
   */
  protected onItemsChanged(old: MenuItem[], items: MenuItem[]): void {
    for (var i = 0, n = old.length; i < n; ++i) {
      Property.getChanged(old[i]).disconnect(this._onItemChanged, this);
    }
    for (var i = 0, n = items.length; i < n; ++i) {
      Property.getChanged(items[i]).connect(this._onItemChanged, this);
    }
    this.update(true);
  }

  /**
   * A method invoked when the active index changes.
   */
  protected onActiveIndexChanged(old: number, index: number): void {
    var oldNode = this._itemNodeAt(old);
    var newNode = this._itemNodeAt(index);
    if (oldNode) oldNode.classList.remove(MenuBar.p_mod_active);
    if (newNode) newNode.classList.add(MenuBar.p_mod_active);
  }

  /**
   * A method invoked when a menu item should be opened.
   */
  protected onOpenItem(index: number, item: MenuItem): void {
    var node = this._itemNodeAt(index) || this.node;
    this._activate();
    this._closeChildMenu();
    this._openChildMenu(item.submenu, node);
  }

  /**
   * A message handler invoked on an `'after-attach'` message.
   */
  protected onAfterAttach(msg: Message): void {
    this.node.addEventListener('mousedown', this);
    this.node.addEventListener('mousemove', this);
    this.node.addEventListener('mouseleave', this);
    this.node.addEventListener('contextmenu', this);
  }

  /**
   * A message handler invoked on a `'before-detach'` message.
   */
  protected onBeforeDetach(msg: Message): void {
    this.node.removeEventListener('mousedown', this);
    this.node.removeEventListener('mousemove', this);
    this.node.removeEventListener('mouseleave', this);
    this.node.removeEventListener('contextmenu', this);
  }

  /**
   * A handler invoked on an `'update-request'` message.
   */
  protected onUpdateRequest(msg: Message): void {
    // Reset the state of the menu bar.
    this._reset();

    // Create the nodes for the menu bar.
    var items = this.items;
    var count = items.length;
    var nodes = new Array<HTMLElement>(count);
    for (var i = 0; i < count; ++i) {
      nodes[i] = createItemNode(items[i]);
    }

    // Force hide the leading visible separators.
    for (var k1 = 0; k1 < count; ++k1) {
      if (items[k1].hidden) {
        continue;
      }
      if (!items[k1].isSeparatorType) {
        break;
      }
      nodes[k1].classList.add(MenuBar.p_mod_force_hidden);
    }

    // Force hide the trailing visible separators.
    for (var k2 = count - 1; k2 >= 0; --k2) {
      if (items[k2].hidden) {
        continue;
      }
      if (!items[k2].isSeparatorType) {
        break;
      }
      nodes[k2].classList.add(MenuBar.p_mod_force_hidden);
    }

    // Force hide the remaining consecutive visible separators.
    var hide = false;
    while (++k1 < k2) {
      if (items[k1].hidden) {
        continue;
      }
      if (hide && items[k1].isSeparatorType) {
        nodes[k1].classList.add(MenuBar.p_mod_force_hidden);
      } else {
        hide = items[k1].isSeparatorType;
      }
    }

    // Fetch the content node.
    var content = this.node.firstChild;

    // Refresh the content node's content.
    content.textContent = '';
    for (var i = 0; i < count; ++i) {
      content.appendChild(nodes[i]);
    }
  }

  /**
   * A message handler invoked on a `'close-request'` message.
   */
  protected onCloseRequest(msg: Message): void {
    this._reset();
    super.onCloseRequest(msg);
  }

  /**
   * Handle the `'mousedown'` event for the menu bar.
   */
  private _evtMouseDown(event: MouseEvent): void {
    var x = event.clientX;
    var y = event.clientY;

    // If the bar is active and the mouse press is on an open menu,
    // let that menu handle the press. The bar will reset when the
    // menu emits its `closed` signal.
    if (this._active && hitTestMenus(this._childMenu, x, y)) {
      return;
    }

    // Check if the mouse was pressed on one of the menu items.
    var i = this._hitTestItemNodes(x, y);

    // If the bar is active, deactivate it and close the child menu.
    // The active index is updated to reflect the mouse press, which
    // is either valid, or `-1`.
    if (this._active) {
      this._deactivate();
      this._closeChildMenu();
      this.activeIndex = i;
      return;
    }

    // At this point, the bar is not active. If the mouse press
    // was not on a menu item, clear the active index and return.
    if (i === -1) {
      this.activeIndex = -1;
      return;
    }

    // Otherwise, the press was on a menu item. Activate the bar,
    // update the active index, and open the menu item if possible.
    this._activate();
    this.activeIndex = i;
    this.openActiveItem();
  }

  /**
   * Handle the `'mousemove'` event for the menu bar.
   */
  private _evtMouseMove(event: MouseEvent): void {
    var x = event.clientX;
    var y = event.clientY;

    // Check if the mouse is over one of the menu items.
    var i = this._hitTestItemNodes(x, y);

    // Bail early if the active index will not change.
    if (i === this.activeIndex) {
      return;
    }

    // Bail early if the bar is active and the mouse is not over an
    // item. This allows the leading and trailing menus to be kept
    // open when the mouse is over the empty part of the menu bar.
    if (i === -1 && this._active) {
      return;
    }

    // Update the active index to the hovered item.
    this.activeIndex = i;

    // If the bar is not active, there's nothing more to do.
    if (!this._active) {
      return;
    }

    // Otherwise, close the current child menu and open the new one.
    this._closeChildMenu();
    this.openActiveItem();
  }

  /**
   * Handle the `'mouseleave'` event for the menu bar.
   */
  private _evtMouseLeave(event: MouseEvent): void {
    if (!this._active) this.activeIndex = -1;
  }

  /**
   * Handle the `'contextmenu'` event for the menu bar.
   */
  private _evtContextMenu(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Handle the `'keydown'` event for the menu bar.
   */
  private _evtKeyDown(event: KeyboardEvent): void {
    event.stopPropagation();
    var menu = this._childMenu;
    var leaf = menu && menu.leafMenu;
    switch (event.keyCode) {
    case 13:  // Enter
      event.preventDefault();
      if (leaf) leaf.triggerActiveItem();
      break;
    case 27:  // Escape
      event.preventDefault();
      if (leaf) leaf.close(true);
      break;
    case 37:  // Left Arrow
      event.preventDefault();
      if (leaf && leaf !== menu) {
        leaf.close(true);
      } else {
        this._closeChildMenu();
        this.activatePreviousItem();
        this.openActiveItem();
      }
      break;
    case 38:  // Up Arrow
      event.preventDefault();
      if (leaf) leaf.activatePreviousItem();
      break;
    case 39:  // Right Arrow
      event.preventDefault();
      if (leaf && activeHasMenu(leaf)) {
        leaf.openActiveItem();
      } else {
        this._closeChildMenu();
        this.activateNextItem();
        this.openActiveItem();
      }
      break;
    case 40:  // Down Arrow
      event.preventDefault();
      if (leaf) leaf.activateNextItem();
      break;
    }
  }

  /**
   * Handle the `'keypress'` event for the menu bar.
   */
  private _evtKeyPress(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
    var str = String.fromCharCode(event.charCode);
    (this._childMenu || this).activateMnemonicItem(str);
  }

  /**
   * Open the child menu using the given item node for location.
   */
  private _openChildMenu(menu: Menu, node: HTMLElement): void {
    var rect = node.getBoundingClientRect();
    this._childMenu = menu;
    menu.addClass(MenuBar.p_MenuBar_menu);
    menu.open(rect.left, rect.bottom, false, true);
    menu.closed.connect(this._onMenuClosed, this);
  }

  /**
   * Close the current child menu, if one exists.
   */
  private _closeChildMenu(): void {
    var menu = this._childMenu;
    if (menu) {
      this._childMenu = null;
      menu.closed.disconnect(this._onMenuClosed, this);
      menu.removeClass(MenuBar.p_MenuBar_menu);
      menu.close(true);
    }
  }

  /**
   * Activate the menu bar and switch the mouse listeners to global.
   *
   * The listeners are switched after the current event dispatch is
   * complete. Otherwise, duplicate event notifications could occur.
   */
  private _activate(): void {
    if (this._active) {
      return;
    }
    this._active = true;
    this.addClass(MenuBar.p_mod_active);
    setTimeout(() => {
      this.node.removeEventListener('mousedown', this);
      document.addEventListener('mousedown', this, true);
      document.addEventListener('keydown', this, true);
      document.addEventListener('keypress', this, true);
    }, 0);
  }

  /**
   * Deactivate the menu bar switch the mouse listeners to local.
   *
   * The listeners are switched after the current event dispatch is
   * complete. Otherwise, duplicate event notifications could occur.
   */
  private _deactivate(): void {
    if (!this._active) {
      return;
    }
    this._active = false;
    this.removeClass(MenuBar.p_mod_active);
    setTimeout(() => {
      this.node.addEventListener('mousedown', this);
      document.removeEventListener('mousedown', this, true);
      document.removeEventListener('keydown', this, true);
      document.removeEventListener('keypress', this, true);
    }, 0);
  }

  /**
   * Reset the menu bar to its default state.
   */
  private _reset(): void {
    this._deactivate();
    this._closeChildMenu();
    this.activeIndex = -1;
  }

  /**
   * Get the menu item node at the given index.
   *
   * This will return `undefined` if the index is out of range.
   */
  private _itemNodeAt(index: number): HTMLElement {
    var content = this.node.firstChild as HTMLElement;
    return content.children[index] as HTMLElement;
  }

  /**
   * Get the index of the menu item node at a client position.
   *
   * This will return `-1` if the menu item node is not found.
   */
  private _hitTestItemNodes(x: number, y: number): number {
    var nodes = (this.node.firstChild as HTMLElement).children;
    for (var i = 0, n = nodes.length; i < n; ++i) {
      if (hitTest(nodes[i] as HTMLElement, x, y)) return i;
    }
    return -1;
  }

  /**
   * Handle the `closed` signal from the child menu.
   */
  private _onMenuClosed(sender: Menu): void {
    sender.closed.disconnect(this._onMenuClosed, this);
    sender.removeClass(MenuBar.p_MenuBar_menu);
    this._childMenu = null;
    this._reset();
  }

  /**
   * Handle the property changed signal from a menu item.
   */
  private _onItemChanged(sender: MenuItem): void {
    this.update();
  }

  private _active = false;
  private _childMenu: Menu = null;
}


/**
 * Create a menu item from a template.
 */
function createMenuItem(template: IMenuItemTemplate): MenuItem {
  return MenuItem.fromTemplate(template);
}


/**
 * Create the complete DOM node class name for a MenuItem.
 */
function createItemClassName(item: MenuItem): string {
  var parts = [MenuBar.p_MenuBar_item];
  if (item.isSeparatorType) {
    parts.push(MenuBar.p_mod_separator_type);
  }
  if (item.disabled) {
    parts.push(MenuBar.p_mod_disabled);
  }
  if (item.hidden) {
    parts.push(MenuBar.p_mod_hidden);
  }
  if (item.className) {
    parts.push(item.className);
  }
  return parts.join(' ');
}


/**
 * Create the DOM node for a MenuItem.
 */
function createItemNode(item: MenuItem): HTMLElement {
  var node = document.createElement('div');
  var icon = document.createElement('span');
  var text = document.createElement('span');
  node.className = createItemClassName(item);
  icon.className = MenuBar.p_MenuBar_item_icon;
  text.className = MenuBar.p_MenuBar_item_text;
  if (!item.isSeparatorType) {
    text.textContent = item.text.replace(/&/g, '');
  }
  node.appendChild(icon);
  node.appendChild(text);
  return node;
}


/**
 * Test whether a menu's active item has a submenu.
 */
function activeHasMenu(menu: Menu): boolean {
  var item = menu.items[menu.activeIndex];
  return !!(item && item.submenu);
}


/**
 * Hit test the chain menus for the given client position.
 */
function hitTestMenus(menu: Menu, x: number, y: number): boolean {
  while (menu) {
    if (hitTest(menu.node, x, y)) {
      return true;
    }
    menu = menu.childMenu;
  }
  return false;
}
