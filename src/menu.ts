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
  boxSizing, hitTest
} from 'phosphor-domutil';

import {
  Message
} from 'phosphor-messaging';

import {
  Property
} from 'phosphor-properties';

import {
  ISignal, Signal
} from 'phosphor-signaling';

import {
  Widget, attachWidget
} from 'phosphor-widget';

import {
  MenuItem
} from './menuitem';

import './index.css';


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
 * A `Menu` widget does not support children, and adding child widgets
 *  to a `Menu` will  result in undefined behavior.
 */
export
class Menu extends Widget {
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
   * The property descriptor for the active item index.
   *
   * The controls which menu item is the active item.
   *
   * **See also:** [[activeIndex]]
   */
  static activeIndexProperty = new Property<Menu, number>({
    value: -1,
    coerce: coerceActiveIndex,
    changed: onActiveIndexChanged,
  });

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
    this._items.length = 0;
    this._nodes.length = 0;
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
   * Find the root menu of this menu.
   */
  get rootMenu(): Menu {
    var menu = this;
    while (menu._parentMenu) {
      menu = menu._parentMenu;
    }
    return menu;
  }

  /**
   * Find the leaf menu of this menu.
   */
  get leafMenu(): Menu {
    var menu = this;
    while (menu._childMenu) {
      menu = menu._childMenu;
    }
    return menu;
  }

  /**
   * Get the index of the active menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[activeIndexProperty]].
   */
  get activeIndex(): number {
    return Menu.activeIndexProperty.get(this);
  }

  /**
   * Set the index of the active menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[activeIndexProperty]].
   */
  set activeIndex(value: number) {
    Menu.activeIndexProperty.set(this, value);
  }

  /**
   * Get a shallow copy of the array of menu items.
   *
   * #### Notes
   * When only iterating over the items, it can be faster to use
   * the item query methods, which do not perform a copy.
   *
   * **See also:** [[itemCount]], [[itemAt]]
   */
  get items(): MenuItem[] {
    return this._items.slice();
  }

  /**
   * Set the menu items for the menu.
   *
   * #### Notes
   * This will clear the current items and add the specified items.
   * Depending on the desired outcome, it can be more efficient to
   * use one of the item manipulation methods.
   *
   * **See also:** [[addItem]], [[insertItem]], [[removeItem]]
   */
  set items(items: MenuItem[]) {
    this.clearItems();
    items.forEach(item => this.addItem(item));
  }

  /**
   * Get the number of menu items in the menu.
   *
   * #### Notes
   * This is a read-only property.
   *
   * **See also:** [[items]], [[itemAt]]
   */
  get itemCount(): number {
    return this._items.length;
  }

  /**
   * Get the menu item at a specific index.
   *
   * @param index - The index of the menu item of interest.
   *
   * @returns The item at the specified index, or `undefined` if the
   *   index is out of range.
   *
   * **See also:** [[itemCount]], [[itemIndex]]
   */
  itemAt(index: number): MenuItem {
    return this._items[index | 0];
  }

  /**
   * Get the index of a specific menu item.
   *
   * @param item - The menu item of interest.
   *
   * @returns The index of the specified item, or -1 if the item is
   *   not contained within the menu.
   *
   * **See also:** [[itemCount]], [[itemAt]]
   */
  itemIndex(item: MenuItem): number {
    return this._items.indexOf(item);
  }

  /**
   * Add a menu item to the end of the menu.
   *
   * @param item - The menu item to add to the menu.
   *
   * @returns The new index of the item.
   *
   * #### Notes
   * If the item is already contained within the menu, it will first
   * be removed.
   *
   * **See also:** [[insertItem]], [[moveItem]]
   */
  addItem(item: MenuItem): number {
    return this.insertItem(this._items.length, item);
  }

