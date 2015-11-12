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
  Widget
} from 'phosphor-widget';

import {
  IMenuItemTemplate, MenuBar, MenuItem
} from '../../lib/index';


class LogMenuBar extends MenuBar {

  messages: string[] = [];

  static fromTemplate(array: IMenuItemTemplate[]): LogMenuBar {
    let items = array.map(templ => MenuItem.fromTemplate(templ));
    let bar = new LogMenuBar();
    bar.items = items;
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


let MENU_BAR_TEMPLATE = [
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

    describe('.fromTemplate', () => {

      it('should create a menu bar from a template', () => {
        let bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        expect(bar instanceof MenuBar).to.be(true);
        expect(bar.items.length).to.be(6);
      });

    });

    describe('#constructor()', () => {

      it('should accept no arguments', () => {
        let bar = new MenuBar();
        expect(bar instanceof MenuBar).to.be(true);
      });

      it('should add the `p-MenuBar` class', () => {
        let bar = new MenuBar();
        expect(bar.hasClass('p-MenuBar')).to.be(true);
      });

    });

    describe('#dispose()', () => {

      it('should dispose of the resources held by the menu', () => {
        let bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        bar.dispose();
        expect(bar.items.length).to.be(0);
      });

    });

    describe('#childMenu', () => {

      it('should get the child menu of the menu', () => {
        let bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        bar.activeIndex = 0;
        bar.openActiveItem();
        expect(bar.childMenu).to.be(bar.items[0].submenu);
        bar.childMenu.close();
      });

      it('should null if the menu does not have an open submenu', () => {
        let bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        expect(bar.childMenu).to.be(null);
      });

    });

    describe('#onItemsChanged()', () => {

      it('should be invoked when the menu items change', () => {
        let bar = LogMenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        bar.items = [];
        expect(bar.messages.indexOf('onItemsChanged')).to.not.be(-1);
      });

    });

    describe('#onActiveIndexChanged()', () => {

      it('should be invoked when the active index changes', () => {
        let bar = LogMenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        bar.activeIndex = 0;
        expect(bar.messages.indexOf('onActiveIndexChanged')).to.not.be(-1);
      });

    });

    describe('#onOpenItem()', () => {

      it('should be invoked when a menu item should be opened', () => {
        let bar = LogMenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        bar.activateNextItem();
        bar.openActiveItem();
        expect(bar.messages.indexOf('onOpenItem')).to.not.be(-1);
        bar.childMenu.close();
      });

      it('should open the child menu', () => {
        let bar = LogMenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        bar.activateNextItem();
        bar.openActiveItem();
        expect(bar.messages.indexOf('onOpenItem')).to.not.be(-1);
        expect(bar.childMenu).to.be(bar.items[0].submenu);
        bar.childMenu.close();
      });

    });

    describe('#onUpdateRequest()', () => {

      it('should create the menu bar', () => {
        let bar = LogMenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        Widget.attach(bar, document.body);
        expect(bar.messages.indexOf('onUpdateRequest')).to.not.be(-1);
        let children = bar.node.firstChild.childNodes;
        expect(children.length).to.be(MENU_BAR_TEMPLATE.length);
        bar.close();
      });

    });

    describe('#onCloseRequest()', () => {

      it('should detach the widget from the DOM', (done) => {
        let bar = LogMenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        Widget.attach(bar, document.body);
        bar.close();
        setTimeout(() => {
          expect(bar.isAttached).to.be(false);
          expect(bar.messages.indexOf('onCloseRequest')).to.not.be(-1);
          done();
        }, 0);
      });

    });

    context('key handling', () => {

      it('should trigger the active item on `Enter`', (done) => {
        let bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        Widget.attach(bar, document.body);
        bar.activateNextItem();
        bar.openActiveItem();
        let called = false;
        bar.childMenu.activateNextItem();
        bar.childMenu.items[0].handler = () => { called = true; };
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keydown', { keyCode: 13 });
          expect(called).to.be(true);
          bar.close();
          done();
        }, 0);
      });

      it('should close the leaf menu on `Escape`', (done) => {
        let bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        Widget.attach(bar, document.body);
        bar.activateNextItem();
        bar.openActiveItem();
        bar.childMenu.activateNextItem();
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keydown', { keyCode: 27 });
          expect(bar.childMenu).to.be(null);
          bar.close();
          done();
        }, 0);
      });

