/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  Title
} from 'phosphor-widget';

import {
  MenuGroup
} from './menugroup';


/**
 * A menu group for defining flyout menu items.
 *
 * #### Notes
 * A menu flyout is similar to a submenu, except that it only allows
 * for a single level of nesting rather than an arbitrary hierarchy.
 *
 * A menu group adds a `title` to the group of items so that it can
 * be rendered similar to a normal menu item.
 */
export
class MenuFlyout extends MenuGroup {
  /**
   * Get the title object for the menu flyout.
   *
   * #### Notes
   * The title data (text, icon, etc.) is used to populate the node
   * for the flyout item in a menu. The flyout menu items are shown
   * in a separate panel next to the primary menu items.
   *
   * This is a read-only property.
   */
  get title(): Title {
    return this._title;
  }

  private _title = new Title();
}