  /**
   * Insert a menu item into the menu at the given index.
   *
   * @param index - The index at which to insert the item. This will be
   *   clamped to the bounds of the menu.
   *
   * @param item - The menu item to add to the menu.
   *
   * @returns The new index of the item.
   *
   * #### Notes
   * If the item is already contained within the menu, it will first
   * be removed.
   *
   * **See also:** [[addItem]], [[moveItem]]
   */
  insertItem(index: number, item: MenuItem): number {
    this.close(true);
    this.removeItem(item);
    var node = createItemNode(item);
    arrays.insert(this._items, index, item);
    var i = arrays.insert(this._nodes, index, node);
    this.node.firstChild.insertBefore(node, this._nodes[i + 1]);
    Property.getChanged(item).connect(this._onPropertyChanged, this);
    node.addEventListener('mouseenter', this);
    this._collapseSeparators();
    return i;
  }

  /**
   * Move a menu item from one index to another.
   *
   * @param fromIndex - The index of the item to move.
   *
   * @param toIndex - The target index of the item.
   *
   * @returns `true` if the move was successful, or `false` if either
   *   index is out of range.
   *
   * #### Notes
   * This can be more efficient than re-inserting an existing item.
   *
   * **See also:** [[addItem]], [[insertItem]]
   */
  moveItem(fromIndex: number, toIndex: number): boolean {
    this.close(true);
    var i = fromIndex | 0;
    var j = toIndex | 0;
    if (!arrays.move(this._items, i, j)) {
      return false;
    }
    if (i !== j) {
      arrays.move(this._nodes, i, j);
      this.node.firstChild.insertBefore(this._nodes[j], this._nodes[j + 1]);
      this._collapseSeparators();
    }
    return true;
  }

  /**
   * Remove the menu item at a specific index.
   *
   * @param index - The index of the menu item of interest.
   *
   * @returns The removed item, or `undefined` if the index is out
   *   of range.
   *
   * **See also:** [[removeItem]], [[clearItems]]
   */
  removeItemAt(index: number): MenuItem {
    this.close(true);
    var item = arrays.removeAt(this._items, index);
    if (!item) {
      return void 0;
    }
    var node = arrays.removeAt(this._nodes, index);
    this.node.firstChild.removeChild(node);
    Property.getChanged(item).disconnect(this._onPropertyChanged, this);
    node.removeEventListener('mouseenter', this);
    this._collapseSeparators();
    return item;
  }

  /**
   * Remove a specific menu item from the menu.
   *
   * @param item - The menu item of interest.
   *
   * @returns The index which the item occupied, or `-1` if the
   *   item is not contained by the menu.
   *
   * **See also:** [[removeItemAt]], [[clearItems]]
   */
  removeItem(item: MenuItem): number {
    var i = this._items.indexOf(item);
    if (i !== -1) this.removeItemAt(i);
    return i;
  }

