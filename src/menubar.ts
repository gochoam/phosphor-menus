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
  Title, Widget
} from 'phosphor-widget';

import {
  Menu
} from './menu';


/**
 * The class name added to a menu bar widget.
 */
const MENU_BAR_CLASS = 'p-MenuBar';

/**
 * The class name added to a menu bar content node.
 */
const CONTENT_CLASS = 'p-MenuBar-content';

/**
 * The class name added to a menu bar menu.
 */
const MENU_CLASS = 'p-MenuBar-menu';

/**
 * The class name added to a menu bar item node.
 */
const ITEM_CLASS = 'p-MenuBar-item';

/**
 * The class name added to a menu bar item icon cell.
 */
const ICON_CLASS = 'p-MenuBar-itemIcon';

/**
 * The class name added to a menu bar item text cell.
 */
const TEXT_CLASS = 'p-MenuBar-itemText';

/**
 * The class name added to a disabled menu bar item.
 */
// const DISABLED_CLASS = 'p-mod-disabled';

/**
 * The class name added to an active menu bar and item.
 */
const ACTIVE_CLASS = 'p-mod-active';


/**
 * A widget which displays menus as a menu bar.
 */
export
class MenuBar extends Widget {
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
   * Update an item node to reflect the current state of a title.
   *
   * @param node - A node created by a call to [[createItemNode]].
   *
   * @param title - The title to use for the item state.
   *
   * #### Notes
   * This is called automatically when the item should be updated.
   *
   * If the [[createItemNode]] method is reimplemented, this method
   * should also be reimplemented so that the item state is properly
   * updated.
   */
  static updateItemNode(node: HTMLElement, title: Title): void {
    let icon = node.firstChild as HTMLElement;
    let text = node.lastChild as HTMLElement;
    node.className = MenuBarPrivate.createItemClass(title);
    icon.className = MenuBarPrivate.createIconClass(title);
    text.textContent = MenuBarPrivate.createItemText(title);
  }

  /**
   * Construct a new menu bar.
   *
   * @param menus - The initial menus for the menu bar.
   *
   * #### Notes
   * Subclasses should not pass menus to `super`. A subclass should
   * add its own initial menus after it has been fully initialized.
   */
  constructor(menus?: Menu[]) {
    super();
    this.addClass(MENU_BAR_CLASS);
    if (menus) menus.forEach(menu => { this.addMenu(menu); });
  }

  /**
   * Dispose of the resources held by the menu bar.
   */
  dispose(): void {
    this.active = false;
    this._menus.length = 0;
    this._nodes.length = 0;
    super.dispose();
  }

  /**
   * Get the active state of the menu bar.
   *
   * #### Notes
   * The menu bar must be active in order to set the active index.
   */
  get active(): boolean {
    return this._active;
  }

  /**
   * Set the active state of the menu bar.
   *
   * #### Notes
   * The menu bar must be active in order to set the active index.
   *
   * If the menu bar is deactivated, the active index is set to `-1`.
   */
  set active(value: boolean) {
    if (this._active === value) {
      return;
    }
    if (value) {
      this.addClass(ACTIVE_CLASS);
      this.node.addEventListener('mousemove', this);
      document.addEventListener('mousedown', this, true);
      document.addEventListener('keydown', this, true);
      this._active = true;
    } else {
      this.activeIndex = -1;
      this.removeClass(ACTIVE_CLASS);
      this.node.removeEventListener('mousemove', this);
      document.removeEventListener('mousedown', this, true);
      document.removeEventListener('keydown', this, true);
      this._active = false;
    }
  }

  /**
   * Get the currently active index.
   *
   * #### Notes
   * This will be `-1` if there is no active index.
   */
  get activeIndex(): number {
    return this._activeIndex;
  }

