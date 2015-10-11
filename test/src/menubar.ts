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
  attachWidget
} from 'phosphor-widget';

import {
  IMenuItemTemplate, MenuBar, MenuItem
} from '../../lib/index';


function createMenuItem(template: IMenuItemTemplate): MenuItem {
  return MenuItem.fromTemplate(template);
}


class LogMenuBar extends MenuBar {

  messages: string[] = [];

  static fromTemplate(array: IMenuItemTemplate[]): LogMenuBar {
    var bar = new LogMenuBar();
    bar.items = array.map(createMenuItem);
    return bar;
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


var MENU_BAR_TEMPLATE = [
  {
    text: 'File',
    submenu: [
      {
        text: 'New File',
        shortcut: 'Ctrl+N',
      },
      {
        text: 'Open File',
        type: 'check',
        checked: true,
        shortcut: 'Ctrl+O',
      },
      {
        text: '&Save File',
        shortcut: 'Ctrl+S',
      },
      {
        text: 'Save As...',
        hidden: true,
        shortcut: 'Ctrl+Shift+S',
      },
      {
        type: 'separator'
      },
      {
        text: 'Close File',
        shortcut: 'Ctrl+W',
      },
      {
        text: 'Close All Files',
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
        text: 'Exit',
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
      },
      {
        text: '&Repeat',
        shortcut: 'Ctrl+Y',
        className: 'repeat',
      },
      {
        type: 'separator'
      },
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
      }
    ]
  },
  {
    text: 'Find',
    submenu: [
      {
        text: 'Find...',
        shortcut: 'Ctrl+F',
      },
      {
        text: 'Find Next',
        shortcut: 'F3',
      },
      {
        text: 'Find Previous',
        shortcut: 'Shift+F3',
      },
      {
        type: 'separator'
      },
      {
        text: 'Replace...',
        shortcut: 'Ctrl+H',
      },
      {
        text: 'Replace Next',
        shortcut: 'Ctrl+Shift+H',
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
      },
      {
        text: 'About',
      }
    ]
  }
];


describe('phosphor-menus', () => {

  describe('MenuBar', () => {

    describe('.p_MenuBar', () => {

      it('should equal `p-MenuBar`', () => {
        expect(MenuBar.p_MenuBar).to.be('p-MenuBar');
      });

    });

    describe('.p_MenuBar_content', () => {

      it('should equal `p-Menu-content`', () => {
        expect(MenuBar.p_MenuBar_content).to.be('p-MenuBar-content');
      });

    });

    describe('.p_MenuBar_item', () => {

      it('should equal `p-Menu-item`', () => {
        expect(MenuBar.p_MenuBar_item).to.be('p-MenuBar-item');
      });

    });

    describe('.p_MenuBar_item_icon', () => {

      it('should equal `p-Menu-item-icon`', () => {
        expect(MenuBar.p_MenuBar_item_icon).to.be('p-MenuBar-item-icon');
      });

    });

    describe('.p_MenuBar_item_text', () => {

      it('should equal `p-Menu-item-text`', () => {
        expect(MenuBar.p_MenuBar_item_text).to.be('p-MenuBar-item-text');
      });

    });

    describe('.p_mod_separator_type', () => {

      it('should equal `p-mod-separator-type`', () => {
        expect(MenuBar.p_mod_separator_type).to.be('p-mod-separator-type');
      });

    });

    describe('.p_mod_active', () => {

      it('should equal `p-mod-active`', () => {
        expect(MenuBar.p_mod_active).to.be('p-mod-active');
      });

    });

    describe('.p_mod_disabled', () => {

      it('should equal `p-mod-disabled`', () => {
        expect(MenuBar.p_mod_disabled).to.be('p-mod-disabled');
      });

    });

    describe('.p_mod_force_hidden', () => {

      it('should equal `p-mod-force-hidden`', () => {
        expect(MenuBar.p_mod_force_hidden).to.be('p-mod-force-hidden');
      });

    });

    describe('.fromTemplate', () => {

      it('should create a menu bar from a template', () => {
        var bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        expect(bar instanceof MenuBar).to.be(true);
        expect(bar.items.length).to.be(6);
      });

    });

    describe('#constructor()', () => {

      it('should accept no arguments', () => {
        var bar = new MenuBar();
        expect(bar instanceof MenuBar).to.be(true);
      });

      it('should add the `p-MenuBar` class', () => {
        var bar = new MenuBar();
        expect(bar.hasClass(MenuBar.p_MenuBar)).to.be(true);
      });

    });

    describe('#dispose()', () => {

      it('should dispose of the resources held by the menu', () => {
        var bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        bar.dispose();
        expect(bar.items.length).to.be(0);
      });

    });

    describe('#childMenu', () => {

      it('should get the child menu of the menu', () => {
        var bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        bar.activeIndex = 0;
        bar.openActiveItem();
        expect(bar.childMenu).to.be(bar.items[0].submenu);
        bar.childMenu.close(true);
      });

      it('should null if the menu does not have an open submenu', () => {
        var bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        expect(bar.childMenu).to.be(null);
      });

    });

    describe('#onItemsChanged()', () => {

      it('should be invoked when the menu items change', () => {
        var bar = LogMenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        bar.items = [];
        expect(bar.messages.indexOf('onItemsChanged')).to.not.be(-1);
      });

    });

    describe('#onActiveIndexChanged()', () => {

      it('should be invoked when the active index changes', () => {
        var bar = LogMenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        bar.activeIndex = 0;
        expect(bar.messages.indexOf('onActiveIndexChanged')).to.not.be(-1);
      });

    });

    describe('#onOpenItem()', () => {

      it('should be invoked when a menu item should be opened', () => {
        var bar = LogMenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        bar.activateNextItem();
        bar.openActiveItem();
        expect(bar.messages.indexOf('onOpenItem')).to.not.be(-1);
        bar.childMenu.close(true);
      });

      it('should open the child menu', () => {
        var bar = LogMenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        bar.activateNextItem();
        bar.openActiveItem();
        expect(bar.messages.indexOf('onOpenItem')).to.not.be(-1);
        expect(bar.childMenu).to.be(bar.items[0].submenu);
        bar.childMenu.close(true);
      });

    });

    describe('#onUpdateRequest()', () => {

      it('should create the menu bar', () => {
        var bar = LogMenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        attachWidget(bar, document.body);
        expect(bar.messages.indexOf('onUpdateRequest')).to.not.be(-1);
        var children = bar.node.firstChild.childNodes;
        expect(children.length).to.be(MENU_BAR_TEMPLATE.length);
        bar.close(true);
      });

    });

    describe('#onCloseRequest()', () => {

      it('should detach the widget from the DOM', () => {
        var bar = LogMenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        attachWidget(bar, document.body);
        bar.close(true);
        expect(bar.isAttached).to.be(false);
        expect(bar.messages.indexOf('onCloseRequest')).to.not.be(-1);
      });

    });

    context('key handling', () => {

      it('should trigger the active item on `Enter`', (done) => {
        var bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        attachWidget(bar, document.body);
        bar.activateNextItem();
        bar.openActiveItem();
        var called = false;
        bar.childMenu.activateNextItem();
        bar.childMenu.items[0].handler = () => { called = true; };
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keydown', { keyCode: 13 });
          expect(called).to.be(true);
          bar.close(true);
          done();
        }, 0);
      });

      it('should close the leaf menu on `Escape`', (done) => {
        var bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        attachWidget(bar, document.body);
        bar.activateNextItem();
        bar.openActiveItem();
        bar.childMenu.activateNextItem();
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keydown', { keyCode: 27 });
          expect(bar.childMenu).to.be(null);
          bar.close(true);
          done();
        }, 0);
      });

      it('should open the previous menu on `ArrowLeft`', (done) => {
        var bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        attachWidget(bar, document.body);
        bar.activateNextItem();
        bar.openActiveItem();
        bar.childMenu.activateNextItem();
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keydown', { keyCode: 37 });
          expect(bar.childMenu).to.be(bar.items[5].submenu);
          bar.close(true);
          done();
        });
      });

