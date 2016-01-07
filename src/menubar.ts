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
  hitTest
} from 'phosphor-domutil';

import {
  Message
} from 'phosphor-messaging';

import {
  AbstractMenu
} from './base';

import {
  Menu
} from './menu';

import {
  MenuItem
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
 * The class name added to a disabled menu bar item.
 */
const DISABLED_CLASS = 'p-mod-disabled';

/**
 * The class name added to a hidden menu bar item.
 */
const HIDDEN_CLASS = 'p-mod-hidden';


/**
 * A widget which displays menu items as a menu bar.
 */
export
class MenuBar extends AbstractMenu {
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
   * Create a new item node for a menu bar.
   *
   * @returns A new DOM node to use as an item in a menu bar.
   *
   * #### Notes
   * This method may be reimplemented to create custom items.
   */
  static createItemNode(): HTMLElement {
    let node = document.createElement('li');
    let icon = document.createElement('span');
    let text = document.createElement('span');
    node.className = ITEM_CLASS;
    icon.className = ICON_CLASS;
    text.className = TEXT_CLASS;
    node.appendChild(icon);
    node.appendChild(text);
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
    let extra = MenuBarPrivate.extraItemClass(item);
    let sep = item.type === MenuItem.Separator;
    let icon = node.firstChild as HTMLElement;
    let text = node.lastChild as HTMLElement;
    node.className = ITEM_CLASS + (extra ? ' ' + extra : '');
    icon.className = ICON_CLASS + (item.icon ? ' ' + item.icon : '');
    text.textContent = sep ? '' : item.text.replace(/&/g, '');
  }

  /**
   * Construct a new menu bar.
   *
   * @param items - The menu items to initialize the menu bar.
   *
   * #### Notes
   * Subclasses should not pass menu items to `super`. The subclass
   * should set its own items after it has been fully initialized.
   */
  constructor(items?: MenuItem[]) {
    super();
    this.addClass(MENU_BAR_CLASS);
    if (items) this.items = items;
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
   *
   * This is a read-only property.
   */
  get childMenu(): Menu {
    return this._childMenu;
  }

  /**
   * Get the menu bar content node.
   *
   * #### Notes
   * This is the node which holds the menu item nodes.
   *
   * Modifying this node directly can lead to undefined behavior.
   *
   * This is a read-only property.
   */
  get contentNode(): HTMLElement {
    return this.node.getElementsByClassName(CONTENT_CLASS)[0] as HTMLElement;
  }

  /**
   * Open the submenu of the active item, if possible.
   *
   * #### Notes
   * This is a no-op if the menu bar is not visible, if there is no
   * active item, or if the active item does not have a submenu.
   */
  openActiveItem(): void {
    if (!this.isVisible) {
      return;
    }
    let index = this.activeIndex;
    if (index === -1) {
      return;
    }
    let item = this.items[index];
    if (item.submenu === null) {
      return;
    }
    this._activate();
    this._closeChildMenu();
    this._openChildMenu(item.submenu, this._nodes[index]);
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
    case 'keydown':
      this._evtKeyDown(event as KeyboardEvent);
      break;
    case 'keypress':
      this._evtKeyPress(event as KeyboardEvent);
      break;
    case 'contextmenu':
      event.preventDefault();
      event.stopPropagation();
      break;
    }
  }

  /**
   * A method invoked to test whether an item is selectable.
   *
   * @param item - The menu item of interest.
   *
   * @returns `true` if the item is selectable, `false` otherwise.
   */
  protected isSelectable(item: MenuItem): boolean {
    return item.submenu !== null;
  }

  /**
   * A method invoked when the menu items change.
   *
   * @param oldItems - The old menu items.
   *
   * @param newItems - The new menu items.
   */
  protected onItemsChanged(oldItems: MenuItem[], newItems: MenuItem[]): void {
    // Reset the menu bar before updating the items.
    this._reset();

    // Disconnect the old item signals.
    for (let item of oldItems) {
      if (newItems.indexOf(item) === -1) {
        item.changed.disconnect(this._onItemChanged, this);
      }
    }

    // Connect the new item signals.
    for (let item of newItems) {
      if (oldItems.indexOf(item) === -1) {
        item.changed.connect(this._onItemChanged, this);
      }
    }

    // Fetch common variables.
    let nodes = this._nodes;
    let content = this.contentNode;
    let constructor = this.constructor as typeof MenuBar;

    // Remove any excess item nodes.
    while (nodes.length > newItems.length) {
      let node = nodes.pop();
      content.removeChild(node);
    }

    // Add any missing item nodes.
    while (nodes.length < newItems.length) {
      let node = constructor.createItemNode();
      content.appendChild(node);
      nodes.push(node);
    }

    // Schedule an update of the item nodes.
    this.update();
  }

  /**
   * A method invoked when the active index changes.
   *
   * @param oldIndex - The old active index.
   *
   * @param newIndex - The new active index.
   */
  protected onActiveIndexChanged(oldIndex: number, newIndex: number): void {
    let oldNode = this._nodes[oldIndex];
    let newNode = this._nodes[newIndex];
    if (oldNode) oldNode.classList.remove(ACTIVE_CLASS);
    if (newNode) newNode.classList.add(ACTIVE_CLASS);
  }

  /**
   * A handler invoked on an `'update-request'` message.
   */
  protected onUpdateRequest(msg: Message): void {
    // Fetch common variables.
    let items = this.items;
    let nodes = this._nodes;
    let constructor = this.constructor as typeof MenuBar;

    // Update the state of the item nodes.
    for (let i = 0, n = items.length; i < n; ++i) {
      constructor.updateItemNode(nodes[i], items[i]);
    }

    // Restore the active node class.
    let active = nodes[this.activeIndex];
    if (active) active.classList.add(ACTIVE_CLASS);

    // Hide the redundant and useless menu item nodes.
    MenuBarPrivate.hideUselessItems(nodes, items);
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
    this._reset();
  }

  /**
   * Handle the `'mousedown'` event for the menu bar.
   */
  private _evtMouseDown(event: MouseEvent): void {
    // If the bar is active and the mouse press is on an open menu,
    // let that menu handle the press. The bar will reset when the
    // menu emits its `closed` signal.
    let x = event.clientX;
    let y = event.clientY;
    if (this._active && MenuBarPrivate.hitTestMenus(this._childMenu, x, y)) {
      return;
    }

    // Stop the propagation if the click was on the menu bar. This
    // prevents duplicate notification when the document mousedown
    // listener is also installed.
    if (hitTest(this.node, x, y)) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Check if the mouse was pressed on one of the menu items.
    let i = arrays.findIndex(this._nodes, node => hitTest(node, x, y));

    // If the press was not on an item, reset the menu bar.
    if (i === -1) {
      this._deactivate();
      this._closeChildMenu();
      this.activeIndex = -1;
      return;
    }

    // If the press was not the left mouse button, do nothing further.
    if (event.button !== 0) {
      return;
    }

    // If the bar is active, deactivate it and close the child menu.
    if (this._active) {
      this._deactivate();
      this._closeChildMenu();
      this.activeIndex = i;
      return;
    }

    // Otherwise, activate the bar and open the item if possible.
    this._activate();
    this.activeIndex = i;
    this.openActiveItem();
  }

  /**
   * Handle the `'mousemove'` event for the menu bar.
   */
  private _evtMouseMove(event: MouseEvent): void {
    // Check if the mouse is over one of the menu items.
    let x = event.clientX;
    let y = event.clientY;
    let i = arrays.findIndex(this._nodes, node => hitTest(node, x, y));

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
      if (leaf && leaf.activeItem && leaf.activeItem.submenu) {
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
   * Activate the menu bar and install the document listeners.
   */
  private _activate(): void {
    if (this._active) {
      return;
    }
    this._active = true;
    this.addClass(ACTIVE_CLASS);
    document.addEventListener('mousedown', this, true);
    document.addEventListener('keydown', this, true);
    document.addEventListener('keypress', this, true);
  }

  /**
   * Deactivate the menu bar and remove the document listeners.
   */
  private _deactivate(): void {
    if (!this._active) {
      return;
    }
    this._active = false;
    this.removeClass(ACTIVE_CLASS);
    document.removeEventListener('mousedown', this, true);
    document.removeEventListener('keydown', this, true);
    document.removeEventListener('keypress', this, true);
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
    if (!menu) {
      return;
    }
    this._childMenu = null;
    menu.closed.disconnect(this._onMenuClosed, this);
    menu.removeClass(MENU_CLASS);
    menu.close();
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
  private _onItemChanged(): void {
    this._reset()
    this.update();
  }

  /**
   * Handle the `closed` signal from the child menu.
   */
  private _onMenuClosed(sender: Menu): void {
    sender.closed.disconnect(this._onMenuClosed, this);
    sender.removeClass(MENU_CLASS);
    this._deactivate();
    this._childMenu = null;
    this.activeIndex = -1;
  }

  private _active = false;
  private _childMenu: Menu = null;
  private _nodes: HTMLElement[] = [];
}


/**
 * The namespace for the menu bar private data.
 */
namespace MenuBarPrivate {
  /**
   * Create the extra class name for a menu bar item.
   */
  export
  function extraItemClass(item: MenuItem): string {
    let name = item.className;
    if (item.type === MenuItem.Separator) {
      name += ' ' + SEPARATOR_TYPE_CLASS;
    } else if (item.type === MenuItem.Submenu && !item.submenu) {
      name += ' ' + DISABLED_CLASS;
    }
    return name;
  }

  /**
   * Hit test the chain of menus for the given client position.
   */
  export
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
   * Hide the irrelevant item nodes for a menu bar.
   */
  export
  function hideUselessItems(nodes: HTMLElement[], items: MenuItem[]): void {
    // Hide the leading non-submenu items.
    let k1: number;
    for (k1 = 0; k1 < items.length; ++k1) {
      if (items[k1].type === MenuItem.Submenu) {
        break;
      }
      nodes[k1].classList.add(HIDDEN_CLASS);
    }

    // Hide the trailing separator items.
    let k2: number;
    for (k2 = items.length - 1; k2 >= 0; --k2) {
      if (items[k2].type === MenuItem.Submenu) {
        break;
      }
      nodes[k2].classList.add(HIDDEN_CLASS);
    }

    // Hide the consecutive separators and other non-submenu items.
    let hide = false;
    while (++k1 < k2) {
      if (items[k1].type === MenuItem.Submenu) {
        hide = false;
      } else if (items[k1].type !== MenuItem.Separator) {
        nodes[k1].classList.add(HIDDEN_CLASS);
      } else if (hide) {
        nodes[k1].classList.add(HIDDEN_CLASS);
      } else {
        hide = true;
      }
    }
  }
}