  /**
   * Set the currently active index.
   *
   * #### Notes
   * If the index is out of range, or if the menu bar is not active,
   * the active index will be forced to `-1`.
   */
  set activeIndex(value: number) {
    // Do nothing if the menu is not active.
    if (!this._active) {
      return;
    }

    // Force the index to -1 if it is out of range or if it points
    // to an unselectable menu.
    let newIndex = value | 0;
    if (newIndex < 0 ||
        newIndex >= this._menus.length ||
        !MenuBarPrivate.isSelectable(this._menus[newIndex])) {
      newIndex = -1;
    }

    // Bail if there is not effective index change.
    let oldIndex = this._activeIndex;
    if (oldIndex === newIndex) {
      return;
    }

    // Update the internal index.
    this._activeIndex = newIndex;

    // Fetch the old and new item nodes and menus.
    let oldNode = this._nodes[oldIndex];
    let newNode = this._nodes[newIndex];
    let oldMenu = this._menus[oldIndex];
    let newMenu = this._menus[newIndex];

    // Swap the active class on the item nodes.
    if (oldNode) oldNode.classList.remove(ACTIVE_CLASS);
    if (newNode) newNode.classList.add(ACTIVE_CLASS);

    // Close the old menu.
    if (oldMenu) {
      oldMenu.closed.disconnect(this._onMenuClosed, this);
      oldMenu.close();
    }

    // Open the new menu.
    if (newMenu) {
      let rect = newNode.getBoundingClientRect();
      //newMenu.open(rect.left, rect.bottom, false, true);
      newMenu.closed.connect(this._onMenuClosed, this);
    }
  }

  /**
   * Get the currently active menu.
   *
   * #### Notes
   * This will be `null` if there is no active menu.
   */
  get activeMenu(): Menu {
    return this._menus[this._activeIndex] || null;
  }

  /**
   * Set the currently active menu.
   *
   * #### Notes
   * If the menu is not contained in the menu bar, or if the menu bar
   * is not active, the active menu will be set to `null`.
   */
  set activeMenu(menu: Menu) {
    this.activeIndex = this._menus.indexOf(menu);
  }

  /**
   * Get the menu bar content node.
   *
   * #### Notes
   * This is the node which holds the menu nodes.
   *
   * Modifying this node directly can lead to undefined behavior.
   *
   * This is a read-only property.
   */
  get contentNode(): HTMLElement {
    return this.node.getElementsByClassName(CONTENT_CLASS)[0] as HTMLElement;
  }

  /**
   * Activate the next selectable menu.
   *
   * #### Notes
   * The search starts with the currently active menu, and progresses
   * forward until the next selectable menu is found. The search will
   * wrap around at the end of the menu bar.
   */
  activateNext(): void {
    let menus = this._menus;
    let k = this._activeIndex + 1;
    let i = k >= menus.length ? 0 : k;
    let pred = MenuBarPrivate.isSelectable;
    this.activeIndex = arrays.findIndex(menus, pred, i, true);
  }

  /**
   * Activate the previous selectable menu.
   *
   * #### Notes
   * The search starts with the currently active menu, and progresses
   * backward until the next selectable menu is found. The search will
   * wrap around at the front of the menu bar.
   */
  activatePrevious(): void {
    let menus = this._menus;
    let k = this._activeIndex;
    let i = k <= 0 ? menus.length - 1 : k - 1;
    let pred = MenuBarPrivate.isSelectable;
    this.activeIndex = arrays.rfindIndex(menus, pred, i, true);
  }

  /**
   * Get an array of the current menu bar menus.
   *
   * @returns A new array of the current menu bar menus.
   */
  menus(): Menu[] {
    return this._menus.slice();
  }

  /**
   * Get the number of menus in the menu bar.
   *
   * @returns The number of menus in the menu bar.
   */
  menuCount(): number {
    return this._menus.length;
  }

  /**
   * Get the menu at the specified index.
   *
   * @param index - The index of the menu of interest.
   *
   * @returns The menu at the specified index, or `undefined`.
   */
  menuAt(index: number): Menu {
    return this._menus[index];
  }

