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
  ItemMessage, MenuBase
} from './menubase';

import {
  MenuItem, MenuItemType
} from './menuitem';


/**
 * `p-Menu`: the class name added to Menu instances.
 */
export
const MENU_CLASS = 'p-Menu';

/**
 * `p-Menu-content`: the class name added to a menu content node.
 */
export
const CONTENT_CLASS = 'p-Menu-content';

/**
 * `p-Menu-item`: the class name assigned to a menu item.
 */
export
const MENU_ITEM_CLASS = 'p-Menu-item';

/**
 * `p-Menu-item-icon`: the class name added to a menu item icon cell.
 */
export
const ICON_CLASS = 'p-Menu-item-icon';

/**
 * `p-Menu-item-text`: the class name added to a menu item text cell.
 */
export
const TEXT_CLASS = 'p-Menu-item-text';

/**
 * `p-Menu-item-shortcut`: the class name added to a menu item shortcut cell.
 */
export
const SHORTCUT_CLASS = 'p-Menu-item-shortcut';

/**
 * `p-Menu-item-submenu-icon`: the class name added to a menu item submenu icon cell.
 */
export
const SUBMENU_ICON_CLASS = 'p-Menu-item-submenu-icon';

/**
 * `p-mod`: the class name added to a check type menu item.
 */
export
const CHECK_TYPE_CLASS = 'p-mod-check-type';

/**
 * `p-mod`: the class name added to a separator type menu item.
 */
export
const SEPARATOR_TYPE_CLASS = 'p-mod-separator-type';

/**
 * `p-mod`: the class name added to active menu items.
 */
export
const ACTIVE_CLASS = 'p-mod-active';

/**
 * `p-mod`: the class name added to a disabled menu item.
 */
export
const DISABLED_CLASS = 'p-mod-disabled';

/**
 * `p-mod`: the class name added to a hidden menu item.
 */
export
const HIDDEN_CLASS = 'p-mod-hidden';

/**
 * `p-mod`: the class name added to a force hidden menu item.
 */
export
const FORCE_HIDDEN_CLASS = 'p-mod-force-hidden';

/**
 * `p-mod`: the class name added to a checked menu item.
 */
export
const CHECKED_CLASS = 'p-mod-checked';

/**
 * `p-mod`: the class name added to a menu item with a submenu.
 */
