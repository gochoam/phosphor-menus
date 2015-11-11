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
  IDisposable
} from 'phosphor-disposable';

import {
  hitTest
} from 'phosphor-domutil';

import {
  Message
} from 'phosphor-messaging';

import {
  NodeWrapper
} from 'phosphor-nodewrapper';

import {
  IChangedArgs
} from 'phosphor-properties';

import {
  clearSignalData
} from 'phosphor-signaling';

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
 * The class name added to a menu bar widget.
 */
const MENU_BAR_CLASS = 'p-MenuBar';

/**
 * The class name added to a menu bar content node.
 */
const CONTENT_CLASS = 'p-MenuBar-content';

/**
 * The class name added to an open menu bar menu.
 */
const MENU_CLASS = 'p-MenuBar-menu';

/**
 * The class name added to a menu bar item node.
 */
const ITEM_CLASS = 'p-MenuBarItem';

/**
 * The class name added to a menu bar item icon cell.
 */
const ICON_CLASS = 'p-MenuBarItem-icon';

/**
 * The class name added to a menu bar item text cell.
 */
const TEXT_CLASS = 'p-MenuBarItem-text';

/**
 * The class name added to a separator menu bar item.
 */
const SEPARATOR_CLASS = 'p-mod-separator';

/**
 * The class name added to an active menu bar and item.
 */
const ACTIVE_CLASS = 'p-mod-active';

/**
 * The class name added to a disabled menu bar item.
 */
const DISABLED_CLASS = 'p-mod-disabled';

/**
 * The class name added to a hidden menu bar item.
 */
const HIDDEN_CLASS = 'p-mod-hidden';

/**
 * The class name added to collapsed separator items.
 */
const COLLAPSED_CLASS = 'p-mod-collapsed';


/**
 * A widget which displays menu items as a menu bar.
 */
export
class MenuBar extends MenuBase {
  /**
   * Create the DOM node for a menu bar.
   */
  static createNode(): HTMLElement {
    let node = document.createElement('div');
    let content = document.createElement('ul');
    content.className = CONTENT_CLASS;
    node.appendChild(content);
    return node;
  }

  /**
   * A convenience method to create a menu bar from a template.
   *
   * @param array - The menu item templates for the menu bar.
   *
   * @returns A new menu bar created from the menu item templates.
   */
  static fromTemplate(array: IMenuItemTemplate[]): MenuBar {
    let items = array.map(tmpl => MenuItem.fromTemplate(tmpl));
    let bar = new MenuBar();
    bar.items = items;
    return bar;
  }

  /**
   * Construct a new menu bar.
   */
  constructor() {
    super();
    this.addClass(MENU_BAR_CLASS);
    this._collapseCB = () => { collapseSeparators(this._views); };
  }

