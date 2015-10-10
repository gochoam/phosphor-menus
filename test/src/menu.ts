/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import expect = require('expect.js');

import {
  Message
} from 'phosphor-messaging';

import {
  Signal
} from 'phosphor-signaling';

import {
  attachWidget, detachWidget, Widget
} from 'phosphor-widget';

import {
  IMenuItemTemplate, Menu, MenuItem
} from '../../lib/index';

import './index.css';


function createMenuItem(template: IMenuItemTemplate): MenuItem {
  return MenuItem.fromTemplate(template);
}


class LogMenu extends Menu {

  messages: string[] = [];

  static fromTemplate(array: IMenuItemTemplate[]): LogMenu {
    var menu = new LogMenu();
    menu.items = array.map(createMenuItem);
    return menu;
  }

  handleEvent(event: Event): void {
    super.handleEvent(event);
    this.messages.push(event.type);
  }

  protected onItemsChanged(old: MenuItem[], items: MenuItem[]): void {
    super.onItemsChanged(old, items);
    this.messages.push('onItemsChanged');
  }

  protected onActiveIndexChanged(old: number, index: number): void {
    super.onActiveIndexChanged(old, index);
    this.messages.push('onActiveIndexChanged');
  }

  protected onOpenItem(index: number, item: MenuItem): void {
    super.onOpenItem(index, item);
    this.messages.push('onOpenItem');
  }

  protected onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
    this.messages.push('onAfterAttach');
  }

  protected onBeforeDetach(msg: Message): void {
    super.onBeforeDetach(msg);
    this.messages.push('onBeforeDetach');
  }

  protected onUpdateRequest(msg: Message): void {
    super.onUpdateRequest(msg);
    this.messages.push('onUpdateRequest');
  }

  protected onCloseRequest(msg: Message): void {
    super.onCloseRequest(msg);
    this.messages.push('onCloseRequest');
  }
}


function triggerMouseEvent(node: HTMLElement, eventType: string, options: any={}) {
  options.bubbles = true;
  var clickEvent = new MouseEvent(eventType, options);
  node.dispatchEvent(clickEvent);
}


function triggerKeyEvent(node: HTMLElement, eventType: string, options: any={}) {
  // cannot use KeyboardEvent in Chrome because it sets keyCode = 0
  var event = document.createEvent('Event');
  event.initEvent(eventType, true, true);
  for (var prop in options) {
    (<any>event)[prop] = options[prop];
  }
  node.dispatchEvent(event);
}


function logItem(item: MenuItem): void {
  console.log(item.text);
}


var MENU_TEMPLATE = [
  {
    text: 'File',
    submenu: [
      {
        text: 'New File',
        shortcut: 'Ctrl+N',
        handler: logItem
      },
      {
        text: 'Open File',
        type: 'check',
        checked: true,
        shortcut: 'Ctrl+O',
        handler: logItem
      },
      {
        text: 'Save File',
        shortcut: 'Ctrl+S',
        handler: logItem
      },
      {
        text: 'Save As...',
        hidden: true,
        shortcut: 'Ctrl+Shift+S',
        handler: logItem
      },
      {
        type: 'separator'
      },
      {
        text: 'Close File',
        shortcut: 'Ctrl+W',
        handler: logItem
      },
      {
        text: 'Close All Files',
        handler: logItem
      },
      {
        type: 'separator'
      },
      {
        text: 'More...',
        submenu: [
          {
            text: 'One',
            handler: logItem
          },
          {
            text: 'Two',
            handler: logItem
          },
          {
            text: 'Three',
            handler: logItem
          },
          {
            text: 'Four',
            handler: logItem
          }
        ]
      },
      {
        type: 'separator'
      },
      {
        text: 'Exit',
        handler: logItem
      }
    ]
  },
  {
    text: 'Edit',
    submenu: [
      {
        text: '&Undo',
        shortcut: 'Ctrl+Z',
        className: 'undo',
        handler: logItem
      },
      {
        text: '&Repeat',
        shortcut: 'Ctrl+Y',
        className: 'repeat',
        handler: logItem
      },
      {
        type: 'separator'
      },
      {
        text: '&Copy',
        shortcut: 'Ctrl+C',
        className: 'copy',
        handler: logItem
      },
      {
        text: 'Cu&t',
        shortcut: 'Ctrl+X',
        className: 'cut',
        handler: logItem
      },
      {
        text: '&Paste',
        shortcut: 'Ctrl+V',
        className: 'paste',
        handler: logItem
      }
    ]
  },
  {
    text: 'Find',
    submenu: [
      {
        text: 'Find...',
        shortcut: 'Ctrl+F',
        handler: logItem
      },
      {
        text: 'Find Next',
        shortcut: 'F3',
        handler: logItem
      },
      {
        text: 'Find Previous',
        shortcut: 'Shift+F3',
        handler: logItem
      },
      {
        type: 'separator'
      },
      {
        text: 'Replace...',
        shortcut: 'Ctrl+H',
        handler: logItem
      },
      {
        text: 'Replace Next',
        shortcut: 'Ctrl+Shift+H',
        handler: logItem
      }
    ]
  },
  {
    text: 'View',
    disabled: true
  },
  {
    type: 'separator'
  },
  {
    text: 'Help',
    submenu: [
      {
        text: 'Documentation',
        handler: logItem
      },
      {
        text: 'About',
        handler: logItem
      }
    ]
  }
];