export
const HAS_SUBMENU_CLASS = 'p-mod-has-submenu';

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
   * Create the DOM node for a menu.
   */
  static createNode(): HTMLElement {
    var node = document.createElement('div');
    var content = document.createElement('div');
    content.className = CONTENT_CLASS;
    node.appendChild(content);
    return node;
  }

  /**
   * A signal emitted when the menu is closed.
   *
   * **See also:** [[closed]]
   */
  static closedSignal = new Signal<Menu, void>();

  /**
   * A signal emitted when a command menu item is triggered.
   *
   * When a menu item with a `command` id is triggered, this signal
   * will be emitted in lieu of invoking the item's handler function.
   *
   * The signal arg is the command id of the menu item.
   *
   * #### Notes
   * If the menu is part of a menu hierarchy, the root menu will emit
   * the signal for all menu items contained within the hierarchy.
   *
   * **See also:** [[commandRequested]]
   */
  static commandRequestedSignal = new Signal<Menu, string>();

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
   * A signal emitted when a command menu item is triggered.
   *
   * #### Notes
   * This is a pure delegate to the [[commandRequestedSignal]].
   */
  get commandRequested(): ISignal<Menu, string> {
    return Menu.commandRequestedSignal.bind(this);
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
    var menu = this;
    while (menu._parentMenu) {
      menu = menu._parentMenu;
    }
    return menu;
  }

  /**
   * Find the leaf menu of this menu hierarchy.
   */
  get leafMenu(): Menu {
    var menu = this;
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
   * A method invoked when the active index changes.
   */
  protected onActiveIndexChanged(old: number, index: number): void {
    var oldNode = this._itemNodeAt(old);
    var newNode = this._itemNodeAt(index);
    if (oldNode) oldNode.classList.remove(ACTIVE_CLASS);
    if (newNode) newNode.classList.add(ACTIVE_CLASS);
  }

  /**
   * A message handler invoked on an `'item-added'` message.
   */
  protected onItemAdded(msg: ItemMessage): void {
    this.close();
  }

  /**
   * A message handler invoked on an `'item-removed'` message.
   */
  protected onItemRemoved(msg: ItemMessage): void {
    this.close();
  }

  /**
   * A message handler invoked on an `'item-moved'` message.
   */
  protected onItemMoved(msg: ItemMessage): void {
    this.close();
  }

  /**
   * A message handler invoked on an `'item-open-request'` message.
   */
  protected onItemOpenRequest(msg: ItemMessage): void {
    var node = this._itemNodeAt(msg.currentIndex) || this.node;
    this._openChildMenu(msg.item, node, false);
    this._childMenu.activateNextItem();
  }

  /**
   * A message handler invoked on an `'item-trigger-request'` message.
   */
  protected onItemTriggerRequest(msg: ItemMessage): void {
    this.rootMenu.close();  // deferred close
    if (msg.item.command) {
      this.rootMenu.commandRequested.emit(msg.item.command);
    } else if (msg.item.handler) {
      msg.item.handler.call(void 0, msg.item);
    }
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
    var count = this.itemCount;
    var nodes = new Array<HTMLElement>(count);
    for (var i = 0; i < count; ++i) {
      var node = createItemNode(this.itemAt(i));
      node.addEventListener('mouseenter', this);
      nodes[i] = node;
    }

    // Force hide the leading visible separators.
    for (var k1 = 0; k1 < count; ++k1) {
      var item = this.itemAt(k1);
      if (item.hidden) {
        continue;
      }
      if (item.type !== MenuItemType.Separator) {
        break;
      }
      nodes[k1].classList.add(FORCE_HIDDEN_CLASS);
    }

    // Force hide the trailing visible separators.
    for (var k2 = count - 1; k2 >= 0; --k2) {
      var item = this.itemAt(k2);
      if (item.hidden) {
        continue;
      }
      if (item.type !== MenuItemType.Separator) {
        break;
      }
      nodes[k2].classList.add(FORCE_HIDDEN_CLASS);
    }

    // Force hide the remaining consecutive visible separators.
    var prevWasSep = false;
    while (++k1 < k2) {
      var item = this.itemAt(k1);
      if (item.hidden) {
        continue;
      }
      if (prevWasSep && item.type === MenuItemType.Separator) {
        nodes[k1].classList.add(FORCE_HIDDEN_CLASS);
      } else {
        prevWasSep = item.type === MenuItemType.Separator;
      }
    }

    // Ensure the content node is cleared.
    var content = this.node.firstChild;
    content.textContent = '';

    // Add the new items to the content node.
    for (var i = 0; i < count; ++i) {
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
    var childMenu = this._childMenu;
    if (childMenu) {
      this._childMenu = null;
      this._childItem = null;
      childMenu.close(true);
    }

    // Remove this menu from any parent.
    var parentMenu = this._parentMenu;
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
    var node = event.currentTarget as HTMLElement;
    this.activeIndex = this._itemNodeIndex(node);
    var item = this.itemAt(this.activeIndex);
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
    var child = this._childMenu;
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
    var node = this._itemNodeAt(this.activeIndex);
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
    var menu = this;
    var hit = false;
    var x = event.clientX;
    var y = event.clientY;
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
    var leaf = this.leafMenu;
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
    var menu = this._parentMenu;
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
    this.activeIndex = this.itemIndex(this._childItem);
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
        var menu = item.submenu;
        this._openTimerId = 0;
        this._childItem = item;
        this._childMenu = menu;
        menu._parentMenu = this;
        menu.update(true);
        openSubmenu(menu, node);
      }, OPEN_DELAY);
    } else {
      var menu = item.submenu;
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
    var content = this.node.firstChild as HTMLElement;
    return content.children[index] as HTMLElement;
  }

  /**
   * Get the index of the given menu item node.
   *
   * This will return `-1` if the menu item node is not found.
   */
  private _itemNodeIndex(node: HTMLElement): number {
    var content = this.node.firstChild as HTMLElement;
    return Array.prototype.indexOf.call(content.children, node);
  }

  private _openTimerId = 0;
  private _closeTimerId = 0;
  private _parentMenu: Menu = null;
  private _childMenu: Menu = null;
  private _childItem: MenuItem = null;
}


