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
  Message, sendMessage
} from 'phosphor-messaging';

import {
  ISignal, Signal
} from 'phosphor-signaling';

import {
  Widget
} from 'phosphor-widget';

import {
  collapseSeparators
} from './helpers';

import {
  MenuBase
} from './menubase';

import {
  IMenuItemTemplate, MenuItem
} from './menuitem';


/**
 * The class name added to Menu instances.
 */
const MENU_CLASS = 'p-Menu';

/**
 * The class name added to a menu content node.
 */
const CONTENT_CLASS = 'p-Menu-content';

/**
 * The class name added to a menu item node.
 */
const ITEM_CLASS = 'p-Menu-item';

/**
 * The class name added to a menu item icon cell.
 */
const ICON_CLASS = 'p-Menu-item-icon';

/**
 * The class name added to a menu item text cell.
 */
const TEXT_CLASS = 'p-Menu-item-text';

/**
 * The class name added to a menu item shortcut cell.
 */
const SHORTCUT_CLASS = 'p-Menu-item-shortcut';

/**
 * The class name added to a menu item submenu cell.
 */
const SUBMENU_CLASS = 'p-Menu-item-submenu';

/**
 * The class name added to a check type menu item.
 */
const CHECK_TYPE_CLASS = 'p-mod-check-type';

/**
 * The class name added to a separator type menu item.
 */
const SEPARATOR_TYPE_CLASS = 'p-mod-separator-type';

/**
 * The class name added to active menu items.
 */
const ACTIVE_CLASS = 'p-mod-active';

/**
 * The class name added to a disabled menu item.
 */
const DISABLED_CLASS = 'p-mod-disabled';

/**
 * The class name added to a hidden menu item.
 */
const HIDDEN_CLASS = 'p-mod-hidden';

/**
 * The class name added to a checked menu item.
 */
const CHECKED_CLASS = 'p-mod-checked';

/**
 * The class name added to a menu item with a submenu.
 */
const HAS_SUBMENU_CLASS = 'p-mod-has-submenu';

/**
 * The ms delay for opening a submenu.
 */
const OPEN_DELAY = 300;

/**
 * The ms delay for closing a submenu.
 */
const CLOSE_DELAY = 300;

/**
 * The horizontal px overlap for open submenus.
 */
const SUBMENU_OVERLAP = 3;


/**
 * A widget which displays menu items as a popup menu.
 */
export
class Menu extends MenuBase {
  /**
   * Create the DOM node for a menu.
   */
  static createNode(): HTMLElement {
    let node = document.createElement('div');
    let content = document.createElement('ul');
    content.className = CONTENT_CLASS;
    node.appendChild(content);
    return node;
  }

  /**
   * A convenience method to create a menu from a template.
   *
   * @param array - The menu item templates for the menu.
   *
   * @returns A new menu created from the menu item templates.
   */
  static fromTemplate(array: IMenuItemTemplate[]): Menu {
    let items = array.map(tmpl => MenuItem.fromTemplate(tmpl));
    let menu = new Menu();
    menu.items = items;
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
    this.addClass(MENU_CLASS);
  }

  /**
   * Dispose of the resources held by the menu.
   */
  dispose(): void {
    sendMessage(this, Widget.MsgCloseRequest);
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
   * Get the menu content node.
   *
   * #### Notes
   * This is the node which holds the menu item nodes. Modifying the
   * content of this node without care can lead to undesired behavior.
   */
  get contentNode(): HTMLElement {
    return this.node.getElementsByClassName(CONTENT_CLASS)[0] as HTMLElement;
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
   * prevent these actions, use the `open` method instead.
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
    sendMessage(this, Widget.MsgCloseRequest);
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
      this._openChildMenu(item, ref, false);
      this._childMenu.activateNextItem();
    }
  }

  /**
   * A method invoked when a menu item should be triggered.
   */
  protected onTriggerItem(index: number, item: MenuItem): void {
    sendMessage(this.rootMenu, Widget.MsgCloseRequest);
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
      node.addEventListener('mouseenter', this);
    }

