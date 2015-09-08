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
  Property
} from 'phosphor-properties';

import {
  Menu
} from './menu';

import {
  ItemMessage, MenuBase
} from './menubase';

import {
  MenuItem
} from './menuitem';


/**
 * `p-MenuBar`: the class name added to a menu bar widget.
 */
export
const MENU_BAR_CLASS = 'p-MenuBar';

/**
 * `p-MenuBar-content`: the class name assigned to a content node.
 */
export
const CONTENT_CLASS = 'p-MenuBar-content';

/**
 * `p-MenuBar-menu`: the class name added to an open menu.
 */
export
const MENU_CLASS = 'p-MenuBar-menu';

/**
 * `p-MenuBar-item`: the class name assigned to a menu item.
 */
export
const MENU_ITEM_CLASS = 'p-MenuBar-item';

/**
 * `p-MenuBar-item-icon`: the class name added to an item icon cell.
 */
export
const ICON_CLASS = 'p-MenuBar-item-icon';

/**
 * `p-MenuBar-item-text`: the class name added to an item text cell.
 */
export
const TEXT_CLASS = 'p-MenuBar-item-text';

/**
 * `p-mod-separator-type`: the class name added to a separator item.
 */
export
const SEPARATOR_TYPE_CLASS = 'p-mod-separator-type';

/**
 * `p-mod-active`: the class name added to an active menu bar and item.
 */
export
const ACTIVE_CLASS = 'p-mod-active';

/**
 * `p-mod-disabled`: the class name added to a disabled item.
 */
export
const DISABLED_CLASS = 'p-mod-disabled';

/**
 * `p-mod-hidden`: the class name added to a hidden item.
 */
export
const HIDDEN_CLASS = 'p-mod-hidden';

/**
 * `p-mod-force-hidden`: the class name added to a force hidden item.
 */
