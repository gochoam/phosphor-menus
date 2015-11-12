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


class LogMenu extends Menu {

  messages: string[] = [];

  static fromTemplate(array: IMenuItemTemplate[]): LogMenu {
    let items = array.map(templ => MenuItem.fromTemplate(templ));
    let menu = new LogMenu();
    menu.items = items;
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
  let clickEvent = new MouseEvent(eventType, options);
  node.dispatchEvent(clickEvent);
}


function triggerKeyEvent(node: HTMLElement, eventType: string, options: any={}) {
  // cannot use KeyboardEvent in Chrome because it sets keyCode = 0
  let event = document.createEvent('Event');
  event.initEvent(eventType, true, true);
  for (let prop in options) {
    (<any>event)[prop] = options[prop];
  }
  node.dispatchEvent(event);
}


let MENU_TEMPLATE = [
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

    describe('.fromTemplate', () => {

      it('should create a menu from a template', () => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
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
        let menu = new Menu();
        expect(menu instanceof Menu).to.be(true);
      });

      it('should add the `p-Menu` class', () => {
        let menu = new Menu();
        expect(menu.hasClass('p-Menu')).to.be(true);
      });

    });

    describe('#dispose()', () => {

      it('should dispose of the resources held by the menu', () => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.dispose();
        expect(menu.items.length).to.be(0);
      });

    });

    describe('#closed', () => {

      it('should be emitted when the menu is closed', () => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
        let called = false;
        menu.closed.connect(() => { called = true; });
        menu.popup(0, 0);
        menu.close();
        expect(called).to.be(true);
        menu.dispose();
      });

    });

    describe('#parentMenu', () => {

      it('should get the parent menu of the menu', () => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(0, 0);
        menu.activeIndex = 10;
        menu.openActiveItem();
        expect(menu.items[10].submenu.parentMenu).to.be(menu);
        menu.dispose();
      });

      it('should be null if the menu is not an open submenu', () => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
        expect(menu.items[10].submenu.parentMenu).to.be(null);
      });

    });

    describe('#childMenu', () => {

      it('should get the child menu of the menu', () => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(0, 0);
        menu.activeIndex = 10;
        menu.openActiveItem();
        expect(menu.childMenu).to.be(menu.items[10].submenu);
        menu.dispose();
      });

      it('should null if the menu does not have an open submenu', () => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
        expect(menu.childMenu).to.be(null);
      });

    });

    describe('#rootMenu', () => {

      it('should find the root menu of this menu hierarchy', () => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(0, 0);
        expect(menu.rootMenu).to.be(menu);
        menu.activeIndex = 10;
        menu.openActiveItem();
        expect(menu.items[10].submenu.rootMenu).to.be(menu);
        menu.dispose();
      });

    });

    describe('#leafMenu', () => {

      it('should find the root menu of this menu hierarchy', () => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(0, 0);
        expect(menu.leafMenu).to.be(menu);
        menu.activeIndex = 10;
        menu.openActiveItem();
        expect(menu.leafMenu).to.be(menu.items[10].submenu);
        menu.dispose();
      });

    });

    describe('#popup()', () => {

      it('should popup the menu at the specified location', () => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(10, 10);
        let rect = menu.node.getBoundingClientRect();
        expect(rect.left).to.be(10);
        expect(rect.top).to.be(10);
        menu.dispose();
      });

      it('should be adjusted to fit naturally on the screen', () => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(-1000, -1000);
        let rect = menu.node.getBoundingClientRect();
        expect(rect.left).to.be(0);
        expect(rect.top).to.be(0);
        menu.dispose();
      });

      it('should accept flags to force the location', () => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(10000, 10000, true, true);
        let rect = menu.node.getBoundingClientRect();
        expect(rect.left).to.be(10000);
        expect(rect.top).to.be(10000);
        menu.dispose();
      });

      it('should accept mouse and key presses', () => {
        let menu = new LogMenu();
        menu.popup(0, 0);
        triggerKeyEvent(document.body, 'keydown');
        triggerKeyEvent(document.body, 'keypress');
        triggerMouseEvent(document.body, 'mousedown');
        expect(menu.messages.indexOf('keydown')).to.not.be(-1);
        expect(menu.messages.indexOf('keypress')).to.not.be(-1);
        expect(menu.messages.indexOf('mousedown')).to.not.be(-1);
        menu.dispose();
      });

    });

    describe('#open()', () => {

      it('should open the menu at the specified location', () => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.open(10, 10);
        let rect = menu.node.getBoundingClientRect();
        expect(rect.left).to.be(10);
        expect(rect.top).to.be(10);
        menu.dispose();
      });

      it('should be adjusted to fit naturally on the screen', () => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.open(-1000, -1000);
        let rect = menu.node.getBoundingClientRect();
        expect(rect.left).to.be(0);
        expect(rect.top).to.be(0);
        menu.dispose();
      });

      it('should accept flags to force the location', () => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.open(10000, 10000, true, true);
        let rect = menu.node.getBoundingClientRect();
        expect(rect.left).to.be(10000);
        expect(rect.top).to.be(10000);
        menu.dispose();
      });

      it('should ignore mouse and key presses', () => {
        let menu = new LogMenu();
        menu.open(0, 0);
        triggerKeyEvent(document.body, 'keydown');
        triggerKeyEvent(document.body, 'keypress');
        triggerMouseEvent(document.body, 'mousedown');
        expect(menu.messages.indexOf('keydown')).to.be(-1);
        expect(menu.messages.indexOf('keypress')).to.be(-1);
        expect(menu.messages.indexOf('mousedown')).to.be(-1);
        menu.dispose();
      });

    });

    describe('#onItemsChanged()', () => {

      it('should be invoked when the menu items change', () => {
        let menu = LogMenu.fromTemplate(MENU_TEMPLATE);
        menu.items = [];
        expect(menu.messages.indexOf('onItemsChanged')).to.not.be(-1);
      });

      it('should close the menu', () => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(0, 0);
        expect(menu.isAttached).to.be(true);
        menu.items = [];
        expect(menu.isAttached).to.be(false);
        menu.dispose();
      });

    });

    describe('#onActiveIndexChanged()', () => {

      it('should be invoked when the active index changes', () => {
        let menu = LogMenu.fromTemplate(MENU_TEMPLATE);
        menu.activeIndex = 0;
        expect(menu.messages.indexOf('onActiveIndexChanged')).to.not.be(-1);
      });

    });

    describe('#onOpenItem()', () => {

      it('should be invoked when a menu item should be opened', () => {
        let menu = LogMenu.fromTemplate(MENU_TEMPLATE);
        menu.open(1, 1);
        menu.activeIndex = 10;
        menu.openActiveItem();
        expect(menu.messages.indexOf('onOpenItem')).to.not.be(-1);
        menu.dispose();
      });

      it('should open the child menu and activate the first item', () => {
        let menu = LogMenu.fromTemplate(MENU_TEMPLATE);
        menu.open(1, 1);
        menu.activeIndex = 10;
        menu.openActiveItem();
        expect(menu.childMenu).to.be(menu.items[10].submenu);
        expect(menu.items[10].submenu.activeIndex).to.be(0);
        menu.dispose();
      });

    });

    describe('#onTriggerItem()', () => {

      it('should close the root menu', () => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(0, 0);
        menu.activeIndex = 10;
        menu.openActiveItem();
        menu.childMenu.triggerActiveItem();
        expect(menu.isAttached).to.be(false);
        menu.dispose();
      });

      it('should call the item handler', () => {
        let called = false;
        let menu = Menu.fromTemplate([{ handler: () => { called = true; } }]);
        menu.popup(0, 0);
        menu.activateNextItem();
        menu.triggerActiveItem();
        expect(called).to.be(true);
        menu.dispose();
      });

    });

    describe('#onUpdateRequest()', () => {

      it('should be invoked on `open`', () => {
        let menu = new LogMenu();
        menu.open(0, 0);
        expect(menu.messages.indexOf('onUpdateRequest')).to.not.be(-1);
        menu.dispose();
      });

      it('should be invoked on `popup`', () => {
        let menu = new LogMenu();
        menu.popup(0, 0);
        expect(menu.messages.indexOf('onUpdateRequest')).to.not.be(-1);
        menu.dispose();
      });

      it('should generate the menu content', () => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
        expect(menu.contentNode.childNodes.length).to.be(0);
        menu.popup(0, 0);
        expect(menu.contentNode.childNodes.length).to.be(13);
        menu.dispose();
      });

    });

    describe('#onCloseRequest()', () => {

      it('should be invoked when a menu is closed', () => {
        let menu = new LogMenu();
        menu.popup(0, 0);
        menu.close();
        expect(menu.messages.indexOf('onCloseRequest')).to.not.be(-1);
        menu.dispose();
      });

      it('should detach the widget from the DOM', () => {
        let menu = new Menu();
        menu.popup(0, 0);
        expect(menu.isAttached).to.be(true);
        menu.close();
        expect(menu.isAttached).to.be(false);
        menu.dispose();
      });

    });

    context('key handling', () => {

      it('should trigger the active item on `Enter`', () => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
        let called = false;
        menu.items[0].handler = () => { called = true; };
        menu.popup(0, 0);
        menu.activateNextItem();
        triggerKeyEvent(document.body, 'keydown', { keyCode: 13 });
        expect(called).to.be(true);
        menu.dispose();
      });

      it('should close the leaf menu on `Escape`', () => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(0, 0);
        menu.activeIndex = 10;
        menu.openActiveItem();
        expect(menu.childMenu).to.be(menu.items[10].submenu);
        triggerKeyEvent(document.body, 'keydown', { keyCode: 27 });
        expect(menu.childMenu).to.be(null);
        menu.dispose();
      });

      it('should close the leaf menu on `ArrowLeft` unless root', () => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(0, 0);
        menu.activeIndex = 10;
        menu.openActiveItem();
        expect(menu.childMenu).to.be(menu.items[10].submenu);
        triggerKeyEvent(document.body, 'keydown', { keyCode: 37 });
        expect(menu.childMenu).to.be(null);
        triggerKeyEvent(document.body, 'keydown', { keyCode: 37 });
        expect(menu.isAttached).to.be(true);
        menu.dispose();
      });

      it('should activate the previous item on `ArrowUp`', () => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(0, 0);
        menu.activeIndex = 1;
        triggerKeyEvent(document.body, 'keydown', { keyCode: 38 });
        expect(menu.activeIndex).to.be(0);
        menu.dispose();
      });

      it('should open the active item on `ArrowRight`', () => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(0, 0);
        menu.activeIndex = 10;
        expect(menu.childMenu).to.be(null);
        triggerKeyEvent(document.body, 'keydown', { keyCode: 39 });
        expect(menu.childMenu).to.be(menu.items[10].submenu);
        menu.dispose();
      });

      it('should activate the next item on `ArrowDown`', () => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(0, 0);
        menu.activateNextItem();
        expect(menu.activeIndex).to.be(0);
        triggerKeyEvent(document.body, 'keydown', { keyCode: 40 });
        expect(menu.activeIndex).to.be(1);
        menu.dispose();
      });

      it('should activate an item based on a mnemonic', () => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(0, 0);
        expect(menu.activeIndex).to.be(-1);
        triggerKeyEvent(document.body, 'keypress', { charCode: 84 } );  // 't' key
        expect(menu.activeIndex).to.be(1);
        menu.dispose();
      });

    });

    context('mouse handling', () => {

      it('should close the child menu on mouse over of different item', (done) => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(0, 0);
        menu.activeIndex = 10;
        menu.openActiveItem();
        let node = menu.contentNode.firstChild as HTMLElement;
        triggerMouseEvent(node, 'mouseenter');
        setTimeout(() => {
          expect(menu.childMenu).to.be(null);
          menu.dispose();
          done();
        }, 500);
      });

      it('should cancel the close on mouse enter of same item', (done) => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(0, 0);
        menu.activeIndex = 10;
        menu.openActiveItem();
        let node0 = menu.contentNode.firstChild as HTMLElement;
        let node1 = menu.contentNode.childNodes[10] as HTMLElement;
        triggerMouseEvent(node0, 'mouseenter');
        triggerMouseEvent(node1, 'mouseenter');
        setTimeout(() => {
          expect(menu.childMenu).to.not.be(null);
          menu.dispose();
          done();
        }, 500);
      });

      it('should trigger the item on mouse over and click', () => {
        let menu = Menu.fromTemplate(MENU_TEMPLATE);
        menu.popup(0, 0);
        menu.activeIndex = 10;
        menu.openActiveItem();
        let called = false;
        menu.childMenu.items[0].handler = () => { called = true; };
        let node = menu.childMenu.contentNode.childNodes[0] as HTMLElement;
        triggerMouseEvent(node, 'mouseenter');
        triggerMouseEvent(node, 'mouseup');
        expect(called).to.be(true);
        menu.dispose();
      });

    });

  });

});