/**
 * Create the complete DOM node class name for a MenuItem.
 */
function createItemClassName(item: MenuItem): string {
  var type = item.type;
  var parts = [MENU_ITEM_CLASS];
  if (type === MenuItemType.Check) {
    parts.push(CHECK_TYPE_CLASS);
  } else if (type === MenuItemType.Separator) {
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
 * Create the DOM node for a MenuItem.
 */
function createItemNode(item: MenuItem): HTMLElement {
  var node = document.createElement('div');
  var icon = document.createElement('span');
  var text = document.createElement('span');
  var shortcut = document.createElement('span');
  var submenu = document.createElement('span');
  node.className = createItemClassName(item);
  icon.className = ICON_CLASS;
  text.className = TEXT_CLASS;
  shortcut.className = SHORTCUT_CLASS;
  submenu.className = SUBMENU_ICON_CLASS;
  if (item.type !== MenuItemType.Separator) {
    text.textContent = item.text;
    shortcut.textContent = item.shortcut;
  }
  node.appendChild(icon);
  node.appendChild(text);
  node.appendChild(shortcut);
  node.appendChild(submenu);
  return node;
}


/**
 * Test whether a menu item is a visible non-separator item.
 */
function isSelectableItem(item: MenuItem): boolean {
  return !item.hidden && item.type !== MenuItemType.Separator;
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
  var elem = document.documentElement;
  var x = window.pageXOffset;
  var y = window.pageYOffset;
  var width = elem.clientWidth;
  var height = elem.clientHeight;
  return { x: x, y: y, width: width, height: height };
}


/**
 * Mount the menu as hidden and compute its optimal size.
 *
 * If the vertical scrollbar become visible, the menu will be expanded
 * by the scrollbar width to prevent clipping the contents of the menu.
 */
function mountAndMeasure(menu: Menu, maxHeight: number): Size {
  var node = menu.node;
  var style = node.style;
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
  var rect = node.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
}


/**
 * Show the menu at the specified position.
 */
function showMenu(menu: Menu, x: number, y: number): void {
  var style = menu.node.style;
  style.top = Math.max(0, y) + 'px';
  style.left = Math.max(0, x) + 'px';
  style.visibility = '';
}


/**
 * Open the menu as a root menu at the target location.
 */
function openRootMenu(menu: Menu, x: number, y: number, forceX: boolean, forceY: boolean): void {
  var rect = clientViewportRect();
  var size = mountAndMeasure(menu, rect.height - (forceY ? y : 0));
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
  var rect = clientViewportRect();
  var size = mountAndMeasure(menu, rect.height);
  var box = boxSizing(menu.node);
  var itemRect = item.getBoundingClientRect();
  var x = itemRect.right - SUBMENU_OVERLAP;
  var y = itemRect.top - box.borderTop - box.paddingTop;
  if (x + size.width > rect.x + rect.width) {
    x = itemRect.left + SUBMENU_OVERLAP - size.width;
  }
  if (y + size.height > rect.y + rect.height) {
    y = itemRect.bottom + box.borderBottom + box.paddingBottom - size.height;
  }
  showMenu(menu, x, y);
}