      it('should close a sub menu on `ArrowLeft`', (done) => {
        var bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        attachWidget(bar, document.body);
        bar.activeIndex = 0;
        bar.openActiveItem();
        bar.childMenu.activeIndex = 8;
        bar.childMenu.openActiveItem();
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keydown', { keyCode: 37 });
          expect(bar.childMenu.childMenu).to.be(null);
          bar.close(true);
          done();
        });
      });

      it('should activate the previous menu item on `ArrowUp`', (done) => {
        var bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        attachWidget(bar, document.body);
        bar.activateNextItem();
        bar.openActiveItem();
        bar.childMenu.activateNextItem();
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keydown', { keyCode: 38 });
          expect(bar.childMenu.activeIndex).to.be(10);
          bar.close(true);
          done();
        }, 0);
      });

      it('should open a sub menu on `ArrowRight`', (done) => {
        var bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        attachWidget(bar, document.body);
        bar.activeIndex = 0;
        bar.openActiveItem();
        bar.childMenu.leafMenu.activeIndex = 8;
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keydown', { keyCode: 39 });
          expect(bar.childMenu.childMenu).to.not.be(null);
          bar.close(true);
          done();
        }, 0);
      });

      it('should open next menu on `ArrowRight`', (done) => {
        var bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        attachWidget(bar, document.body);
        bar.activateNextItem();
        bar.openActiveItem();
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keydown', { keyCode: 39 });
          expect(bar.childMenu).to.be(bar.items[1].submenu);
          bar.close(true);
          done();
        }, 0);
      });

      it('should activate the next menu item on `ArrowDown`', (done) => {
        var bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        attachWidget(bar, document.body);
        bar.activateNextItem();
        bar.openActiveItem();
        bar.childMenu.activateNextItem();
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keydown', { keyCode: 40 });
          expect(bar.childMenu.activeIndex).to.be(1);
          bar.close(true);
          done();
        }, 0);
      });

      it('should activate an item based on mnemonic', (done) => {
        var bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        attachWidget(bar, document.body);
        bar.activeIndex = 0;
        bar.openActiveItem();
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keypress', { charCode: 83 } );  // 's' key
          expect(bar.childMenu.activeIndex).to.be(2);
          bar.close(true);
          done();
        }, 0);
      });

    });

    context('mouse handling', () => {

      it('should trigger the item on mouse over and click', () => {
        var bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        attachWidget(bar, document.body);
        bar.activeIndex = 1;
        bar.openActiveItem();
        bar.childMenu.activeIndex = 0;
        var checked = false;
        bar.childMenu.items[0].handler = () => { checked = true; };
        var node = bar.childMenu.node.firstChild.firstChild as HTMLElement;
        triggerMouseEvent(node, 'mouseenter');
        triggerMouseEvent(node, 'mousedown');
        triggerMouseEvent(node, 'mouseup');
        expect(checked).to.be(true);
        bar.close(true);
      });

      it('should open the submenu', () => {
        var bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        attachWidget(bar, document.body);
        var node = bar.node.firstChild.firstChild as HTMLElement;
        var rect = node.getBoundingClientRect();
        var args = { clientX: rect.left + 1, clientY: rect.top + 1 };
        triggerMouseEvent(node, 'mousedown', args);
        expect(bar.activeIndex).to.be(0);
        expect(bar.childMenu).to.be(bar.items[0].submenu);
        bar.close(true);
      });

      it('should close the submenu on an external mousedown', (done) => {
        var bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        attachWidget(bar, document.body);
        bar.activeIndex = 0;
        bar.openActiveItem();
        expect(bar.childMenu).to.be(bar.items[0].submenu);
        setTimeout(() => {
          var args = { clientX: -10, clientY: -10 };
          triggerMouseEvent(document.body, 'mousedown', args);
          expect(bar.childMenu).to.be(null);
          bar.close(true);
          done();
        }, 0);
      });

      it('should open a new submenu', (done) => {
        var bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        attachWidget(bar, document.body);
        var node = bar.node.firstChild.firstChild as HTMLElement;
        var rect = node.getBoundingClientRect();
        var args = { clientX: rect.left + 1, clientY: rect.top + 1 };
        triggerMouseEvent(node, 'mousedown', args);
        setTimeout(() => {
          node = bar.node.firstChild.childNodes[1] as HTMLElement;
          rect = node.getBoundingClientRect();
          args = { clientX: rect.left + 1, clientY: rect.top + 1 };
          triggerMouseEvent(bar.node, 'mousemove', args);
          expect(bar.childMenu).to.be(bar.items[1].submenu);
          bar.close(true);
          done();
        }, 0);
      });

    });

  });

});
