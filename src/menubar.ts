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
  IChangedArgs
} from 'phosphor-properties';

import {
  Menu
} from './menu';

import {
  MenuBase, collapseSeparators
} from './menubase';

import {
  MenuItem, MenuItemType
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
const ITEM_CLASS = 'p-MenuBar-item';

/**
 * The class name added to a menu bar item icon cell.
 */
const ICON_CLASS = 'p-MenuBar-item-icon';

/**
 * The class name added to a menu bar item text cell.
 */
const TEXT_CLASS = 'p-MenuBar-item-text';

/**
 * The class name added to a separator menu bar item.
 */
const SEPARATOR_TYPE_CLASS = 'p-mod-separator-type';

/**
 * The class name added to an active menu bar and item.
 */
const ACTIVE_CLASS = 'p-mod-active';


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
   * Construct a new menu bar.
   */
  constructor() {
    super();
    this.addClass(MENU_BAR_CLASS);
  }

  /**
   * Dispose of the resources held by the menu bar.
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
    // Reset the menu bar before updating the items.
    this._reset();

    // Disconnect the old item signals.
    for (let i = 0, n = old.length; i < n; ++i) {
      if (items.indexOf(old[i]) === -1) {
        old[i].changed.disconnect(this._onItemChanged, this);
      }
    }

    // Connect the new item signals.
    for (let i = 0, n = items.length; i < n; ++i) {
      if (old.indexOf(items[i]) === -1) {
        items[i].changed.connect(this._onItemChanged, this);
      }
    }

    // Schedulte an update of the DOM content.
    this.update();
  }

  /**
   * A method invoked when the active index changes.
   */
  protected onActiveIndexChanged(old: number, index: number): void {
    let oldNode = this._nodes[old];
    let newNode = this._nodes[index];
    if (oldNode) oldNode.classList.remove(ACTIVE_CLASS);
    if (newNode) newNode.classList.add(ACTIVE_CLASS);
  }

  /**
   * A method invoked when a menu item should be opened.
   */
  protected onOpenItem(index: number, item: MenuItem): void {
    if (this.isAttached) {
      let ref = this._nodes[index] || this.node;
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
   * A handler invoked on an `'update-request'` message.
   */
  protected onUpdateRequest(msg: Message): void {
    // Fetch common variables.
    let items = this.items;
    let nodes = this._nodes;
    let index = this.activeIndex;
    let content = this.contentNode;

    // Remove any excess item nodes.
    while (nodes.length > items.length) {
      let node = nodes.pop();
      content.removeChild(node);
    }

    // Add any missing item nodes.
    while (nodes.length < items.length) {
      let node = createItemNode();
      nodes.push(node);
      content.appendChild(node);
    }

    // Update the node state to match the menu items.
    for (let i = 0, n = items.length; i < n; ++i) {
      updateItemNode(items[i], nodes[i]);
      if (i === index) {
        nodes[i].classList.add(ACTIVE_CLASS);
      } else {
        nodes[i].classList.remove(ACTIVE_CLASS);
      }
    }

    // Collapse the neighboring separators.
    collapseSeparators(items, nodes);
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
    let i = hitTestNodes(this._nodes, x, y);

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
    let i = hitTestNodes(this._nodes, x, y);

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
   * Handle the `changed` signal from a menu item.
   */
  private _onItemChanged(sender: MenuItem, args: IChangedArgs<any>): void {
    this.update();
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
  private _nodes: HTMLElement[] = [];
}


/**
 * Create an uninitialized DOM node for a MenuItem.
 */
function createItemNode(): HTMLElement {
  let node = document.createElement('li');
  let icon = document.createElement('span');
  let text = document.createElement('span');
  text.className = TEXT_CLASS;
  node.appendChild(icon);
  node.appendChild(text);
  return node;
}


/**
 * Create the complete DOM node class name for a MenuItem.
 */
function createItemClass(item: MenuItem): string {
  let parts = [ITEM_CLASS];
  if (item.className) {
    parts.push(item.className);
  }
  if (item.type === MenuItemType.Separator) {
    parts.push(SEPARATOR_TYPE_CLASS);
  }
  return parts.join(' ');
}


/**
 * Create the icon node class name for a MenuItem.
 */
function createIconClass(item: MenuItem): string {
  return item.icon ? (ICON_CLASS + ' ' + item.icon) : ICON_CLASS;
}


/**
 * Create the text node content for a MenuItem.
 */
function createTextContent(item: MenuItem): string {
  let sep = item.type === MenuItemType.Separator;
  return sep ? '' : item.text.replace(/&/g, '');
}


/**
 * Update the node state for a MenuItem.
 */
function updateItemNode(item: MenuItem, node: HTMLElement): void {
  let icon = node.firstChild as HTMLElement;
  let text = node.lastChild as HTMLElement;
  node.className = createItemClass(item);
  icon.className = createIconClass(item);
  text.textContent = createTextContent(item);
}


/**
 * Test whether a menu's active item has a submenu.
 */
function activeHasMenu(menu: Menu): boolean {
  let item = menu.items[menu.activeIndex];
  return !!(item && item.submenu);
}


/**
 * Get the index of the node at a client position, or `-1`.
 */
function hitTestNodes(nodes: HTMLElement[], x: number, y: number): number {
  for (let i = 0, n = nodes.length; i < n; ++i) {
    if (hitTest(nodes[i], x, y)) return i;
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
