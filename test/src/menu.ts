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
  IMenuItemTemplate, Menu, MenuItem
} from '../../lib/index';


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


var MENU_TEMPLATE = [
  {
    text: '&Copy',
    shortcut: 'Ctrl+C',
    className: 'copy',
  },
  {
    text: 'Cu&t',
    shortcut: 'Ctrl+X',
    className: 'cut',
  },
  {
    text: '&Paste',
    shortcut: 'Ctrl+V',
    className: 'paste',
  },
  {
    type: 'separator'
  },
  {
    text: '&New Tab',
  },
  {
    text: '&Close Tab',
  },
  {
    type: 'check',
    checked: true,
    text: '&Save On Exit',
    handler: (item: MenuItem) => {
      item.checked = !item.checked;
    }
  },
  {
    type: 'separator'
  },
  {
    text: 'Task Manager',
    disabled: true
  },
  {
    type: 'separator'
  },
  {
    text: 'More...',
    submenu: [
      {
        text: 'One',
      },
      {
        text: 'Two',
      },
      {
        text: 'Three',
      },
      {
        text: 'Four',
      }
    ]
  },
  {
    type: 'separator'
  },
  {
    text: 'Close',
    className: 'close',
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
        expect(menu.items.length).to.be(13);
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
        var called = false;
        menu.closed.connect(() => { called = true; });
        menu.popup(0, 0);
        menu.close(true);
        expect(called).to.be(true);
      });

    });

    describe('#parentMenu', () => {

      it('should get the parent menu of the menu', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.open(0, 0);
        menu.activeIndex = 10;
        menu.openActiveItem();
        expect(menu.items[10].submenu.parentMenu).to.be(menu);
        menu.close(true);
      });

      it('should be null if the menu is not an open submenu', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        expect(menu.items[10].submenu.parentMenu).to.be(null);
      });

    });

    describe('#childMenu', () => {

      it('should get the child menu of the menu', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.open(0, 0);
        menu.activeIndex = 10;
        menu.openActiveItem();
        expect(menu.childMenu).to.be(menu.items[10].submenu);
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
        expect(menu.rootMenu).to.be(menu);
        menu.activeIndex = 10;
        menu.openActiveItem();
        expect(menu.items[10].submenu.rootMenu).to.be(menu);
        menu.close(true);
      });

    });

    describe('#leafMenu', () => {

      it('should find the root menu of this menu hierarchy', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        expect(menu.leafMenu).to.be(menu);
        menu.activeIndex = 10;
        menu.openActiveItem();
        expect(menu.leafMenu).to.be(menu.items[10].submenu);
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
        menu.activeIndex = 10;
        menu.openActiveItem();
        expect(menu.messages.indexOf('onOpenItem')).to.not.be(-1);
        menu.close(true);
      });

      it('should open the child menu and activate the first item', () => {
        var menu = LogMenu.fromTemplate(MENU_TEMPLATE);
        menu.open(1, 1);
        menu.activeIndex = 10;
        menu.openActiveItem();
        expect(menu.childMenu).to.be(menu.items[10].submenu);
        expect(menu.items[10].submenu.activeIndex).to.be(0);
        menu.close(true);
      });

    });

    describe('#onTriggerItem()', () => {

      it('should close the root menu', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.activeIndex = 10;
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
        expect(menu.node.firstChild.childNodes.length).to.be(13);
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

    context('key handling', () => {

      it('should trigger the active item on `Enter`', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        var called = false;
        menu.items[0].handler = () => { called = true; };
        menu.popup(0, 0);
        menu.activateNextItem();
        triggerKeyEvent(document.body, 'keydown', { keyCode: 13 });
        expect(called).to.be(true);
        menu.close(true);
      });

      it('should close the leaf menu on `Escape`', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(0, 0);
        menu.activeIndex = 10;
        menu.openActiveItem();
        expect(menu.childMenu).to.be(menu.items[10].submenu);
        triggerKeyEvent(document.body, 'keydown', { keyCode: 27 });
        expect(menu.childMenu).to.be(null);
        menu.close(true);
      });

      it('should close the leaf menu on `ArrowLeft` unless root', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(0, 0);
        menu.activeIndex = 10;
        menu.openActiveItem();
        expect(menu.childMenu).to.be(menu.items[10].submenu);
        triggerKeyEvent(document.body, 'keydown', { keyCode: 37 });
        expect(menu.childMenu).to.be(null);
        triggerKeyEvent(document.body, 'keydown', { keyCode: 37 });
        expect(menu.isAttached).to.be(true);
        menu.close(true);
      });

      it('should activate the previous item on `ArrowUp`', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(0, 0);
        menu.activeIndex = 1;
        triggerKeyEvent(document.body, 'keydown', { keyCode: 38 });
        expect(menu.activeIndex).to.be(0);
        menu.close(true);
      });

      it('should open the active item on `ArrowRight`', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(0, 0);
        menu.activeIndex = 10;
        expect(menu.childMenu).to.be(null);
        triggerKeyEvent(document.body, 'keydown', { keyCode: 39 });
        expect(menu.childMenu).to.be(menu.items[10].submenu);
        menu.close(true);
      });

      it('should activate the next item on `ArrowDown`', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(0, 0);
        menu.activateNextItem();
        expect(menu.activeIndex).to.be(0);
        triggerKeyEvent(document.body, 'keydown', { keyCode: 40 });
        expect(menu.activeIndex).to.be(1);
        menu.close(true);
      });

      it('should activate an item based on a mnemonic', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(0, 0);
        expect(menu.activeIndex).to.be(-1);
        triggerKeyEvent(document.body, 'keypress', { charCode: 84 } );  // 't' key
        expect(menu.activeIndex).to.be(1);
      });

    });

    context('mouse handling', () => {

      it('should close the child menu if we mouse over a different item', (done) => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(0, 0);
        menu.activeIndex = 10;
        menu.openActiveItem();
        var node = menu.node.firstChild.firstChild as HTMLElement;
        triggerMouseEvent(node, 'mouseenter');
        setTimeout(() => {
          expect(menu.childMenu).to.be(null);
          menu.close(true);
          done();
        }, 500);
      });

      it('should cancel the close if we mouse back to the item', (done) => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(0, 0);
        menu.activeIndex = 10;
        menu.openActiveItem();
        var node0 = menu.node.firstChild.firstChild as HTMLElement;
        var node1 = menu.node.firstChild.childNodes[10] as HTMLElement;
        triggerMouseEvent(node0, 'mouseenter');
        triggerMouseEvent(node1, 'mouseenter');
        setTimeout(() => {
          expect(menu.childMenu).to.not.be(null);
          menu.close(true);
          done();
        }, 500);
      });

      it('should trigger the item if we mouse over and click', () => {
        var menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(0, 0);
        menu.activeIndex = 10;
        menu.openActiveItem();
        var called = false;
        menu.childMenu.items[0].handler = () => { called = true; };
        var node = menu.childMenu.node.firstChild.childNodes[0] as HTMLElement;
        triggerMouseEvent(node, 'mouseenter');
        triggerMouseEvent(node, 'mousedown');
        triggerMouseEvent(node, 'mouseup');
        expect(called).to.be(true);
        menu.close(true);
      });

    });

  });

});