export
const FORCE_HIDDEN_CLASS = 'p-mod-force-hidden';


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
   * Create the DOM node for a menu bar.
   */
  static createNode(): HTMLElement {
    var node = document.createElement('div');
    var content = document.createElement('div');
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
   * Dispose of the resources held by the panel.
   */
  dispose(): void {
    this._reset();
    this._nodes.length = 0;
    super.dispose();
  }

  /**
   * Get the child menu of the menu bar.
   *
   * #### Notes
   * This will be null if the menu bar does not have an open menu.
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
      this._evtMouseDown(<MouseEvent>event);
      break;
    case 'mousemove':
      this._evtMouseMove(<MouseEvent>event);
      break;
    case 'mouseleave':
      this._evtMouseLeave(<MouseEvent>event);
      break;
    case 'contextmenu':
      this._evtContextMenu(<MouseEvent>event);
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
   * A message handler invoked on an `'item-added'` message.
   */
  protected onItemAdded(msg: ItemMessage): void {
    this._reset();
    var node = createItemNode(msg.item);
    var next = this._nodes[msg.currentIndex];
    arrays.insert(this._nodes, msg.currentIndex, node);
    this.node.firstChild.insertBefore(node, next);
    Property.getChanged(msg.item).connect(this._onPropertyChanged, this);
    this._collapseSeparators();
  }

  /**
   * A message handler invoked on an `'item-removed'` message.
   */
  protected onItemRemoved(msg: ItemMessage): void {
    this._reset();
    var node = arrays.removeAt(this._nodes, msg.previousIndex);
    this.node.firstChild.removeChild(node);
    Property.getChanged(msg.item).connect(this._onPropertyChanged, this);
    this._collapseSeparators();
  }

  /**
   * A message handler invoked on an `'item-moved'` message.
   */
  protected onItemMoved(msg: ItemMessage): void {
    this._reset();
    arrays.move(this._nodes, msg.previousIndex, msg.currentIndex);
    var node = this._nodes[msg.currentIndex];
    var next = this._nodes[msg.currentIndex + 1];
    this.node.firstChild.insertBefore(node, next);
    this._collapseSeparators();
  }

  /**
   * A message handler invoked on an `'item-open-request'` message.
   */
  protected onItemOpenRequest(msg: ItemMessage): void {
    // var index = this._activeIndex;
    // var item = this._items[index];
    // if (!item) {
    //   return false;
    // }
    // this._setState(MBState.Active);
    // this._setActiveIndex(index);
    // var menu = this._childMenu;
    // if (menu) menu.activateNextItem();
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
   * A message handler invoked on a `'close-request'` message.
   */
  protected onCloseRequest(msg: Message): void {
    this._reset();
    super.onCloseRequest(msg);
  }

  /**
   * A method invoked when the active index changes.
   */
  protected onActiveIndexChanged(old: number, index: number): void {
    var oldNode = this._nodes[old];
    var newNode = this._nodes[index];
    if (oldNode) oldNode.classList.remove(ACTIVE_CLASS);
    if (newNode) newNode.classList.add(ACTIVE_CLASS);
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
    var i = arrays.findIndex(this._nodes, n => hitTest(n, x, y));

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
    // was not on a menu item, reset the active index and bail.
    if (i === -1) {
      this.activeIndex = -1;
      return;
    }

    // Otherwise, the press was on a menu item. Active the menu bar.
    this._activate();

    // Lookup the pressed menu item. If it's hidden, disabled,
    // or a separator, clear the active index.
    var item = this.itemAt(i);
    if (item.hidden || item.disabled || item.type === MenuItem.Separator) {
      this.activeIndex = -1;
      return;
    }

    // Update the active index to the pressed item.
    this.activeIndex = i;

    // Finally, open the item's submenu if it has one.
    if (item.submenu) this._openChildMenu(item.submenu, this._nodes[i]);
  }

  /**
   * Handle the `'mousemove'` event for the menu bar.
   */
  private _evtMouseMove(event: MouseEvent): void {
    var x = event.clientX;
    var y = event.clientY;

    // Check if the mouse is over one of the menu items.
    var i = arrays.findIndex(this._nodes, n => hitTest(n, x, y));

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

    // The active index has changed, close the open child menu.
    this._closeChildMenu();

    // Lookup the hovered menu item. If it's hidden, disabled,
    // or a separator, there's nothing more to do.
    var item = this.itemAt(i);
    if (item.hidden || item.disabled || item.type === MenuItem.Separator) {
      return;
    }

    // Finally, open the hovered item's submenu if it has one.
    if (item.submenu) this._openChildMenu(item.submenu, this._nodes[i]);
  }

  /**
   * Handle the `'mouseleave'` event for the menu bar.
   */
  private _evtMouseLeave(event: MouseEvent): void {
    if (!this._active) this.activeIndex = -1;
  }

  /**
   * Handle the `'contextmenu'` event for the menu.
   *
   * This event listener is attached to the menu bar node and disables
   * the default browser context menu.
   */
  private _evtContextMenu(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Handle the 'keydown' event for the menu bar.
   */
  private _evtKeyDown(event: KeyboardEvent): void {
    // event.stopPropagation();
    // var menu = this._childMenu;
    // var leaf = menu && menu.leafMenu;
    // switch (event.keyCode) {
    // case 13:  // Enter
    //   event.preventDefault();
    //   if (leaf) leaf.triggerActiveItem();
    //   break;
    // case 27:  // Escape
    //   event.preventDefault();
    //   if (leaf) leaf.close(true);
    //   break;
    // case 37:  // Left Arrow
    //   event.preventDefault();
    //   if (leaf && leaf !== menu) {
    //     leaf.close(true);
    //   } else {
    //     this.activatePreviousItem();
    //   }
    //   break;
    // case 38:  // Up Arrow
    //   event.preventDefault();
    //   if (leaf) leaf.activatePreviousItem();
    //   break;
    // case 39:  // Right Arrow
    //   event.preventDefault();
    //   // if (!leaf || !leaf.openActiveItem()) {
    //   //   this.activateNextItem();
    //   // }
    //   break;
    // case 40:  // Down Arrow
    //   event.preventDefault();
    //   if (leaf) leaf.activateNextItem();
    //   break;
    // }
  }

  /**
   * Handle the `'keypress'` event for the menu bar.
   */
  private _evtKeyPress(event: KeyboardEvent): void {
    // event.preventDefault();
    // event.stopPropagation();
    // var base = this._childMenu || this;
    // base.activateMnemonicItem(String.fromCharCode(event.charCode));
  }

  /**
   * Open the menu item's submenu using the node for location.
   */
  private _openChildMenu(menu: Menu, node: HTMLElement): void {
    var rect = node.getBoundingClientRect();
    this._childMenu = menu;
    menu.addClass(MENU_CLASS);
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
      menu.removeClass(MENU_CLASS);
      menu.close(true);
    }
  }

  /**
   *
   */
  private _activate(): void {
    this._active = true;
    this.addClass(ACTIVE_CLASS);
    // swap event listeners after current dispatch is complete
    setTimeout(() => {
      this.node.removeEventListener('mousedown', this);
      document.addEventListener('mousedown', this, true);
      document.addEventListener('keydown', this, true);
      document.addEventListener('keypress', this, true);
    }, 0);
  }

  /**
   *
   */
  private _deactivate(): void {
    this._active = false;
    this.removeClass(ACTIVE_CLASS);
    // swap event listeners after current dispatch is complete
    setTimeout(() => {
      this.node.addEventListener('mousedown', this);
      document.removeEventListener('mousedown', this, true);
      document.removeEventListener('keydown', this, true);
      document.removeEventListener('keypress', this, true);
    }, 0);
  }

  /**
   *
   */
  private _reset(): void {
    this._deactivate();
    this._closeChildMenu();
    this.activeIndex = -1;
  }

  /**
   * Collapse leading, trailing, and neighboring visible separators.
   */
  private _collapseSeparators(): void {
    // Reset the force hidden state.
    for (var k = 0, n = this.itemCount; k < n; ++k) {
      this._nodes[k].classList.remove(FORCE_HIDDEN_CLASS);
    }

    // Force hide the leading visible separators.
    var i: number;
    for (i = 0, n = this.itemCount; i < n; ++i) {
      var item = this.itemAt(i);
      if (item.hidden) {
        continue;
      }
      if (item.type !== MenuItem.Separator) {
        break;
      }
      this._nodes[i].classList.add(FORCE_HIDDEN_CLASS);
    }

    // Force hide the trailing visible separators.
    var j: number;
    for (j = this.itemCount - 1; j >= 0; --j) {
      var item = this.itemAt(j);
      if (item.hidden) {
        continue;
      }
      if (item.type !== MenuItem.Separator) {
        break;
      }
      this._nodes[j].classList.add(FORCE_HIDDEN_CLASS);
    }

    // Force hide the remaining consecutive visible separators.
    var lastWasSep = false;
    while (++i < j) {
      var item = this.itemAt(i);
      if (item.hidden) {
        continue;
      }
      if (lastWasSep && item.type === MenuItem.Separator) {
        this._nodes[i].classList.add(FORCE_HIDDEN_CLASS);
      } else {
        lastWasSep = item.type === MenuItem.Separator;
      }
    }
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

  /**
   * Handle the property changed signal from a menu item.
   */
  private _onPropertyChanged(item: MenuItem): void {
    // this._closeChildMenu();
    // this.activeIndex = -1;
    // var index = this.itemIndex(item);
    // initItemNode(item, this._nodes[index]);
    // this._collapseSeparators();
  }

  private _active = false;
  private _childMenu: Menu = null;
  private _nodes: HTMLElement[] = [];
}


/**
 * Create the DOM node for a MenuItem.
 */
function createItemNode(item: MenuItem): HTMLElement {
  var node = document.createElement('div');
  var icon = document.createElement('span');
  var text = document.createElement('span');
  icon.className = ICON_CLASS;
  text.className = TEXT_CLASS;
  node.appendChild(icon);
  node.appendChild(text);
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
  if (item.type === MenuItem.Separator) {
    parts.push(SEPARATOR_TYPE_CLASS);
  }
  if (item.disabled) {
    parts.push(DISABLED_CLASS);
  }
  if (item.hidden) {
    parts.push(HIDDEN_CLASS);
  }
  node.className = parts.join(' ');
  (<HTMLElement>node.children[1]).textContent = item.text;
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