      it('should open the previous menu on `ArrowLeft`', (done) => {
        let bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        Widget.attach(bar, document.body);
        bar.activateNextItem();
        bar.openActiveItem();
        bar.childMenu.activateNextItem();
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keydown', { keyCode: 37 });
          expect(bar.childMenu).to.be(bar.items[5].submenu);
          bar.close();
          done();
        });
      });

      it('should close a sub menu on `ArrowLeft`', (done) => {
        let bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        Widget.attach(bar, document.body);
        bar.activeIndex = 0;
        bar.openActiveItem();
        bar.childMenu.activeIndex = 8;
        bar.childMenu.openActiveItem();
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keydown', { keyCode: 37 });
          expect(bar.childMenu.childMenu).to.be(null);
          bar.close();
          done();
        });
      });

      it('should activate the previous menu item on `ArrowUp`', (done) => {
        let bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        Widget.attach(bar, document.body);
        bar.activateNextItem();
        bar.openActiveItem();
        bar.childMenu.activateNextItem();
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keydown', { keyCode: 38 });
          expect(bar.childMenu.activeIndex).to.be(10);
          bar.close();
          done();
        }, 0);
      });

      it('should open a sub menu on `ArrowRight`', (done) => {
        let bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        Widget.attach(bar, document.body);
        bar.activeIndex = 0;
        bar.openActiveItem();
        bar.childMenu.leafMenu.activeIndex = 8;
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keydown', { keyCode: 39 });
          expect(bar.childMenu.childMenu).to.not.be(null);
          bar.close();
          done();
        }, 0);
      });

      it('should open next menu on `ArrowRight`', (done) => {
        let bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        Widget.attach(bar, document.body);
        bar.activateNextItem();
        bar.openActiveItem();
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keydown', { keyCode: 39 });
          expect(bar.childMenu).to.be(bar.items[1].submenu);
          bar.close();
          done();
        }, 0);
      });

      it('should activate the next menu item on `ArrowDown`', (done) => {
        let bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        Widget.attach(bar, document.body);
        bar.activateNextItem();
        bar.openActiveItem();
        bar.childMenu.activateNextItem();
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keydown', { keyCode: 40 });
          expect(bar.childMenu.activeIndex).to.be(1);
          bar.close();
          done();
        }, 0);
      });

      it('should activate an item based on mnemonic', (done) => {
        let bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        Widget.attach(bar, document.body);
        bar.activeIndex = 0;
        bar.openActiveItem();
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keypress', { charCode: 83 } );  // 's' key
          expect(bar.childMenu.activeIndex).to.be(2);
          bar.close();
          done();
        }, 0);
      });

    });

    context('mouse handling', () => {

      it('should trigger the item on mouse over and click', () => {
        let bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        Widget.attach(bar, document.body);
        bar.activeIndex = 1;
        bar.openActiveItem();
        bar.childMenu.activeIndex = 0;
        let checked = false;
        bar.childMenu.items[0].handler = () => { checked = true; };
        let node = bar.childMenu.node.firstChild.firstChild as HTMLElement;
        triggerMouseEvent(node, 'mouseenter');
        triggerMouseEvent(node, 'mousedown');
        triggerMouseEvent(node, 'mouseup');
        expect(checked).to.be(true);
        bar.close();
      });

      it('should open the submenu', () => {
        let bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        Widget.attach(bar, document.body);
        let node = bar.node.firstChild.firstChild as HTMLElement;
        let rect = node.getBoundingClientRect();
        let args = { clientX: rect.left + 1, clientY: rect.top + 1 };
        triggerMouseEvent(node, 'mousedown', args);
        expect(bar.activeIndex).to.be(0);
        expect(bar.childMenu).to.be(bar.items[0].submenu);
        bar.close();
      });

      it('should close the submenu on an external mousedown', (done) => {
        let bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        Widget.attach(bar, document.body);
        bar.activeIndex = 0;
        bar.openActiveItem();
        expect(bar.childMenu).to.be(bar.items[0].submenu);
        setTimeout(() => {
          let args = { clientX: -10, clientY: -10 };
          triggerMouseEvent(document.body, 'mousedown', args);
          expect(bar.childMenu).to.be(null);
          bar.close();
          done();
        }, 0);
      });

      it('should open a new submenu', (done) => {
        let bar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
        Widget.attach(bar, document.body);
        let node = bar.node.firstChild.firstChild as HTMLElement;
        let rect = node.getBoundingClientRect();
        let args = { clientX: rect.left + 1, clientY: rect.top + 1 };
        triggerMouseEvent(node, 'mousedown', args);
        setTimeout(() => {
          node = bar.node.firstChild.childNodes[1] as HTMLElement;
          rect = node.getBoundingClientRect();
          args = { clientX: rect.left + 1, clientY: rect.top + 1 };
          triggerMouseEvent(bar.node, 'mousemove', args);
          expect(bar.childMenu).to.be(bar.items[1].submenu);
          bar.close();
          done();
        }, 0);
      });

    });

  });

});