  /**
   * Get the index of the specified menu.
   *
   * @param menu - The menu of interest.
   *
   * @returns The index of the specified menu, or `-1`.
   */
  menuIndex(menu: Menu): number {
    return this._menus.indexOf(menu);
  }

  /**
   * Add a menu to the end of the menu bar.
   *
   * @param menu - The menu to add to the menu bar.
   *
   * #### Notes
   * If the menu is already added to the menu bar, it will be moved.
   */
  addMenu(menu: Menu): void {
    this.insertMenu(this.menuCount(), menu);
  }

  /**
   * Insert a menu at the specified index.
   *
   * @param index - The index at which to insert the menu.
   *
   * @param menu - The menu to insert into the menu bar.
   *
   * #### Notes
   * If the menu is already added to the menu bar, it will be moved.
   */
  insertMenu(index: number, menu: Menu): void {
    this.active = false;
    let n = this._menus.length;
    let i = this._menus.indexOf(menu);
    let j = Math.max(0, Math.min(index | 0, n));
    if (i !== -1) {
      if (j === n) j--;
      if (i === j) return;
      arrays.move(this._menus, i, j);
      arrays.move(this._nodes, i, j);
      this.contentNode.insertBefore(this._nodes[j], this._nodes[j + 1]);
    } else {
      let constructor = this.constructor as typeof MenuBar;
      let node = constructor.createItemNode();
      constructor.updateItemNode(node, menu.title);
      arrays.insert(this._menus, j, menu);
      arrays.insert(this._nodes, j, node);
      this.contentNode.insertBefore(node, this._nodes[j + 1]);
      menu.title.changed.connect(this._onTitleChanged, this);
      menu.addClass(MENU_CLASS);
    }
  }

  /**
   * Remove the menu at the specified index.
   *
   * @param index - The index of the menu of interest.
   *
   * #### Notes
   * If the index is out of range, this is a no-op.
   */
  removeMenuAt(index: number): void {
    this.active = false;
    let menu = arrays.removeAt(this._menus, index);
    let node = arrays.removeAt(this._nodes, index);
    if (menu) {
      menu.removeClass(MENU_CLASS);
      menu.title.changed.disconnect(this._onTitleChanged, this);
    }
    if (node) {
      this.contentNode.removeChild(node);
    }
  }

  /**
   * Remove a menu from the menu bar.
   *
   * @param menu - The menu to remove from the menu bar.
   *
   * #### Notes
   * If the menu is not in the menu bar, this is a no-op.
   */
  removeMenu(menu: Menu): void {
    let i = this.menuIndex(menu);
    if (i !== -1) this.removeMenuAt(i);
  }

