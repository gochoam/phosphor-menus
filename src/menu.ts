/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  boxSizing, hitTest
} from 'phosphor-domutil';

import {
  Message
} from 'phosphor-messaging';

import {
  ISignal, Signal
} from 'phosphor-signaling';

import {
  attachWidget, detachWidget
} from 'phosphor-widget';

import {
  MenuBase
} from './menubase';

import {
  IMenuItemTemplate, MenuItem
} from './menuitem';


/**
 * The delay, in ms, for opening a submenu.
 */
const OPEN_DELAY = 300;

/**
 * The delay, in ms, for closing a submenu.
 */
const CLOSE_DELAY = 300;

/**
 * The horizontal overlap to use for submenus.
 */
const SUBMENU_OVERLAP = 3;


/**
 * A widget which displays menu items as a popup menu.
 *
 * #### Notes
 * A `Menu` widget does not support child widgets. Adding children
 * to a `Menu` will result in undefined behavior.
 */
export
class Menu extends MenuBase {
  /**
   * The class name added to Menu instances.
   */
  static p_Menu = 'p-Menu';

  /**
   * The class name added to a menu content node.
   */
  static p_Menu_content = 'p-Menu-content';

  /**
   * The class name added to a menu item node.
   */
  static p_Menu_item = 'p-Menu-item';

  /**
   * The class name added to a menu item icon cell.
   */
  static p_Menu_item_icon = 'p-Menu-item-icon';

  /**
   * The class name added to a menu item text cell.
   */
  static p_Menu_item_text = 'p-Menu-item-text';

  /**
   * The class name added to a menu item shortcut cell.
   */
  static p_Menu_item_shortcut = 'p-Menu-item-shortcut';

  /**
   * The class name added to a menu item submenu cell.
   */
  static p_Menu_item_submenu = 'p-Menu-item-submenu';

  /**
   * The modifier class name added to a check type menu item.
   */
  static p_mod_check_type = 'p-mod-check-type';

  /**
   * The modifier class name added to a separator type menu item.
   */
  static p_mod_separator_type = 'p-mod-separator-type';

  /**
   * The modifier class name added to active menu items.
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
   * The modifier class name added to a checked menu item.
   */
  static p_mod_checked = 'p-mod-checked';

  /**
   * The modifier class name added to a menu item with a submenu.
   */
  static p_mod_submenu = 'p-mod-submenu';

  /**
   * Create the DOM node for a menu.
   */
  static createNode(): HTMLElement {
    let node = document.createElement('div');
    let content = document.createElement('div');
    content.className = Menu.p_Menu_content;
    node.appendChild(content);
    return node;
  }

  /**
   * A convenience method to create a menu from a template.
   *
   * @param array - The menu item templates for the menu.
   *
   * @returns A new menu created from the menu item templates.
   *
   * #### Notes
   * Submenu templates will be recursively created using the
   * `Menu.fromTemplate` method. If custom menus or menu items
   * are required, use the relevant constructors directly.
   */
  static fromTemplate(array: IMenuItemTemplate[]): Menu {
    let menu = new Menu();
    menu.items = array.map(createMenuItem);
    return menu;
  }

  /**
   * A signal emitted when the menu is closed.
   *
   * **See also:** [[closed]]
   */
  static closedSignal = new Signal<Menu, void>();

  /**
   * Construct a new menu.
   */
  constructor() {
    super();
    this.addClass(Menu.p_Menu);
  }

  /**
   * Dispose of the resources held by the menu.
   */
  dispose(): void {
    this.close(true);
    super.dispose();
  }

  /**
   * A signal emitted when the menu item is closed.
   *
   * #### Notes
   * This is a pure delegate to the [[closedSignal]].
   */
  get closed(): ISignal<Menu, void> {
    return Menu.closedSignal.bind(this);
  }

  /**
   * Get the parent menu of the menu.
   *
   * #### Notes
   * This will be null if the menu is not an open submenu.
   */
  get parentMenu(): Menu {
    return this._parentMenu;
  }

  /**
   * Get the child menu of the menu.
   *
   * #### Notes
   * This will be null if the menu does not have an open submenu.
   */
  get childMenu(): Menu {
    return this._childMenu;
  }

  /**
   * Find the root menu of this menu hierarchy.
   */
  get rootMenu(): Menu {
    let menu = this;
    while (menu._parentMenu) {
      menu = menu._parentMenu;
    }
    return menu;
  }