  /**
   * Remove all menu items from the menu.
   *
   * **See also:** [[removeItem]], [[removeItemAt]]
   */
  clearItems(): void {
    while (this._items.length > 0) {
      this.removeItemAt(this._items.length - 1);
    }
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
    if (!this.isAttached) openRootMenu(this, x, y, forceX, forceY);
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
      this._evtMouseEnter(<MouseEvent>event);
      break;
    case 'mouseleave':
      this._evtMouseLeave(<MouseEvent>event);
      break;
    case 'mousedown':
      this._evtMouseDown(<MouseEvent>event);
      break;
    case 'mouseup':
      this._evtMouseUp(<MouseEvent>event);
      break;
    case 'contextmenu':
      this._evtContextMenu(event);
      break;
    case 'keydown':
      this._evtKeyDown(<KeyboardEvent>event);
      break;
    case 'keypress':
      this._evtKeyPress(<KeyboardEvent>event);
      break;
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
   * A message handler invoked on a `'close-request'` message.
   */
  protected onCloseRequest(msg: Message): void {
    super.onCloseRequest(msg);
    this._reset();
    this._removeFromParent();
    this.closed.emit(void 0);
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

    var node = <HTMLElement>event.currentTarget;
    var index = this._nodes.indexOf(node);
    if (index === -1) {
      this.activeIndex = -1;
      return;
    }

    var item = this._items[index];
    if (item.type === MenuItem.Separator) {
      this.activeIndex = -1;
      return;
    }

    this.activeIndex = index;
    if (item.submenu && !item.disabled) {
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
    var x = event.clientX;
    var y = event.clientY;
    var i = arrays.findIndex(this._nodes, node => hitTest(node, x, y));
    if (i === this.activeIndex) {
      this._triggerActiveItem();
    }
  }

  /**
   * Handle the `'contextmenu'` event for the menu.
   *
   * This event listener is attached to the menu node and disables
   * the default browser context menu.
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
      leaf._triggerActiveItem();
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
      leaf._activatePreviousItem();
      break;
    case 39:  // Right Arrow
      event.preventDefault();
      leaf._openActiveItem();
      break;
    case 40:  // Down Arrow
      event.preventDefault();
      leaf._activateNextItem();
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
    var str = String.fromCharCode(event.charCode);
    this.leafMenu._activateMnemonicItem(str);
  }

  /**
   * Activate the next non-separator menu item.
   */
  private _activateNextItem(): void {
    var k = this.activeIndex + 1;
    var start = k >= this._items.length ? 0 : k;
    var i = arrays.findIndex(this._items, isSelectableItem, start, true);
    this.activeIndex = i;
  }

  /**
   * Activate the previous non-separator menu item.
   */
  private _activatePreviousItem(): void {
    var k = this.activeIndex;
    var start = k <= 0 ? this._items.length - 1 : k - 1;
    var i = arrays.rfindIndex(this._items, isSelectableItem, start, true);
    this.activeIndex = i;
  }

  /**
   * Activate the next menu item with the given mnemonic key.
   */
  private _activateMnemonicItem(key: string): void {
    var upperKey = key.toUpperCase();
    var k = this.activeIndex + 1;
    var start = k >= this._items.length ? 0 : k;
    var i = arrays.findIndex(this._items, item => {
      return isKeyableItem(item) && item.mnemonic.toUpperCase() === upperKey;
    }, start, true);
    this.activeIndex = i;
  }

  /**
   * Open the submenu of the active menu item.
   */
  private _openActiveItem(): void {
    var index = this.activeIndex;
    var item = this._items[index];
    if (!item || !item.submenu || item.disabled) {
      return;
    }
    this._openChildMenu(item, this._nodes[index], false);
    this._childMenu._activateNextItem();
  }

  /**
   * Trigger (or open) the active menu item.
   */
  private _triggerActiveItem(): void {
    var index = this.activeIndex;
    var item = this._items[index];
    if (!item || item.disabled) {
      return;
    }
    if (item.submenu) {
      this._openChildMenu(item, this._nodes[index], false);
      this._childMenu._activateNextItem();
    } else {
      this.rootMenu.close(true);
      item.trigger();
    }
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
      menu._cancelPendingOpen();
      menu._cancelPendingClose();
      menu._syncChildItem();
      menu = menu._parentMenu;
    }
  }

  /**
   * Synchronize the active item with the item for the child menu.
   *
   * This ensures that the active item is the child menu item.
   */
  private _syncChildItem(): void {
    var i = this._items.indexOf(this._childItem);
    if (i !== -1) this.activeIndex = i;
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
        openSubmenu(menu, node);
      }, OPEN_DELAY);
    } else {
      var menu = item.submenu;
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
        this._childMenu.close(true);
        this._childMenu = null;
        this._childItem = null;
      }
    }, CLOSE_DELAY);
  }

  /**
   * Reset the state of the menu.
   *
   * This deactivates the current item and closes the child menu.
   */
  private _reset(): void {
    this._cancelPendingOpen();
    this._cancelPendingClose();
    this.activeIndex = -1;
    if (this._childMenu) {
      this._childMenu.close(true);
      this._childMenu = null;
      this._childItem = null;
    }
  }

  /**
   * Remove the menu from its parent menu.
   */
  private _removeFromParent(): void {
    var parent = this._parentMenu;
    if (!parent) {
      return;
    }
    this._parentMenu = null;
    parent._cancelPendingOpen();
    parent._cancelPendingClose();
    parent._childMenu = null;
    parent._childItem = null;
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
   * Collapse neighboring visible separators.
   *
   * This force-hides select separator nodes such that there are never
   * multiple visible separator siblings. It also force-hides all
   * leading and trailing separator nodes.
   */
  private _collapseSeparators(): void {
    var hideSeparator = true;
    var lastSelectable = arrays.rfindIndex(this._items, isSelectableItem);
    for (var i = 0, n = this._items.length; i < n; ++i) {
      var item = this._items[i];
      if (item.type === MenuItem.Separator) {
        if (hideSeparator || i > lastSelectable) {
          this._nodes[i].classList.add(FORCE_HIDDEN_CLASS);
        } else if (!item.hidden) {
          this._nodes[i].classList.remove(FORCE_HIDDEN_CLASS);
          hideSeparator = true;
        }
      } else if (!item.hidden) {
        hideSeparator = false;
      }
    }
  }

  /**
   * Handle the property changed signal from a menu item.
   */
  private _onPropertyChanged(item: MenuItem): void {
    var i = this._items.indexOf(item);
    if (i === -1) {
      return;
    }
    this.close(true);
    initItemNode(item, this._nodes[i]);
    this._collapseSeparators();
  }

  private _openTimerId = 0;
  private _closeTimerId = 0;
  private _parentMenu: Menu = null;
  private _childMenu: Menu = null;
  private _childItem: MenuItem = null;
  private _items: MenuItem[] = [];
  private _nodes: HTMLElement[] = [];
}


