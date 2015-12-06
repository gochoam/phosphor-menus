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
  DelegateCommand
} from 'phosphor-command';

import {
  Message, sendMessage
} from 'phosphor-messaging';

import {
  Widget
} from 'phosphor-widget';

import {
  Menu, MenuBar, MenuItem
} from '../../lib/index';


class LogMenuBar extends MenuBar {

  messages: string[] = [];

  constructor(items?: MenuItem[]) {
    super();
    if (items) this.items = items;
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


function createMenuBar(): LogMenuBar {
  let cmd = new DelegateCommand(() => { });
  return new LogMenuBar([
    new MenuItem({
      text: 'File',
      submenu: new Menu([
        new MenuItem({
          text: 'New File',
          shortcut: 'Ctrl+N',
          command: cmd
        }),
        new MenuItem({
          text: 'Open File',
          type: MenuItem.Check,
          shortcut: 'Ctrl+O',
          command: cmd
        }),
        new MenuItem({
          text: '&Save File',
          shortcut: 'Ctrl+S',
          command: cmd
        }),
        new MenuItem({
          text: 'Save As...',
          shortcut: 'Ctrl+Shift+S',
          command: cmd
        }),
        new MenuItem({
          type: MenuItem.Separator
        }),
        new MenuItem({
          text: 'Close File',
          shortcut: 'Ctrl+W',
          command: cmd
        }),
        new MenuItem({
          text: 'Close All Files',
          command: cmd
        }),
        new MenuItem({
          type: MenuItem.Separator
        }),
        new MenuItem({
          text: 'More...',
          submenu: new Menu([
            new MenuItem({
              text: 'One',
              command: cmd
            }),
            new MenuItem({
              text: 'Two',
              command: cmd
            }),
            new MenuItem({
              text: 'Three',
              command: cmd
            }),
            new MenuItem({
              text: 'Four',
              command: cmd
            })
          ])
        }),
        new MenuItem({
          type: MenuItem.Separator
        }),
        new MenuItem({
          text: 'Exit',
          command: cmd
        })
      ])
    }),
    new MenuItem({
      text: 'Edit',
      submenu: new Menu([
        new MenuItem({
          text: '&Undo',
          shortcut: 'Ctrl+Z',
          className: 'undo',
          command: cmd
        }),
        new MenuItem({
          text: '&Repeat',
          shortcut: 'Ctrl+Y',
          className: 'repeat',
          command: cmd
        }),
        new MenuItem({
          type: MenuItem.Separator
        }),
        new MenuItem({
          text: '&Copy',
          shortcut: 'Ctrl+C',
          className: 'copy',
          command: cmd
        }),
        new MenuItem({
          text: 'Cu&t',
          shortcut: 'Ctrl+X',
          className: 'cut',
          command: cmd
        }),
        new MenuItem({
          text: '&Paste',
          shortcut: 'Ctrl+V',
          className: 'paste',
          command: cmd
        })
      ])
    }),
    new MenuItem({
      text: 'Find',
      submenu: new Menu([
        new MenuItem({
          text: 'Find...',
          shortcut: 'Ctrl+F',
          command: cmd
        }),
        new MenuItem({
          text: 'Find Next',
          shortcut: 'F3',
          command: cmd
        }),
        new MenuItem({
          text: 'Find Previous',
          shortcut: 'Shift+F3',
          command: cmd
        }),
        new MenuItem({
          type: MenuItem.Separator
        }),
        new MenuItem({
          text: 'Replace...',
          shortcut: 'Ctrl+H',
          command: cmd
        }),
        new MenuItem({
          text: 'Replace Next',
          shortcut: 'Ctrl+Shift+H',
          command: cmd
        })
      ])
    }),
    new MenuItem({
      type: MenuItem.Separator
    }),
    new MenuItem({
      text: 'Help',
      submenu: new Menu([
        new MenuItem({
          text: 'Documentation',
          command: cmd
        }),
        new MenuItem({
          text: 'About',
          command: cmd
        })
      ])
    })
  ]);
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


describe('phosphor-menus', () => {

  describe('MenuBar', () => {

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
        let bar = createMenuBar();
        bar.dispose();
        expect(bar.items.length).to.be(0);
      });

    });

    describe('#childMenu', () => {

      it('should get the child menu of the menu', () => {
        let bar = createMenuBar();
        Widget.attach(bar, document.body);
        bar.activeIndex = 0;
        bar.openActiveItem();
        expect(bar.childMenu).to.be(bar.items[0].submenu);
        bar.dispose();
      });

      it('should null if the menu does not have an open submenu', () => {
        let bar = createMenuBar();
        expect(bar.childMenu).to.be(null);
      });

    });

    describe('#onItemsChanged()', () => {

      it('should be invoked when the menu items change', () => {
        let bar = createMenuBar();
        bar.items = [];
        expect(bar.messages.indexOf('onItemsChanged')).to.not.be(-1);
      });

    });

    describe('#onActiveIndexChanged()', () => {

      it('should be invoked when the active index changes', () => {
        let bar = createMenuBar();
        bar.activeIndex = 0;
        expect(bar.messages.indexOf('onActiveIndexChanged')).to.not.be(-1);
      });

    });

    describe('#onOpenItem()', () => {

      it('should be invoked when a menu item should be opened', () => {
        let bar = createMenuBar();
        Widget.attach(bar, document.body);
        bar.activateNextItem();
        bar.openActiveItem();
        expect(bar.messages.indexOf('onOpenItem')).to.not.be(-1);
        bar.dispose();
      });

      it('should open the child menu', () => {
        let bar = createMenuBar();
        Widget.attach(bar, document.body);
        bar.activateNextItem();
        bar.openActiveItem();
        expect(bar.messages.indexOf('onOpenItem')).to.not.be(-1);
        expect(bar.childMenu).to.be(bar.items[0].submenu);
        bar.dispose();
      });

    });

    describe('#onUpdateRequest()', () => {

      it('should create the menu bar', (done) => {
        let bar = createMenuBar();
        Widget.attach(bar, document.body);
        expect(bar.messages.indexOf('onUpdateRequest')).to.be(-1);
        requestAnimationFrame(() => {
          expect(bar.messages.indexOf('onUpdateRequest')).to.not.be(-1);
          let children = bar.contentNode.childNodes;
          expect(children.length).to.be(bar.items.length);
          bar.dispose();
          done();
        });
      });

    });

    describe('#onCloseRequest()', () => {

      it('should detach the widget from the DOM', () => {
        let bar = createMenuBar();
        Widget.attach(bar, document.body);
        bar.close();
        expect(bar.messages.indexOf('onCloseRequest')).to.not.be(-1);
        expect(bar.isAttached).to.be(false);
        bar.dispose();
      });

    });

    context('key handling', () => {

      it('should trigger the active item on `Enter`', (done) => {
        let bar = createMenuBar();
        Widget.attach(bar, document.body);
        bar.activateNextItem();
        bar.openActiveItem();
        let called = false;
        let cmd = new DelegateCommand(() => { called = true; });
        bar.childMenu.items[0].command = cmd;
        bar.childMenu.activateNextItem();
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keydown', { keyCode: 13 });
          expect(called).to.be(true);
          bar.close();
          done();
        }, 0);
      });

      it('should close the leaf menu on `Escape`', (done) => {
        let bar = createMenuBar();
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
        let bar = createMenuBar();
        Widget.attach(bar, document.body);
        bar.activateNextItem();
        bar.openActiveItem();
        bar.childMenu.activateNextItem();
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keydown', { keyCode: 37 });
          expect(bar.childMenu).to.be(bar.items[4].submenu);
          bar.close();
          done();
        });
      });