  /**
   * Find the leaf menu of this menu hierarchy.
   */
  get leafMenu(): Menu {
    let menu = this;
    while (menu._childMenu) {
      menu = menu._childMenu;
    }
    return menu;
  }

  /**
   * Popup the menu at the specified location.
   *
   * The menu will be opened at the given location unless it will not
   * fully fit on the screen. If it will not fit, it will be adjusted
   * to fit naturally on the screen. The last two optional parameters
   * control whether the provided coordinate value must be obeyed.
   *
   * When the menu is opened as a popup menu, it will handle all key
   * events related to menu navigation as well as closing the menu
   * when the mouse is pressed outside of the menu hierarchy. To
   * prevent these actions, use the 'open' method instead.
   *
   * @param x - The client X coordinate of the popup location.
   *
   * @param y - The client Y coordinate of the popup location.
   *
   * @param forceX - Whether the X coordinate must be obeyed.
   *
   * @param forceY - Whether the Y coordinate must be obeyed.
   *
   * **See also:** [[open]]
   */
  popup(x: number, y: number, forceX = false, forceY = false): void {
    if (!this.isAttached) {
      this.update(true);
      document.addEventListener('keydown', this, true);
      document.addEventListener('keypress', this, true);
      document.addEventListener('mousedown', this, true);
      openRootMenu(this, x, y, forceX, forceY);
    }
  }

  /**
   * Open the menu at the specified location.
   *
   * The menu will be opened at the given location unless it will not
   * fully fit on the screen. If it will not fit, it will be adjusted
   * to fit naturally on the screen. The last two optional parameters
   * control whether the provided coordinate value must be obeyed.
   *
   * When the menu is opened with this method, it will not handle key
   * events for navigation, nor will it close itself when the mouse is
   * pressed outside the menu hierarchy. This is useful when using the
   * menu from a menubar, where this menubar should handle these tasks.
   * Use the `popup` method for the alternative behavior.
   *
   * @param x - The client X coordinate of the popup location.
   *
   * @param y - The client Y coordinate of the popup location.
   *
   * @param forceX - Whether the X coordinate must be obeyed.
   *
   * @param forceY - Whether the Y coordinate must be obeyed.
   *
   * **See also:** [[popup]]
   */
  open(x: number, y: number, forceX = false, forceY = false): void {
    if (!this.isAttached) {
      this.update(true);
      openRootMenu(this, x, y, forceX, forceY);
    }
  }

