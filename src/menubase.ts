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
  Message, sendMessage
} from 'phosphor-messaging';

import {
  Property
} from 'phosphor-properties';

import {
  Widget
} from 'phosphor-widget';

import {
  MenuItem, MenuItemType
} from './menuitem';


/**
 * A base class for implementing widgets which display menu items.
 */
export
class MenuBase extends Widget {
  /**
   * The property descriptor for the active index.
   *
   * This controls which menu item is the active item.
   *
   * **See also:** [[activeIndex]]
   */
  static activeIndexProperty = new Property<MenuBase, number>({
    value: -1,
    coerce: (owner, index) => owner.coerceActiveIndex(index),
    changed: (owner, old, index) => owner.onActiveIndexChanged(old, index),
  });

  /**
   * Dispose of the resources held by the menu.
   */
  dispose(): void {
    this._items.length = 0;
    super.dispose();
  }

  /**
   * Get index of the active menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[activeIndexProperty]].
   */
  get activeIndex(): number {
    return MenuBase.activeIndexProperty.get(this);
  }

  /**
   * Set index of the active menu item.
   *
   * #### Notes
   * This is a pure delegate to the [[activeIndexProperty]].
   */
  set activeIndex(value: number) {
    MenuBase.activeIndexProperty.set(this, value);
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
   * This will unconditionally deactivate the active menu item.
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
   * This will unconditionally deactivate the active menu item.
   *
   * **See also:** [[addItem]], [[moveItem]]
   */
  insertItem(index: number, item: MenuItem): number {
    this.removeItem(item);
    var i = arrays.insert(this._items, index, item);
    sendMessage(this, new ItemMessage('item-added', item, -1, i));
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
   * This will unconditionally deactivate the active menu item.
   *
   * **See also:** [[addItem]], [[insertItem]]
   */
  moveItem(fromIndex: number, toIndex: number): boolean {
    this.activeIndex = -1;
    var i = fromIndex | 0;
    var j = toIndex | 0;
    if (!arrays.move(this._items, i, j)) {
      return false;
    }
    if (i !== j) {
      sendMessage(this, new ItemMessage('item-moved', this._items[j], i, j));
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
   * #### Notes
   * This will unconditionally deactivate the active menu item.
   *
   * **See also:** [[removeItem]], [[clearItems]]
   */
  removeItemAt(index: number): MenuItem {
    this.activeIndex = -1;
    var i = index | 0;
    var item = arrays.removeAt(this._items, index);
    if (item) {
      sendMessage(this, new ItemMessage('item-removed', item, i, -1));
    }
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
   * #### Notes
   * This will unconditionally deactivate the active menu item.
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
   * #### Notes
   * This will unconditionally deactivate the active menu item.
   *
   * **See also:** [[removeItem]], [[removeItemAt]]
   */
  clearItems(): void {
    while (this._items.length > 0) {
      this.removeItemAt(this._items.length - 1);
    }
  }

  /**
   * Activate the next selectable menu item.
   *
   * #### Notes
   * The search starts with the currently active item, and progresses
   * forward until the next selectable item is found. The search will
   * wrap around at the end of the menu.
   */
  activateNextItem(): void {
    var k = this.activeIndex + 1;
    var i = k >= this._items.length ? 0 : k;
    this.activeIndex = arrays.findIndex(this._items, isSelectable, i, true);
  }

  /**
   * Activate the previous selectable menu item.
   *
   * #### Notes
   * The search starts with the currently active item, and progresses
   * backward until the next selectable item is found. The search will
   * wrap around at the front of the menu.
   */
  activatePreviousItem(): void {
    var k = this.activeIndex;
    var i = k <= 0 ? this._items.length - 1 : k - 1;
    this.activeIndex = arrays.rfindIndex(this._items, isSelectable, i, true);
  }

  /**
   * Activate the next selectable menu item with the given mnemonic.
   *
   * #### Notes
   * The search starts with the currently active item, and progresses
   * forward until the next selectable item with the given mnemonic is
   * found. The search will wrap around at the end of the menu, and the
   * mnemonic matching is case-insensitive.
   */
  activateMnemonicItem(char: string): void {
    var c = char.toUpperCase();
    var k = this.activeIndex + 1;
    var i = k >= this._items.length ? 0 : k;
    this.activeIndex = arrays.findIndex(this._items, item => {
      return isSelectable(item) && item.mnemonic.toUpperCase() === c;
    }, i, true);
  }

  /**
   * Open the active menu item.
   *
   * #### Notes
   * This is a no-op if there is no active menu item, or if the active
   * menu item does not have a submenu.
   */
  openActiveItem(): void {
    var i = this.activeIndex;
    var item = this._items[i];
    if (item && item.submenu) {
      sendMessage(this, new ItemMessage('item-open-request', item, i, i));
    }
  }

  /**
   * Trigger the active menu item.
   *
   * #### Notes
   * This is a no-op if there is no active menu item. If the active
   * menu item has a submenu, this is equivalent to `openActiveItem`.
   */
  triggerActiveItem(): void {
    var i = this.activeIndex;
    var item = this._items[i];
    if (item && item.submenu) {
      sendMessage(this, new ItemMessage('item-open-request', item, i, i));
    } else if (item) {
      sendMessage(this, new ItemMessage('item-trigger-request', item, i, i));
    }
  }

  /**
   * Process a message sent to the widget.
   *
   * @param msg - The message sent to the widget.
   *
   * #### Notes
   * Subclasses may reimplement this method as needed.
   */
  processMessage(msg: Message): void {
    switch (msg.type) {
    case 'item-added':
      this.onItemAdded(<ItemMessage>msg);
      break;
    case 'item-removed':
      this.onItemRemoved(<ItemMessage>msg);
      break;
    case 'item-moved':
      this.onItemMoved(<ItemMessage>msg);
      break;
    case 'item-open-request':
      this.onItemOpenRequest(<ItemMessage>msg);
      break;
    case 'item-trigger-request':
      this.onItemTriggerRequest(<ItemMessage>msg);
      break;
    default:
      super.processMessage(msg);
    }
  }

  /**
   * The coerce handler for the [[activeIndexProperty]].
   *
   * #### Notes
   * Subclasses may reimplement this method as needed.
   */
  protected coerceActiveIndex(index: number): number {
    var i = index | 0;
    var item = this._items[i];
    return (item && isSelectable(item)) ? i : -1;
  }

  /**
   * A method invoked when the active index changes.
   *
   * The default implementation of this method is a no-op.
   */
  protected onActiveIndexChanged(old: number, index: number): void { }

  /**
   * A message handler invoked on an `'item-added'` message.
   *
   * The default implementation of this handler is a no-op.
   */
  protected onItemAdded(msg: ItemMessage): void { }

  /**
   * A message handler invoked on an `'item-removed'` message.
   *
   * The default implementation of this handler is a no-op.
   */
  protected onItemRemoved(msg: ItemMessage): void { }

  /**
   * A message handler invoked on an `'item-moved'` message.
   *
   * The default implementation of this handler is a no-op.
   */
  protected onItemMoved(msg: ItemMessage): void { }

  /**
   * A message handler invoked on an `'item-open-request'` message.
   *
   * The default implementation of this handler is a no-op.
   */
  protected onItemOpenRequest(msg: ItemMessage): void { }

  /**
   * A message handler invoked on an `'item-trigger-request'` message.
   *
   * The default implementation of this handler is a no-op.
   */
  protected onItemTriggerRequest(msg: ItemMessage): void { }

  private _items: MenuItem[] = [];
}


/**
 * A message class for item-related messages.
 */
export
class ItemMessage extends Message {
  /**
   * Construct a new item message.
   *
   * @param type - The message type.
   *
   * @param item - The menu item for the message.
   *
   * @param previousIndex - The previous index of the item, if known.
   *   The default index is `-1` and indicates an unknown index.
   *
   * @param currentIndex - The current index of the item, if known.
   *   The default index is `-1` and indicates an unknown index.
   */
  constructor(type: string, item: MenuItem, previousIndex = -1, currentIndex = -1) {
    super(type);
    this._item = item;
    this._currentIndex = currentIndex;
    this._previousIndex = previousIndex;
  }

  /**
   * The menu item for the message.
   *
   * #### Notes
   * This is a read-only property.
   */
  get item(): MenuItem {
    return this._item;
  }

  /**
   * The current index of the item.
   *
   * #### Notes
   * This will be `-1` if the current index is unknown.
   *
   * This is a read-only property.
   */
  get currentIndex(): number {
    return this._currentIndex;
  }

  /**
   * The previous index of the item.
   *
   * #### Notes
   * This will be `-1` if the previous index is unknown.
   *
   * This is a read-only property.
   */
  get previousIndex(): number {
    return this._previousIndex;
  }

  private _item: MenuItem;
  private _currentIndex: number;
  private _previousIndex: number;
}


/**
 * Test whether a menu item is selectable.
 */
function isSelectable(item: MenuItem): boolean {
  return !(item.hidden || item.disabled || item.type === MenuItemType.Separator);
}