      it('should close a sub menu on `ArrowLeft`', (done) => {
        let bar = createMenuBar();
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
        let bar = createMenuBar();
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
        let bar = createMenuBar();
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
        let bar = createMenuBar();
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
        let bar = createMenuBar();
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
        let bar = createMenuBar();
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
        let bar = createMenuBar();
        Widget.attach(bar, document.body);
        sendMessage(bar, Widget.MsgUpdateRequest);
        bar.activeIndex = 1;
        bar.openActiveItem();
        bar.childMenu.activeIndex = 0;
        let called = false;
        let cmd = new DelegateCommand(() => { called = true; });
        bar.childMenu.items[0].command = cmd;
        let node = bar.childMenu.contentNode.firstChild as HTMLElement;
        triggerMouseEvent(node, 'mouseenter');
        triggerMouseEvent(node, 'mousedown');
        triggerMouseEvent(node, 'mouseup');
        expect(called).to.be(true);
        bar.close();
      });

      it('should open the submenu', () => {
        let bar = createMenuBar();
        Widget.attach(bar, document.body);
        sendMessage(bar, Widget.MsgUpdateRequest);
        let node = bar.contentNode.firstChild as HTMLElement;
        let rect = node.getBoundingClientRect();
        let args = { clientX: rect.left + 1, clientY: rect.top + 1 };
        triggerMouseEvent(node, 'mousedown', args);
        expect(bar.activeIndex).to.be(0);
        expect(bar.childMenu).to.be(bar.items[0].submenu);
        bar.dispose();
      });

      it('should close the submenu on an external mousedown', (done) => {
        let bar = createMenuBar();
        Widget.attach(bar, document.body);
        sendMessage(bar, Widget.MsgUpdateRequest);
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
        let bar = createMenuBar();
        Widget.attach(bar, document.body);
        sendMessage(bar, Widget.MsgUpdateRequest);
        let node = bar.contentNode.firstChild as HTMLElement;
        let rect = node.getBoundingClientRect();
        let args = { clientX: rect.left + 1, clientY: rect.top + 1 };
        triggerMouseEvent(node, 'mousedown', args);
        setTimeout(() => {
          node = bar.contentNode.childNodes[1] as HTMLElement;
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
