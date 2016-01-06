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
    // XXX this._reset();
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
   * Trigger the currently active menu item.
   *
   * #### Notes
   * This is a no-op if there is no active menu item.
   *
   * This is equivalent to clicking on the active menu item.
   */
  triggerActiveItem(): void {
    // if (!this.isVisible || this.activeIndex === -1) {
    //   return;
    // }
    // let ref = this._nodes[this.activeIndex] || this.node;
    // this._activate();
    // this._closeChildMenu();
    // this._openChildMenu(this.activeItem.submenu, ref);
    // if (this.isAttached && item.submenu) {
    //   let ref = this._nodes[index] || this.node;
    //   this._activate();
    //   this._closeChildMenu();
    //   this._openChildMenu(item.submenu, ref);
    // }
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
    // XXX this._reset();

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

    // Schedule an update the item nodes.
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

    // Collapse neighboring separators.
    collapseSeparators(items, nodes);
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
    // XXX this._reset()
  }

  private _active = false;
  private _childMenu: Menu = null;
  private _nodes: HTMLElement[] = [];
}
