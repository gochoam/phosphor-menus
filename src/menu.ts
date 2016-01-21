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
  safeExecute
} from 'phosphor-command';

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
  AbstractMenu
} from './base';

import {
  MenuItem
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
 * The class name added to a menu item submenu icon cell.
 */
const SUBMENU_CLASS = 'p-Menu-itemSubmenuIcon';

/**
 * The class name added to a check type menu item.
 */
const CHECK_TYPE_CLASS = 'p-type-check';

/**
 * The class name added to a separator type menu item.
 */
const SEPARATOR_TYPE_CLASS = 'p-type-separator';

/**
 * The class name added to a submenu type menu item.
 */
const SUBMENU_TYPE_CLASS = 'p-type-submenu';

/**
 * The class name added to active menu items.
 */
const ACTIVE_CLASS = 'p-mod-active';

/**
 * The class name added to a disabled menu item.
 */
const DISABLED_CLASS = 'p-mod-disabled';

/**
 * The class name added to a checked menu item.
 */
const CHECKED_CLASS = 'p-mod-checked';

/**
 * The class name added to a hidden menu item.
 */
const HIDDEN_CLASS = 'p-mod-hidden';

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
class Menu extends AbstractMenu {
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
   * Create a new item node for a menu.
   *
   * @returns A new DOM node to use as an item in a menu.
   *
   * #### Notes
   * This method may be reimplemented to create custom items.
   */
  static createItemNode(): HTMLElement {
    let node = document.createElement('li');
    let icon = document.createElement('span');
    let text = document.createElement('span');
    let shortcut = document.createElement('span');
    let submenu = document.createElement('span');
    node.className = ITEM_CLASS;
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
    let icon = node.firstChild as HTMLElement;
    let text = icon.nextSibling as HTMLElement;
    let shortcut = text.nextSibling as HTMLElement;
    node.className = MenuPrivate.createItemClass(item);
    icon.className = MenuPrivate.createIconClass(item);
    text.textContent = MenuPrivate.createItemText(item);
    shortcut.textContent = MenuPrivate.createShortcutText(item);
  }

  /**
   * Construct a new menu.
   *
   * @param items - Optional menu items to initialize the menu.
   *
   * #### Notes
   * Subclasses should not pass menu items to `super`. The subclass
   * should set its own items after it has been fully initialized.
   */
  constructor(items?: MenuItem[]) {
    super();
    this.addClass(MENU_CLASS);
    if (items) this.items = items;
  }

  /**
   * Dispose of the resources held by the menu.
   */
  dispose(): void {
    this.close();
    super.dispose();
  }

  /**
   * A signal emitted when the menu item is closed.
   */
  get closed(): ISignal<Menu, void> {
    return MenuPrivate.closedSignal.bind(this);
  }

  /**
   * Get the parent menu of the menu.
   *
   * #### Notes
   * This will be `null` if the menu is not an open submenu.
   *
   * This is a read-only property.
   */
  get parentMenu(): Menu {
    return this._parentMenu;
  }

  /**
   * Get the child menu of the menu.
   *
   * #### Notes
   * This will be `null` if the menu does not have an open submenu.
   *
   * This is a read-only property.
   */
  get childMenu(): Menu {
    return this._childMenu;
  }

  /**
   * Get the menu content node.
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
   * Find the root menu of this menu hierarchy.
   */
  rootMenu(): Menu {
    let menu: Menu = this;
    while (menu._parentMenu) {
      menu = menu._parentMenu;
    }
    return menu;
  }

  /**
   * Find the leaf menu of this menu hierarchy.
   */
  leafMenu(): Menu {
    let menu: Menu = this;
    while (menu._childMenu) {
      menu = menu._childMenu;
    }
    return menu;
  }

  /**
   * Open the submenu of the active item, if possible.
   *
   * #### Notes
   * If the active item has a submenu, the submenu will be opened.
   *
   * This is a no-op if the menu is not visible.
   */
  openActiveItem(): void {
    if (!this.isVisible) {
      return;
    }
    let item = this.activeItem;
    if (!item || !item.submenu) {
      return;
    }
    let node = this._nodes[this.activeIndex];
    this._openChildMenu(item, node, false);
    this._childMenu.activateNextItem();
  }

  /**
   * Trigger the active item, if possible.
   *
   * #### Notes
   * The active item command will be executed if possible.
   *
   * This is a no-op if the menu is not visible.
   */
  triggerActiveItem(): void {
    if (!this.isVisible) {
      return;
    }
    let item = this.activeItem;
    if (!item) {
      return;
    }
    if (item.type === MenuItem.Submenu) {
      this.openActiveItem();
      return;
    }
    if (item.type === MenuItem.Separator) {
      return;
    }
    let { command, args } = item;
    if (!command || !command.isEnabled(args)) {
      return;
    }
    this.rootMenu().close();
    safeExecute(command, args);
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
   * prevent these actions, use the [[open]] method instead.
   *
   * @param x - The client X coordinate of the popup location.
   *
   * @param y - The client Y coordinate of the popup location.
   *
   * @param forceX - Whether the X coordinate must be obeyed.
   *
   * @param forceY - Whether the Y coordinate must be obeyed.
   *
   * #### Notes
   * This is a no-op if the menu is already attached to the DOM.
   *
   * **See also:** [[open]]
   */
  popup(x: number, y: number, forceX = false, forceY = false): void {
    if (!this.isAttached) {
      document.addEventListener('keydown', this, true);
      document.addEventListener('mousedown', this, true);
      MenuPrivate.openRootMenu(this, x, y, forceX, forceY);
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
   * menu from a menubar, where the menubar should handle these tasks.
   * Use the [[popup]] method for the alternative behavior.
   *
   * @param x - The client X coordinate of the popup location.
   *
   * @param y - The client Y coordinate of the popup location.
   *
   * @param forceX - Whether the X coordinate must be obeyed.
   *
   * @param forceY - Whether the Y coordinate must be obeyed.
   *
   * #### Notes
   * This is a no-op if the menu is already attached to the DOM.
   *
   * **See also:** [[popup]]
   */
  open(x: number, y: number, forceX = false, forceY = false): void {
    if (!this.isAttached) {
      MenuPrivate.openRootMenu(this, x, y, forceX, forceY);
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
    case 'mousemove':
      this._evtMouseMove(event as MouseEvent);
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
   * A method invoked to test whether an item is selectable.
   *
   * @param item - The menu item of interest.
   *
   * @returns `true` if the item is selectable, `false` otherwise.
   */
  protected isSelectable(item: MenuItem): boolean {
    if (item.type === MenuItem.Separator) {
      return false;
    }
    if (item.type === MenuItem.Submenu) {
      return !!item.submenu;
    }
    let { command, args } = item;
    return !!command && command.isEnabled(args) && command.isVisible(args);
  }

  /**
   * A method invoked when the menu items change.
   *
   * @param oldItems - The old menu items.
   *
   * @param newItems - The new menu items.
   */
  protected onItemsChanged(oldItems: MenuItem[], newItems: MenuItem[]): void {
    // Reset the menu before changing the items.
    this.close();

    // Fetch common variables.
    let nodes = this._nodes;
    let content = this.contentNode;
    let constructor = this.constructor as typeof Menu;

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

    // An update is performed just before opening the menu, which
    // removes the need to connect the menu item `changed` signal.
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
      childMenu.close();
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
      this.detach();
      this.closed.emit(void 0);
    }
  }

  /**
   * A handler invoked on an `'update-request'` message.
   */
  protected onUpdateRequest(msg: Message): void {
    // Fetch common variables.
    let items = this.items;
    let nodes = this._nodes;
    let constructor = this.constructor as typeof Menu;

    // Update the state of the item nodes.
    for (let i = 0, n = items.length; i < n; ++i) {
      constructor.updateItemNode(nodes[i], items[i]);
    }

    // Restore the active node class.
    let active = nodes[this.activeIndex];
    if (active) active.classList.add(ACTIVE_CLASS);

    // Hide the relevant menu item nodes.
    MenuPrivate.hideRelevantItems(nodes, items);
  }

  /**
   * A message handler invoked on an `'after-attach'` message.
   */
  protected onAfterAttach(msg: Message): void {
    this.node.addEventListener('mouseup', this);
    this.node.addEventListener('mousemove', this);
    this.node.addEventListener('mouseleave', this);
    this.node.addEventListener('contextmenu', this);
  }

  /**
   * A message handler invoked on a `'before-detach'` message.
   */
  protected onBeforeDetach(msg: Message): void {
    this.node.removeEventListener('mouseup', this);
    this.node.removeEventListener('mousemove', this);
    this.node.removeEventListener('mouseleave', this);
    this.node.removeEventListener('contextmenu', this);
    document.removeEventListener('keydown', this, true);
    document.removeEventListener('mousedown', this, true);
  }

  /**
   * Handle the `'mousemove'` event for the menu.
   */
  private _evtMouseMove(event: MouseEvent): void {
    let x = event.clientX;
    let y = event.clientY;
    let i = arrays.findIndex(this._nodes, node => hitTest(node, x, y));
    if (i === this.activeIndex) {
      return;
    }
    this.activeIndex = i;
    this._syncAncestors();
    this._closeChildMenu();
    this._cancelPendingOpen();
    let item = this.activeItem;
    if (item && item.submenu) {
      if (item === this._childItem) {
        this._cancelPendingClose();
      } else {
        this._openChildMenu(item, this._nodes[i], true);
      }
    }
  }

  /**
   * Handle the `'mouseleave'` event for the menu.
   */
  private _evtMouseLeave(event: MouseEvent): void {
    this._cancelPendingOpen();
    let x = event.clientX;
    let y = event.clientY;
    let child = this._childMenu;
    if (!child || !hitTest(child.node, x, y)) {
      this.activeIndex = -1;
      this._closeChildMenu();
    }
  }

  /**
   * Handle the `'mousedown'` event for the menu.
   *
   * This event listener is attached to the document for a popup menu.
   *
   * This allows the event to propagate so the element under the mouse
   * can be focused without requiring a second click.
   */
  private _evtMouseDown(event: MouseEvent): void {
    let menu: Menu = this;
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
   * Handle the `'mouseup'` event for the menu.
   */
  private _evtMouseUp(event: MouseEvent): void {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    let node = this._nodes[this.activeIndex];
    if (node && node.contains(event.target as HTMLElement)) {
      this.triggerActiveItem();
    }
  }

  /**
   * Handle the `'keydown'` event for the menu.
   *
   * This event listener is attached to the document for a popup menu.
   */
  private _evtKeyDown(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
    switch (event.keyCode) {
    case 13:  // Enter
      this.leafMenu().triggerActiveItem();
      break;
    case 27:  // Escape
      this.leafMenu().close();
      break;
    case 37:  // Left Arrow
      let leaf = this.leafMenu();
      if (leaf !== this) leaf.close();
      break;
    case 38:  // Up Arrow
      this.leafMenu().activatePreviousItem();
      break;
    case 39:  // Right Arrow
      this.leafMenu().openActiveItem();
      break;
    case 40:  // Down Arrow
      this.leafMenu().activateNextItem();
      break;
    }
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
        MenuPrivate.openSubmenu(menu, node);
      }, OPEN_DELAY);
    } else {
      let menu = item.submenu;
      this._childItem = item;
      this._childMenu = menu;
      menu._parentMenu = this;
      MenuPrivate.openSubmenu(menu, node);
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
      let childMenu = this._childMenu;
      if (childMenu) {
        this._childMenu = null;
        this._childItem = null;
        childMenu._parentMenu = null;
        childMenu.close();
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
 * The namespace for the menu private data.
 */
namespace MenuPrivate {
  /**
   * A signal emitted when the menu is closed.
   */
  export
  const closedSignal = new Signal<Menu, void>();

  /**
   * Create the class name for a menu item.
   */
  export
  function createItemClass(item: MenuItem): string {
    let name = ITEM_CLASS;
    let { type, command, args, submenu } = item;

    if (type === MenuItem.Separator) {
      return name + ' ' + SEPARATOR_TYPE_CLASS;
    }

    if (type === MenuItem.Submenu) {
      name += ' ' + SUBMENU_TYPE_CLASS;
      if (!submenu) {
        name += ' ' + DISABLED_CLASS;
      }
      return name;
    }

    if (type === MenuItem.Check) {
      name += ' ' + CHECK_TYPE_CLASS;
    }

    if (!command) {
      return name + ' ' + DISABLED_CLASS;
    }

    if (type === MenuItem.Check && command.isChecked(args)) {
      name += ' ' + CHECKED_CLASS;
    }

    if (!command.isEnabled(args)) {
      name += ' ' + DISABLED_CLASS;
    }

    return name;
  }

  /**
   * Create the class name for a menu item icon.
   */
  export
  function createIconClass(item: MenuItem): string {
    let { command, args } = item;
    let extra = command ? command.icon(args) : '';
    return ICON_CLASS + (extra ? ' ' + extra : '');
  }

  /**
   * Create the primary text for a menu item.
   */
  export
  function createItemText(item: MenuItem): string {
    let { type, command, args } = item;
    let sep = type === MenuItem.Separator;
    return sep ? '' : command ? command.text(args) : '';
  }

  /**
   * Create the shortcut text for a menu item.
   */
  export
  function createShortcutText(item: MenuItem): string {
    let sub = item.type === MenuItem.Submenu;
    let sep = item.type === MenuItem.Separator;
    return (sub || sep) ? '' : item.shortcut;
  }

  /**
   * Hide the relevant item nodes for a menu bar.
   */
  export
  function hideRelevantItems(nodes: HTMLElement[], items: MenuItem[]): void {
    // Hide the relevant leading extrema.
    let k1: number;
    for (k1 = 0; k1 < items.length; ++k1) {
      if (isVisibleExtrema(items[k1])) {
        break;
      }
      nodes[k1].classList.add(HIDDEN_CLASS);
    }

    // Hide the relevant trailing extrema.
    let k2: number;
    for (k2 = items.length - 1; k2 >= 0; --k2) {
      if (isVisibleExtrema(items[k2])) {
        break;
      }
      nodes[k2].classList.add(HIDDEN_CLASS);
    }

    // Hide the relevant remaining items.
    let hideNextSep = false;
    while (++k1 < k2) {
      let { type, command, args } = items[k1];
      if (type === MenuItem.Submenu) {
        hideNextSep = false;
      } else if (type === MenuItem.Separator) {
        if (hideNextSep) {
          nodes[k1].classList.add(HIDDEN_CLASS);
        } else {
          hideNextSep = true;
        }
      } else {
        if (!command || command.isVisible(args)) {
          hideNextSep = false;
        } else {
          nodes[k1].classList.add(HIDDEN_CLASS);
        }
      }
    }
  }

  /**
   * Open the menu as a root menu at the target location.
   */
  export
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
  export
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

  /**
   * Test whether an extrema menu item should be visible.
   */
  function isVisibleExtrema(item: MenuItem): boolean {
    let { type, command, args } = item;
    if (type === MenuItem.Separator) {
      return false;
    }
    if (type === MenuItem.Submenu) {
      return true;
    }
    return !command ? true : command.isVisible(args);
  }

  /**
   * A type alias for a simple size.
   */
  type Size = { width: number, height: number };

  /**
   * A type alias for a simple rect.
   */
  type Rect = { x: number, y: number, width: number, height: number };

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
    style.maxHeight = `${maxHeight}px`;
    menu.attach(document.body);
    if (node.scrollHeight > maxHeight) {
      style.width = `${2 * node.offsetWidth - node.clientWidth}px`;
    }
    let rect = node.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }

  /**
   * Show the menu at the specified position.
   */
  function showMenu(menu: Menu, x: number, y: number): void {
    let style = menu.node.style;
    style.top = `${Math.max(0, y)}px`;
    style.left = `${Math.max(0, x)}px`;
    style.visibility = '';
  }
}