  /**
   * Handle the DOM events for the menu.
   *
   * @param event - The DOM event sent to the menu.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the menu's DOM nodes. It should
   * not be called directly by user code.
   */
  handleEvent(event: Event): void {
    switch (event.type) {
    case 'mouseenter':
      this._evtMouseEnter(event as MouseEvent);
      break;
    case 'mouseleave':
      this._evtMouseLeave(event as MouseEvent);
      break;
    case 'mousedown':
      this._evtMouseDown(event as MouseEvent);
      break;
    case 'mouseup':
      this._evtMouseUp(event as MouseEvent);
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
    this.close(true);
  }

  /**
   * A method invoked when the active index changes.
   */
  protected onActiveIndexChanged(old: number, index: number): void {
    let oldNode = this._itemNodeAt(old);
    let newNode = this._itemNodeAt(index);
    if (oldNode) oldNode.classList.remove(Menu.p_mod_active);
    if (newNode) newNode.classList.add(Menu.p_mod_active);
  }

  /**
   * A method invoked when a menu item should be opened.
   */
  protected onOpenItem(index: number, item: MenuItem): void {
    let node = this._itemNodeAt(index) || this.node;
    this._openChildMenu(item, node, false);
    this._childMenu.activateNextItem();
  }

  /**
   * A method invoked when a menu item should be triggered.
   */
  protected onTriggerItem(index: number, item: MenuItem): void {
    this.rootMenu.close();
    let handler = item.handler;
    if (handler) handler(item);
  }

  /**
   * A message handler invoked on an `'after-attach'` message.
   */
  protected onAfterAttach(msg: Message): void {
    this.node.addEventListener('mouseup', this);
    this.node.addEventListener('mouseleave', this);
    this.node.addEventListener('contextmenu', this);
  }

  /**
   * A message handler invoked on a `'before-detach'` message.
   */
  protected onBeforeDetach(msg: Message): void {
    this.node.removeEventListener('mouseup', this);
    this.node.removeEventListener('mouseleave', this);
    this.node.removeEventListener('contextmenu', this);
    document.removeEventListener('keydown', this, true);
    document.removeEventListener('keypress', this, true);
    document.removeEventListener('mousedown', this, true);
  }

  /**
   * A handler invoked on an `'update-request'` message.
   */
  protected onUpdateRequest(msg: Message): void {
    // Create the nodes for the menu.
    let items = this.items;
    let count = items.length;
    let nodes = new Array<HTMLElement>(count);
    for (let i = 0; i < count; ++i) {
      let node = createItemNode(items[i]);
      node.addEventListener('mouseenter', this);
      nodes[i] = node;
    }

    // Force hide the leading visible separators.
    let k1: number;
    for (k1 = 0; k1 < count; ++k1) {
      if (items[k1].hidden) {
        continue;
      }
      if (!items[k1].isSeparatorType) {
        break;
      }
      nodes[k1].classList.add(Menu.p_mod_force_hidden);
    }

    // Force hide the trailing visible separators.
    let k2: number;
    for (k2 = count - 1; k2 >= 0; --k2) {
      if (items[k2].hidden) {
        continue;
      }
      if (!items[k2].isSeparatorType) {
        break;
      }
      nodes[k2].classList.add(Menu.p_mod_force_hidden);
    }

    // Force hide the remaining consecutive visible separators.
    let hide = false;
    while (++k1 < k2) {
      if (items[k1].hidden) {
        continue;
      }
      if (hide && items[k1].isSeparatorType) {
        nodes[k1].classList.add(Menu.p_mod_force_hidden);
      } else {
        hide = items[k1].isSeparatorType;
      }
    }

    // Fetch the content node.
    let content = this.node.firstChild;

    // Refresh the content node's content.
    content.textContent = '';
    for (let i = 0; i < count; ++i) {
      content.appendChild(nodes[i]);
    }
  }

  /**
   * A message handler invoked on a `'close-request'` message.
   */
  protected onCloseRequest(msg: Message): void {
    // Reset the menu state.
    this._cancelPendingOpen();
    this._cancelPendingClose();
    this.activeIndex = -1;

    // Close any open child menu.
    let childMenu = this._childMenu;
    if (childMenu) {
      this._childMenu = null;
      this._childItem = null;
      childMenu.close(true);
    }

    // Remove this menu from any parent.
    let parentMenu = this._parentMenu;
    if (parentMenu) {
      this._parentMenu = null;
      parentMenu._cancelPendingOpen();
      parentMenu._cancelPendingClose();
      parentMenu._childMenu = null;
      parentMenu._childItem = null;
    }

    // Ensure this menu is detached.
    if (this.parent) {
      this.parent = null;
      this.closed.emit(void 0);
    } else if (this.isAttached) {
      detachWidget(this);
      this.closed.emit(void 0);
    }

    // Clear the content node.
    this.node.firstChild.textContent = '';
  }

  /**
   * Handle the `'mouseenter'` event for the menu.
   *
   * This event listener is attached to the child item nodes.
   */
  private _evtMouseEnter(event: MouseEvent): void {
    this._syncAncestors();
    this._closeChildMenu();
    this._cancelPendingOpen();
    let node = event.currentTarget as HTMLElement;
    this.activeIndex = this._itemNodeIndex(node);
    let item = this.items[this.activeIndex];
    if (item && item.submenu) {
      if (item === this._childItem) {
        this._cancelPendingClose();
      } else {
        this._openChildMenu(item, node, true);
      }
    }
  }

  /**
   * Handle the `'mouseleave'` event for the menu.
   *
   * This event listener is only attached to the menu node.
   */
  private _evtMouseLeave(event: MouseEvent): void {
    this._cancelPendingOpen();
    let child = this._childMenu;
    if (!child || !hitTest(child.node, event.clientX, event.clientY)) {
      this.activeIndex = -1;
      this._closeChildMenu();
    }
  }

  /**
   * Handle the `'mouseup'` event for the menu.
   *
   * This event listener is attached to the menu node.
   */
  private _evtMouseUp(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.button !== 0) {
      return;
    }
    let node = this._itemNodeAt(this.activeIndex);
    if (node && node.contains(event.target as HTMLElement)) {
      this.triggerActiveItem();
    }
  }