  /**
   * Dispose of the resources held by the menu bar.
   */
  dispose(): void {
    this._reset();
    this._views.forEach(view => { view.dispose(); });
    this._views.length = 0;
    this._collapseCB = null;
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
   * Get the menu bar content node.
   *
   * #### Notes
   * This is the node which holds the menu item nodes. Modifying the
   * content of this node without care can lead to undesired behavior.
   */
  get contentNode(): HTMLElement {
    return this.node.getElementsByClassName(CONTENT_CLASS)[0] as HTMLElement;
  }

  /**
   * Handle the DOM events for the menu bar.
   *
   * @param event - The DOM event sent to the menu bar.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the menu bar's DOM nodes. It
   * should not be called directly by user code.
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
    // Reset the menu bar before updating the item views.
    this._reset();

    // Create a temporary copy of the current item views.
    let prev = this._views.slice();

    // Clear the current array of item views.
    this._views.length = 0;

    // Create the new item views, reusing a view when possible.
    for (let i = 0, n = items.length; i < n; ++i) {
      let view: ItemView;
      let j = findViewIndex(prev, items[i]);
      if (j !== -1) {
        view = arrays.removeAt(prev, j);
      } else {
        view = new ItemView(items[i], this._collapseCB);
      }
      this._views.push(view);
    }

    // Collapse the neighboring separators.
    collapseSeparators(this._views);

    // Dispose of the old item views.
    prev.forEach(view => { view.dispose(); });

    // Clear the current DOM content.
    let content = this.contentNode;
    content.textContent = '';

    // Add the item view nodes to a fragment.
    let fragment = document.createDocumentFragment();
    for (let i = 0, n = this._views.length; i < n; ++i) {
      fragment.appendChild(this._views[i].node);
    }

    // Update the current DOM content.
    content.appendChild(fragment);
  }

  /**
   * A method invoked when the active index changes.
   */
  protected onActiveIndexChanged(old: number, index: number): void {
    let oldView = this._views[old];
    let newView = this._views[index];
    if (oldView) oldView.removeClass(ACTIVE_CLASS);
    if (newView) newView.addClass(ACTIVE_CLASS);
  }

  /**
   * A method invoked when a menu item should be opened.
   */
  protected onOpenItem(index: number, item: MenuItem): void {
    if (this.isAttached) {
      let ref = (this._views[index] || this).node;
      this._activate();
      this._closeChildMenu();
      this._openChildMenu(item.submenu, ref);
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
   * Handle the `'mousedown'` event for the menu bar.
   */
  private _evtMouseDown(event: MouseEvent): void {
    let x = event.clientX;
    let y = event.clientY;

    // If the bar is active and the mouse press is on an open menu,
    // let that menu handle the press. The bar will reset when the
    // menu emits its `closed` signal.
    if (this._active && hitTestMenus(this._childMenu, x, y)) {
      return;
    }

    // Check if the mouse was pressed on one of the menu items.
    let i = hitTestViews(this._views, x, y);

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
    let x = event.clientX;
    let y = event.clientY;

    // Check if the mouse is over one of the menu items.
    let i = hitTestViews(this._views, x, y);

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
    let menu = this._childMenu;
    let leaf = menu && menu.leafMenu;
    switch (event.keyCode) {
    case 13:  // Enter
      event.preventDefault();
      if (leaf) leaf.triggerActiveItem();
      break;
    case 27:  // Escape
      event.preventDefault();
      if (leaf) leaf.close();
      break;
    case 37:  // Left Arrow
      event.preventDefault();
      if (leaf && leaf !== menu) {
        leaf.close();
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
    let menu = this._childMenu;
    let leaf = menu && menu.leafMenu;
    let key = String.fromCharCode(event.charCode);
    (leaf || this).activateMnemonicItem(key);
  }

  /**
   * Open the child menu using the given item node for location.
   */
  private _openChildMenu(menu: Menu, node: HTMLElement): void {
    let rect = node.getBoundingClientRect();
    this._childMenu = menu;
    menu.addClass(MENU_CLASS);
    menu.open(rect.left, rect.bottom, false, true);
    menu.closed.connect(this._onMenuClosed, this);
  }

  /**
   * Close the current child menu, if one exists.
   */
  private _closeChildMenu(): void {
    let menu = this._childMenu;
    if (menu) {
      this._childMenu = null;
      menu.closed.disconnect(this._onMenuClosed, this);
      menu.removeClass(MENU_CLASS);
      menu.close();
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
    this.addClass(ACTIVE_CLASS);
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
    this.removeClass(ACTIVE_CLASS);
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
   * Handle the `closed` signal from the child menu.
   */
  private _onMenuClosed(sender: Menu): void {
    sender.closed.disconnect(this._onMenuClosed, this);
    sender.removeClass(MENU_CLASS);
    this._childMenu = null;
    this._reset();
  }

  private _active = false;
  private _childMenu: Menu = null;
  private _views: ItemView[] = [];
  private _collapseCB: () => void;
}


/**
 * An object which manages a menu item node for a menu bar.
 */
class ItemView extends NodeWrapper implements IDisposable {
  /**
   * Create the DOM node for an item view.
   */
  static createNode(): HTMLElement {
    let node = document.createElement('li');
    let icon = document.createElement('span');
    let text = document.createElement('span');
    text.className = TEXT_CLASS;
    node.appendChild(icon);
    node.appendChild(text);
    return node;
  }

  /**
   * Create the primary node class name for a MenuItem.
   */
  static createNodeClass(item: MenuItem): string {
    let parts = [ITEM_CLASS];
    if (item.isSeparatorType) {
      parts.push(SEPARATOR_CLASS);
    }
    if (item.disabled) {
      parts.push(DISABLED_CLASS);
    }
    if (item.hidden) {
      parts.push(HIDDEN_CLASS);
    }
    if (item.className) {
      parts.push(item.className);
    }
    return parts.join(' ');
  }

  /**
   * Create the icon node class name for a MenuItem.
   */
  static createIconClass(item: MenuItem): string {
    return item.icon ? (ICON_CLASS + ' ' + item.icon) : ICON_CLASS;
  }

  /**
   * Create the text node content for a MenuItem.
   */
  static createTextContent(item: MenuItem): string {
    return item.isSeparatorType ? '' : item.text.replace(/&/g, '');
  }

  /**
   * Construct a new item view.
   *
   * @param item - The menu item to associate with the view.
   *
   * @param collapseCB - A callback to collapse separator siblings.
   */
  constructor(item: MenuItem, collapseCB: () => void) {
    super();
    this._item = item;
    this._collapseCB = collapseCB;
    this._updateNodeState();
    item.changed.connect(this._onItemChanged, this);
  }

  /**
   * Dispose of the resources held by the view.
   */
  dispose(): void {
    this._item = null;
    this._collapseCB = null;
    clearSignalData(this);
  }

  /**
   * Test whether the view is disposed.
   */
  get isDisposed(): boolean {
    return this._item === null;
  }

  /**
   * Get the menu item associated with the item view.
   *
   * #### Notes
   * This is a read-only property.
   */
  get item(): MenuItem {
    return this._item;
  }

  /**
   * The handler for the menu item `changed` signal.
   */
  private _onItemChanged(sender: MenuItem, args: IChangedArgs<any>): void {
    this._updateNodeState();
    this._collapseCB.call(void 0);
  }

  /**
   * Synchronize the state of the node with the menu item.
   */
  private _updateNodeState(): void {
    let node = this.node;
    let icon = node.firstChild as HTMLElement;
    let text = node.lastChild as HTMLElement;
    node.className = ItemView.createNodeClass(this._item);
    icon.className = ItemView.createIconClass(this._item);
    text.textContent = ItemView.createTextContent(this._item);
  }

  private _item: MenuItem;
  private _collapseCB: () => void;
}


/**
 * Test whether a menu's active item has a submenu.
 */
function activeHasMenu(menu: Menu): boolean {
  let item = menu.items[menu.activeIndex];
  return !!(item && item.submenu);
}


/**
 * Get the index of the item view node at a client position, or `-1`.
 */
function hitTestViews(views: ItemView[], x: number, y: number): number {
  for (let i = 0, n = views.length; i < n; ++i) {
    if (hitTest(views[i].node, x, y)) return i;
  }
  return -1;
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


/**
 * Find the index of the view which contains the given item, or `-1`.
 */
function findViewIndex(views: ItemView[], item: MenuItem): number {
  for (let i = 0, n = views.length; i < n; ++i) {
    if (views[i].item === item) return i;
  }
  return -1;
}


/**
 * Collapse leading, trailing, and consecutive visible separators.
 */
function collapseSeparators(views: ItemView[]): void {
  // Collapse the leading visible separators.
  let k1: number;
  for (k1 = 0; k1 < views.length; ++k1) {
    let view = views[k1];
    let item = view.item;
    if (item.hidden) {
      view.removeClass(COLLAPSED_CLASS);
      continue;
    }
    if (!item.isSeparatorType) {
      view.removeClass(COLLAPSED_CLASS);
      break;
    }
    view.addClass(COLLAPSED_CLASS);
  }

  // Collapse the trailing visible separators.
  let k2: number;
  for (k2 = views.length - 1; k2 >= 0; --k2) {
    let view = views[k2];
    let item = view.item;
    if (item.hidden) {
      view.removeClass(COLLAPSED_CLASS);
      continue;
    }
    if (!item.isSeparatorType) {
      view.removeClass(COLLAPSED_CLASS);
      break;
    }
    view.addClass(COLLAPSED_CLASS);
  }

  // Collapse the remaining consecutive visible separators.
  let collapse = false;
  while (++k1 < k2) {
    let view = views[k1];
    let item = view.item;
    if (item.hidden) {
      view.removeClass(COLLAPSED_CLASS);
      continue;
    }
    if (collapse && item.isSeparatorType) {
      view.addClass(COLLAPSED_CLASS);
    } else {
      view.removeClass(COLLAPSED_CLASS);
      collapse = item.isSeparatorType;
    }
  }
}