describe('phosphor-menus', () => {

  describe('Menu', () => {

    describe('.p_Menu', () => {

      it('should equal `p-Menu`', () => {
        expect(Menu.p_Menu).to.be('p-Menu');
      });

    });

    describe('.p_Menu_content', () => {

      it('should equal `p-Menu-content`', () => {
        expect(Menu.p_Menu_content).to.be('p-Menu-content');
      });

    });

    describe('.p_Menu_item', () => {

      it('should equal `p-Menu-item`', () => {
        expect(Menu.p_Menu_item).to.be('p-Menu-item');
      });

    });

    describe('.p_Menu_item_icon', () => {

      it('should equal `p-Menu-item-icon`', () => {
        expect(Menu.p_Menu_item_icon).to.be('p-Menu-item-icon');
      });

    });

    describe('.p_Menu_item_text', () => {

      it('should equal `p-Menu-item-text`', () => {
        expect(Menu.p_Menu_item_text).to.be('p-Menu-item-text');
      });

    });

    describe('.p_Menu_item_shortcut', () => {

      it('should equal `p-Menu-item-shortcut`', () => {
        expect(Menu.p_Menu_item_shortcut).to.be('p-Menu-item-shortcut');
      });

    });

    describe('.p_Menu_item_submenu', () => {

      it('should equal `p-Menu-item-submenu`', () => {
        expect(Menu.p_Menu_item_submenu).to.be('p-Menu-item-submenu');
      });

    });

    describe('.p_mod_check_type', () => {

      it('should equal `p-mod-check-type`', () => {
        expect(Menu.p_mod_check_type).to.be('p-mod-check-type');
      });

    });

    describe('.p_mod_separator_type', () => {

      it('should equal `p-mod-separator-type`', () => {
        expect(Menu.p_mod_separator_type).to.be('p-mod-separator-type');
      });

    });

    describe('.p_mod_active', () => {

      it('should equal `p-mod-active`', () => {
        expect(Menu.p_mod_active).to.be('p-mod-active');
      });

    });

    describe('.p_mod_disabled', () => {

      it('should equal `p-mod-disabled`', () => {
        expect(Menu.p_mod_disabled).to.be('p-mod-disabled');
      });

    });

    describe('.p_mod_force_hidden', () => {

      it('should equal `p-mod-force-hidden`', () => {
        expect(Menu.p_mod_force_hidden).to.be('p-mod-force-hidden');
      });

    });

    describe('.p_mod_checked', () => {

      it('should equal `p-mod-checked`', () => {
        expect(Menu.p_mod_checked).to.be('p-mod-checked');
      });

    });

    describe('.p_mod_submenu', () => {

      it('should equal `p-mod-submenu`', () => {
        expect(Menu.p_mod_submenu).to.be('p-mod-submenu');
      });

    });

    describe('.fromTemplate', () => {

      it('should create a menu from a template', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        expect(menu.items.length).to.be(6);
      });

    });

    describe('.closedSignal', () => {

      it('should be a signal', () => {
        expect(Menu.closedSignal instanceof Signal).to.be(true);
      });

    });

    describe('#constructor()', () => {

      it('should accept no arguments', () => {
        var menu = new Menu();
        expect(menu instanceof Menu).to.be(true);
      });

      it('should add the `p-Menu` class', () => {
        var menu = new Menu();
        expect(menu.hasClass(Menu.p_Menu)).to.be(true);
      });

    });

    describe('#dispose()', () => {

      it('should dispose of the resources held by the menu', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.dispose();
        expect(menu.items.length).to.be(0);
      });

    });

    describe('#closed', () => {

      it('should be emitted when the menu item is closed', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        var main = new Widget();
        main.children = [menu];
        var called = false;
        menu.closed.connect(() => { called = true; });
        menu.close(true);
        expect(called).to.be(true);
      });

    });

    describe('#parentMenu', () => {

      it('should get the parent menu of the menu', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.open(1, 1);
        menu.activeIndex = 0;
        menu.openActiveItem();
        expect(menu.items[0].submenu.parentMenu).to.eql(menu);
        menu.close(true);
      });

      it('should null if the menu is not an open submenu', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        expect(menu.items[0].submenu.parentMenu).to.be(null);
      });

    });

    describe('#childMenu', () => {

      it('should get the child menu of the menu', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.open(1, 1);
        menu.activeIndex = 0;
        menu.openActiveItem();
        expect(menu.childMenu).to.eql(menu.items[0].submenu);
        menu.close(true);
      });

      it('should null if the menu does not have an open submenu', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        expect(menu.childMenu).to.be(null);
      });

    });

    describe('#rootMenu', () => {

      it('should find the root menu of this menu hierarchy', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        expect(menu.rootMenu).to.eql(menu);
        for (var i = 0; i < menu.items.length; i++) {
          var submenu = menu.items[i].submenu;
          if (submenu === null) {
            continue;
          }
          menu.activeIndex = i;
          menu.openActiveItem();
          expect(submenu.rootMenu).to.eql(menu);
          for (var j = 0; j < submenu.items.length; j++) {
            var subSubmenu = submenu.items[j].submenu;
            if (subSubmenu !== null) {
              submenu.activeIndex = j;
              submenu.openActiveItem();
              expect(subSubmenu.rootMenu).to.eql(menu);
              subSubmenu.close(true);
            }
          }
          submenu.close(true);
        }
        menu.close(true);
      });

    });

    describe('#leafMenu', () => {

      it('should find the root menu of this menu hierarchy', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        expect(menu.rootMenu).to.eql(menu);
        for (var i = 0; i < menu.items.length; i++) {
          var submenu = menu.items[i].submenu;
          if (submenu === null) {
            continue;
          }
          menu.activeIndex = i;
          menu.openActiveItem();
          expect(menu.leafMenu).to.eql(submenu);
          for (var j = 0; j < submenu.items.length; j++) {
            var subSubmenu = submenu.items[j].submenu;
            if (subSubmenu !== null) {
              submenu.activeIndex = j;
              submenu.openActiveItem();
              expect(submenu.leafMenu).to.eql(subSubmenu);
              expect(menu.leafMenu).to.eql(subSubmenu);
              subSubmenu.close(true);
            }
          }
          submenu.close(true);
        }
        menu.close(true);
      });

    });

    describe('#popup()', () => {

      it('should popup the menu at the specified location', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(10, 10);
        var rect = menu.node.getBoundingClientRect();
        expect(rect.left).to.be(10);
        expect(rect.top).to.be(10);
        menu.close(true);
      });

      it('should be adjusted to fit naturally on the screen', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(-1000, -1000);
        var rect = menu.node.getBoundingClientRect();
        expect(rect.left).to.be(0);
        expect(rect.top).to.be(0);
        menu.close(true);
      });

      it('should accept flags to force the location', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(10000, 10000, true, true);
        var rect = menu.node.getBoundingClientRect();
        expect(rect.left).to.be(10000);
        expect(rect.top).to.be(10000);
        menu.close(true);
      });

      it('should accept mouse and key presses', () => {
        var menu = new LogMenu();
        menu.popup(0, 0);
        triggerKeyEvent(document.body, 'keydown');
        triggerKeyEvent(document.body, 'keypress');
        triggerMouseEvent(document.body, 'mousedown');
        expect(menu.messages.indexOf('keydown')).to.not.be(-1);
        expect(menu.messages.indexOf('keypress')).to.not.be(-1);
        expect(menu.messages.indexOf('mousedown')).to.not.be(-1);
        menu.close(true);
      });

    });

    describe('#open()', () => {

      it('should open the menu at the specified location', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.open(10, 10);
        var rect = menu.node.getBoundingClientRect();
        expect(rect.left).to.be(10);
        expect(rect.top).to.be(10);
        menu.close(true);
      });

      it('should be adjusted to fit naturally on the screen', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.open(-1000, -1000);
        var rect = menu.node.getBoundingClientRect();
        expect(rect.left).to.be(0);
        expect(rect.top).to.be(0);
        menu.close(true);
      });

      it('should accept flags to force the location', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.open(10000, 10000, true, true);
        var rect = menu.node.getBoundingClientRect();
        expect(rect.left).to.be(10000);
        expect(rect.top).to.be(10000);
        menu.close(true);
      });

      it('should ignore mouse and key presses', () => {
        var menu = new LogMenu();
        menu.open(0, 0);
        triggerKeyEvent(document.body, 'keydown');
        triggerKeyEvent(document.body, 'keypress');
        triggerMouseEvent(document.body, 'mousedown');
        expect(menu.messages.indexOf('keydown')).to.be(-1);
        expect(menu.messages.indexOf('keypress')).to.be(-1);
        expect(menu.messages.indexOf('mousedown')).to.be(-1);
        menu.close(true);
      });

    });

    describe('#onItemsChanged()', () => {

      it('should be invoked when the menu items change', () => {
        var menu = LogMenu.fromTemplate(MENU_TEMPLATE);
        menu.items = [];
        expect(menu.messages.indexOf('onItemsChanged')).to.not.be(-1);
      });

      it('should close the menu', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(0, 0);
        expect(menu.isAttached).to.be(true);
        menu.items = [];
        expect(menu.isAttached).to.be(false);
      });

    });

    describe('#onActiveIndexChanged()', () => {

      it('should be invoked when the active index changes', () => {
        var menu = LogMenu.fromTemplate(MENU_TEMPLATE);
        menu.activeIndex = 0;
        expect(menu.messages.indexOf('onActiveIndexChanged')).to.not.be(-1);
      });

    });

    describe('#onOpenItem()', () => {

      it('should be invoked when a menu item should be opened', () => {
        var menu = LogMenu.fromTemplate(MENU_TEMPLATE);
        menu.open(1, 1);
        menu.activateNextItem();
        menu.openActiveItem();
        expect(menu.messages.indexOf('onOpenItem')).to.not.be(-1);
        menu.close(true);
      });

      it('should open the child menu and activate the first item', () => {
        var menu = LogMenu.fromTemplate(MENU_TEMPLATE);
        menu.open(1, 1);
        menu.activateNextItem();
        menu.openActiveItem();
        expect(menu.messages.indexOf('onOpenItem')).to.not.be(-1);
        expect(menu.childMenu).to.be(menu.items[0].submenu);
        expect(menu.items[0].submenu.activeIndex).to.be(0);
        menu.close(true);
      });

    });

    describe('#onTriggerItem()', () => {

      it('should close the root menu', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.activateNextItem();
        menu.openActiveItem();
        menu.childMenu.triggerActiveItem();
        expect(menu.isAttached).to.be(false);
      });

      it('should call the item handler', () => {
        var called = false;
        var menu = Menu.fromTemplate([{ handler: () => { called = true; } }]);
        menu.activateNextItem();
        menu.triggerActiveItem();
        expect(called).to.be(true);
      });

    });

    describe('#onUpdateRequest()', () => {

      it('should be invoked on `open`', () => {
        var menu = new LogMenu();
        menu.open(0, 0);
        expect(menu.messages.indexOf('onUpdateRequest')).to.not.be(-1);
        menu.close(true);
      });

      it('should be invoked on `popup`', () => {
        var menu = new LogMenu();
        menu.popup(0, 0);
        expect(menu.messages.indexOf('onUpdateRequest')).to.not.be(-1);
        menu.close(true);
      });

      it('should generate the menu content', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        expect(menu.node.firstChild.childNodes.length).to.be(0);
        menu.popup(0, 0);
        expect(menu.node.firstChild.childNodes.length).to.be(6);
      });

    });

    describe('#onCloseRequest()', () => {

      it('should be invoked when a menu is closed', () => {
        var menu = new LogMenu();
        menu.popup(0, 0);
        menu.close(true);
        expect(menu.messages.indexOf('onCloseRequest')).to.not.be(-1);
      });

      it('should detach the widget from the DOM', () => {
        var menu = new Menu();
        menu.popup(0, 0);
        expect(menu.isAttached).to.be(true);
        menu.close(true);
        expect(menu.isAttached).to.be(false);
      });

    });

  });

});