    // Update the node state to match the menu item.
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
      childMenu._parentMenu = null;
      sendMessage(childMenu, Widget.MsgCloseRequest);
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
      Widget.detach(this);
      this.closed.emit(void 0);
    }
  }

  /**
   * Handle the `'mouseenter'` event for a menu item.
   */
  private _evtMouseEnter(event: MouseEvent): void {
    this._syncAncestors();
    this._closeChildMenu();
    this._cancelPendingOpen();
    let node = event.currentTarget as HTMLElement;
    this.activeIndex = this._nodes.indexOf(node);
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
   */
  private _evtMouseUp(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.button !== 0) {
      return;
    }
    let node = this._nodes[this.activeIndex];
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
    if (!hit) this.close();
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
      leaf.close();
      break;
    case 37:  // Left Arrow
      event.preventDefault();
      if (leaf !== this) leaf.close();
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
    let key = String.fromCharCode(event.charCode);
    this.leafMenu.activateMnemonicItem(key);
  }

  /**
   * Synchronize the active item hierarchy starting with the parent.
   *
   * This ensures that the proper child items are activated for the
   * ancestor menu hierarchy and that any pending open or close tasks
   * are canceled.
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
   * Any pending open operation will be canceled before opening the
   * menu or queuing the delayed task to open the menu.
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
        openSubmenu(menu, node);
      }, OPEN_DELAY);
    } else {
      let menu = item.submenu;
      this._childItem = item;
      this._childMenu = menu;
      menu._parentMenu = this;
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
        this._childMenu.close();
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

  private _openTimerId = 0;
  private _closeTimerId = 0;
  private _parentMenu: Menu = null;
  private _childMenu: Menu = null;
  private _childItem: MenuItem = null;
  private _nodes: HTMLElement[] = [];
}


/**
 * Create an uninitialized DOM node for a MenuItem.
 */
function createItemNode(): HTMLElement {
  let node = document.createElement('li');
  let icon = document.createElement('span');
  let text = document.createElement('span');
  let shortcut = document.createElement('span');
  let submenu = document.createElement('span');
  text.className = TEXT_CLASS;
  shortcut.className = SHORTCUT_CLASS;
  submenu.className = SUBMENU_CLASS;
  node.appendChild(icon);
  node.appendChild(text);
  node.appendChild(shortcut);
  node.appendChild(submenu);
  return node;
}


/**
 * Create the complete DOM node class name for a MenuItem.
 */
function createItemClass(item: MenuItem): string {
  let parts = [ITEM_CLASS];
  if (item.isCheckType) {
    parts.push(CHECK_TYPE_CLASS);
  } else if (item.isSeparatorType) {
    parts.push(SEPARATOR_TYPE_CLASS);
  }
  if (item.checked) {
    parts.push(CHECKED_CLASS);
  }
  if (item.disabled) {
    parts.push(DISABLED_CLASS);
  }
  if (item.hidden) {
    parts.push(HIDDEN_CLASS);
  }
  if (item.submenu) {
    parts.push(HAS_SUBMENU_CLASS);
  }
  if (item.className) {
    parts.push(item.className);
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
  return item.isSeparatorType ? '' : item.text.replace(/&/g, '');
}


/**
 * Create the shortcut text for a MenuItem.
 */
function createShortcutText(item: MenuItem): string {
  return item.isSeparatorType ? '' : item.shortcut;
}


/**
 * Update the node state for a MenuItem.
 */
function updateItemNode(item: MenuItem, node: HTMLElement): void {
  let icon = node.children[0];
  let text = node.children[1];
  let shortcut = node.children[2];
  node.className = createItemClass(item);
  icon.className = createIconClass(item);
  text.textContent = createTextContent(item);
  shortcut.textContent = createShortcutText(item);
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
 * If the vertical scrollbar becomes visible, the menu will be expanded
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
  Widget.attach(menu, document.body);
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
  sendMessage(menu, Widget.MsgUpdateRequest);
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
  sendMessage(menu, Widget.MsgUpdateRequest);
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