/**
 * The coerce handler for the [[activeIndex]] property.
 */
function coerceActiveIndex(owner: Menu, value: number): number {
  var i = value | 0;
  var item = owner.itemAt(i);
  return (!item || item.hidden || item.type === MenuItem.Separator) ? -1 : i;
}


/**
 * The change handler for the [[activeIndex]] property.
 */
function onActiveIndexChanged(owner: Menu, i: number, j: number): void {
  var oldNode = (<any>owner)._nodes[i];
  var newNode = (<any>owner)._nodes[j];
  if (oldNode) oldNode.classList.remove(ACTIVE_CLASS);
  if (newNode) newNode.classList.add(ACTIVE_CLASS);
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
  icon.className = ICON_CLASS;
  text.className = TEXT_CLASS;
  shortcut.className = SHORTCUT_CLASS;
  submenu.className = SUBMENU_ICON_CLASS;
  node.appendChild(icon);
  node.appendChild(text);
  node.appendChild(shortcut);
  node.appendChild(submenu);
  initItemNode(item, node);
  return node;
}


/**
 * Initialize the DOM node for the given menu item.
 */
function initItemNode(item: MenuItem, node: HTMLElement): void {
  var parts = [MENU_ITEM_CLASS];
  if (item.className) {
    parts.push(item.className);
  }
  if (item.type === MenuItem.Check) {
    parts.push(CHECK_TYPE_CLASS);
  } else if (item.type === MenuItem.Separator) {
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
  node.className = parts.join(' ');
  (<HTMLElement>node.children[1]).textContent = item.text;
  (<HTMLElement>node.children[2]).textContent = item.shortcut;
}


/**
 * Test whether a menu item is a visible non-separator item.
 */
function isSelectableItem(item: MenuItem): boolean {
  return !item.hidden && item.type !== MenuItem.Separator;
}


/**
 * Test whether a menu item is keyable for a mnemonic.
 */
function isKeyableItem(item: MenuItem): boolean {
  return !item.disabled && isSelectableItem(item);
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