  /**
   * Remove all menus from the menu bar.
   */
  clearMenus(): void {
    let count: number;
    while (count = this.menuCount()) {
      this.removeMenuAt(count - 1);
    }
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
    case 'keydown':
      this._evtKeyDown(event as KeyboardEvent);
      break;
    case 'contextmenu':
      event.preventDefault();
      event.stopPropagation();
      break;
    }
  }

  /**
   * A message handler invoked on an `'after-attach'` message.
   */
  protected onAfterAttach(msg: Message): void {
    this.node.addEventListener('mousedown', this);
    this.node.addEventListener('contextmenu', this);
  }

  /**
   * A message handler invoked on a `'before-detach'` message.
   */
  protected onBeforeDetach(msg: Message): void {
    this.node.removeEventListener('mousedown', this);
    this.node.removeEventListener('contextmenu', this);
    this.active = false;
  }

  /**
   * A message handler invoked on an `'update-request'` message.
   */
  protected onUpdateRequest(msg: Message): void {
    let nodes = this._nodes;
    let menus = this._menus;
    let constructor = this.constructor as typeof MenuBar;
    for (let i = 0, n = menus.length; i < n; ++i) {
      constructor.updateItemNode(nodes[i], menus[i].title);
    }
    let active = nodes[this._activeIndex];
    if (active) active.classList.add(ACTIVE_CLASS);
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
    if (MenuBarPrivate.hitTestMenus(this.activeMenu, x, y)) {
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

    // If the press was not on an item, deactivate the menu bar.
    if (i === -1) {
      this.active = false;
      return;
    }

    // If the press was not the left mouse button, do nothing further.
    if (event.button !== 0) {
      return;
    }

    // If the bar is active, deactivate it.
    if (this.active) {
      this.active = false;
      return;
    }

    // Otherwise, activate the bar and indicated item.
    this.active = true;
    this.activeIndex = i;
  }

  /**
   * Handle the `'mousemove'` event for the menu bar.
   */
  private _evtMouseMove(event: MouseEvent): void {
    // Hit test the items for the index under the mouse.
    let x = event.clientX;
    let y = event.clientY;
    let i = arrays.findIndex(this._nodes, node => hitTest(node, x, y));

    // Bail if the mouse is not over an item. This allows the leading
    // and trailing menus to be kept open when the mouse is over the
    // empty part of the menu bar.
    if (i === -1) {
      return;
    }

    // Update the active index to the indicated item.
    this.activeIndex = i;
  }

  /**
   * Handle the `'keydown'` event for the menu bar.
   */
  private _evtKeyDown(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
    // let menu = this.activeMenu;
    // let leaf = menu && menu.leafMenu();
    // switch (event.keyCode) {
    // case 13:  // Enter
    //   if (leaf) leaf.triggerActive();
    //   break;
    // case 27:  // Escape
    //   if (leaf) leaf.close();
    //   break;
    // case 37:  // Left Arrow
    //   if (leaf && leaf !== menu) {
    //     leaf.close();
    //   } else {
    //     this.activatePrevious();
    //   }
    //   break;
    // case 38:  // Up Arrow
    //   if (leaf) leaf.activatePrevious();
    //   break;
    // case 39:  // Right Arrow
    //   // TODO - cleanup this if-test
    //   if (leaf && leaf.activeItem && leaf.activeItem.submenu) {
    //     leaf.triggerActive();
    //   } else {
    //     this.activateNext();
    //   }
    //   break;
    // case 40:  // Down Arrow
    //   if (leaf) leaf.activateNext();
    //   break;
    // }
  }

  /**
   * Handle the `changed` signal of a title object.
   */
  private _onTitleChanged(sender: Title): void {
    this.update();
  }

  /**
   * Handle the `closed` signal from the active menu.
   */
  private _onMenuClosed(sender: Menu): void {
    sender.closed.disconnect(this._onMenuClosed, this);
    this.active = false;
  }

  private _active = false;
  private _activeIndex = -1;
  private _menus: Menu[] = [];
  private _nodes: HTMLElement[] = [];
}


/**
 * The namespace for the menu bar private data.
 */
namespace MenuBarPrivate {
  /**
   * Create the class name for a menu bar item.
   */
  export
  function createItemClass(title: Title): string {
    // TODO support disabled state somehow.
    return ITEM_CLASS + (title.className ? ' ' + title.className : '');
  }

  /**
   * Create the class name for a menu bar item icon.
   */
  export
  function createIconClass(title: Title): string {
    return ICON_CLASS + (title.icon ? ' ' + title.icon : '');
  }

  /**
   * Create the text for a menu bar item.
   */
  export
  function createItemText(title: Title): string {
    return title.text;
  }

  /**
   * Test whether a menu is selectable.
   */
  export
  function isSelectable(menu: Menu): boolean {
    // TODO support disabled state somehow.
    return true;
  }

  /**
   * Hit test the chain of menus for the given client position.
   */
  export
  function hitTestMenus(menu: Menu, x: number, y: number): boolean {
    // while (menu) {
    //   if (hitTest(menu.node, x, y)) {
    //     return true;
    //   }
    //   menu = menu.childMenu;
    // }
    return false;
  }
}