  /**
   * Handle the `'contextmenu'` event for the menu bar.
   */
  private _evtContextMenu(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Handle the `'mousedown'` event for the menu.
   *
   * This event listener is attached to the document for a popup menu.
   */
  private _evtMouseDown(event: MouseEvent): void {
    let menu = this;
    let hit = false;
    let x = event.clientX;
    let y = event.clientY;
    while (!hit && menu) {
      hit = hitTest(menu.node, x, y);
      menu = menu._childMenu;
    }
    if (!hit) this.close(true);
  }

  /**
   * Handle the `'keydown'` event for the menu.
   *
   * This event listener is attached to the document for a popup menu.
   */
  private _evtKeyDown(event: KeyboardEvent): void {
    event.stopPropagation();
    let leaf = this.leafMenu;
    switch (event.keyCode) {
    case 13:  // Enter
      event.preventDefault();
      leaf.triggerActiveItem();
      break;
    case 27:  // Escape
      event.preventDefault();
      leaf.close(true);
      break;
    case 37:  // Left Arrow
      event.preventDefault();
      if (leaf !== this) leaf.close(true);
      break;
    case 38:  // Up Arrow
      event.preventDefault();
      leaf.activatePreviousItem();
      break;
    case 39:  // Right Arrow
      event.preventDefault();
      leaf.openActiveItem();
      break;
    case 40:  // Down Arrow
      event.preventDefault();
      leaf.activateNextItem();
      break;
    }
  }

  /**
   * Handle the `'keypress'` event for the menu.
   *
   * This event listener is attached to the document for a popup menu.
   */
  private _evtKeyPress(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.leafMenu.activateMnemonicItem(String.fromCharCode(event.charCode));
  }

  /**
   * Synchronize the active item hierarchy starting with the parent.
   *
   * This ensures that the proper child items are activated for the
   * ancestor menu hierarchy and that any pending open or close
   * tasks are cleared.
   */
  private _syncAncestors(): void {
    let menu = this._parentMenu;
    while (menu) {
      menu._syncChildItem();
      menu = menu._parentMenu;
    }
  }

  /**
   * Synchronize the active index with the current child item.
   */
  private _syncChildItem(): void {
    this._cancelPendingOpen();
    this._cancelPendingClose();
    this.activeIndex = this.items.indexOf(this._childItem);
  }

  /**
   * Open the menu item's submenu using the node for location.
   *
   * If the given item is already open, this is a no-op.
   *
   * Any pending open operation will be cancelled before opening
   * the menu or queueing the delayed task to open the menu.
   */
  private _openChildMenu(item: MenuItem, node: HTMLElement, delayed: boolean): void {
    if (item === this._childItem) {
      return;
    }
    this._cancelPendingOpen();
    if (delayed) {
      this._openTimerId = setTimeout(() => {
        let menu = item.submenu;
        this._openTimerId = 0;
        this._childItem = item;
        this._childMenu = menu;
        menu._parentMenu = this;
        menu.update(true);
        openSubmenu(menu, node);
      }, OPEN_DELAY);
    } else {
      let menu = item.submenu;
      this._childItem = item;
      this._childMenu = menu;
      menu._parentMenu = this;
      menu.update(true);
      openSubmenu(menu, node);
    }
  }

  /**
   * Close the currently open child menu using a delayed task.
   *
   * If a task is pending or if there is no child menu, this is a no-op.
   */
  private _closeChildMenu(): void {
    if (this._closeTimerId || !this._childMenu) {
      return;
    }
    this._closeTimerId = setTimeout(() => {
      this._closeTimerId = 0;
      if (this._childMenu) {
        this._childMenu.close(true);
        this._childMenu = null;
        this._childItem = null;
      }
    }, CLOSE_DELAY);
  }

  /**
   * Cancel any pending child menu open task.
   */
  private _cancelPendingOpen(): void {
    if (this._openTimerId) {
      clearTimeout(this._openTimerId);
      this._openTimerId = 0;
    }
  }

  /**
   * Cancel any pending child menu close task.
   */
  private _cancelPendingClose(): void {
    if (this._closeTimerId) {
      clearTimeout(this._closeTimerId);
      this._closeTimerId = 0;
    }
  }

  /**
   * Get the menu item node at the given index.
   *
   * This will return `undefined` if the index is out of range.
   */
  private _itemNodeAt(index: number): HTMLElement {
    let content = this.node.firstChild as HTMLElement;
    return content.children[index] as HTMLElement;
  }

  /**
   * Get the index of the given menu item node.
   *
   * This will return `-1` if the menu item node is not found.
   */
  private _itemNodeIndex(node: HTMLElement): number {
    let content = this.node.firstChild as HTMLElement;
    return Array.prototype.indexOf.call(content.children, node);
  }

  private _openTimerId = 0;
  private _closeTimerId = 0;
  private _parentMenu: Menu = null;
  private _childMenu: Menu = null;
  private _childItem: MenuItem = null;
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
  let parts = [Menu.p_Menu_item];
  if (item.isCheckType) {
    parts.push(Menu.p_mod_check_type);
  } else if (item.isSeparatorType) {
    parts.push(Menu.p_mod_separator_type);
  }
  if (item.checked) {
    parts.push(Menu.p_mod_checked);
  }
  if (item.disabled) {
    parts.push(Menu.p_mod_disabled);
  }
  if (item.hidden) {
    parts.push(Menu.p_mod_hidden);
  }
  if (item.submenu) {
    parts.push(Menu.p_mod_submenu);
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
  let node = document.createElement('div');
  let icon = document.createElement('span');
  let text = document.createElement('span');
  let shortcut = document.createElement('span');
  let submenu = document.createElement('span');
  node.className = createItemClassName(item);
  icon.className = Menu.p_Menu_item_icon;
  text.className = Menu.p_Menu_item_text;
  shortcut.className = Menu.p_Menu_item_shortcut;
  submenu.className = Menu.p_Menu_item_submenu;
  if (!item.isSeparatorType) {
    text.textContent = item.text.replace(/&/g, '');
    shortcut.textContent = item.shortcut;
  }
  node.appendChild(icon);
  node.appendChild(text);
  node.appendChild(shortcut);
  node.appendChild(submenu);
  return node;
}


/**
 * A type alias for a simple rect.
 */
type Rect = { x: number, y: number, width: number, height: number };


/**
 * A type alias for a simple size.
 */
type Size = { width: number, height: number };


/**
 * Get the currently visible viewport rect in page coordinates.
 */
function clientViewportRect(): Rect {
  let elem = document.documentElement;
  let x = window.pageXOffset;
  let y = window.pageYOffset;
  let width = elem.clientWidth;
  let height = elem.clientHeight;
  return { x: x, y: y, width: width, height: height };
}


/**
 * Mount the menu as hidden and compute its optimal size.
 *
 * If the vertical scrollbar become visible, the menu will be expanded
 * by the scrollbar width to prevent clipping the contents of the menu.
 */
function mountAndMeasure(menu: Menu, maxHeight: number): Size {
  let node = menu.node;
  let style = node.style;
  style.top = '';
  style.left = '';
  style.width = '';
  style.height = '';
  style.visibility = 'hidden';
  style.maxHeight = maxHeight + 'px';
  attachWidget(menu, document.body);
  if (node.scrollHeight > maxHeight) {
    style.width = 2 * node.offsetWidth - node.clientWidth + 'px';
  }
  let rect = node.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
}


/**
 * Show the menu at the specified position.
 */
function showMenu(menu: Menu, x: number, y: number): void {
  let style = menu.node.style;
  style.top = Math.max(0, y) + 'px';
  style.left = Math.max(0, x) + 'px';
  style.visibility = '';
}


/**
 * Open the menu as a root menu at the target location.
 */
function openRootMenu(menu: Menu, x: number, y: number, forceX: boolean, forceY: boolean): void {
  let rect = clientViewportRect();
  let size = mountAndMeasure(menu, rect.height - (forceY ? y : 0));
  if (!forceX && (x + size.width > rect.x + rect.width)) {
    x = rect.x + rect.width - size.width;
  }
  if (!forceY && (y + size.height > rect.y + rect.height)) {
    if (y > rect.y + rect.height) {
      y = rect.y + rect.height - size.height;
    } else {
      y = y - size.height;
    }
  }
  showMenu(menu, x, y);
}


/**
 * Open a the menu as a submenu using the item node for positioning.
 */
function openSubmenu(menu: Menu, item: HTMLElement): void {
  let rect = clientViewportRect();
  let size = mountAndMeasure(menu, rect.height);
  let box = boxSizing(menu.node);
  let itemRect = item.getBoundingClientRect();
  let x = itemRect.right - SUBMENU_OVERLAP;
  let y = itemRect.top - box.borderTop - box.paddingTop;
  if (x + size.width > rect.x + rect.width) {
    x = itemRect.left + SUBMENU_OVERLAP - size.width;
  }
  if (y + size.height > rect.y + rect.height) {
    y = itemRect.bottom + box.borderBottom + box.paddingBottom - size.height;
  }
  showMenu(menu, x, y);
}
