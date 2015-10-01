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
  attachWidget, Widget
} from 'phosphor-widget';

import {
  ACTIVE_CLASS, CONTENT_CLASS, DISABLED_CLASS, FORCE_HIDDEN_CLASS, 
  HIDDEN_CLASS, ICON_CLASS, MENU_CLASS, MENU_BAR_CLASS, MENU_ITEM_CLASS, 
  SEPARATOR_TYPE_CLASS, TEXT_CLASS, IMenuItemTemplate, Menu, MenuBar, MenuItem
} from '../../lib/index';

import './index.css';


function createMenuItem(template: IMenuItemTemplate): MenuItem {
  return MenuItem.fromTemplate(template);
}


class LogMenu extends MenuBar {

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


function triggerMouseEvent (node: HTMLElement, eventType: string, options: any={}) {
  options.bubbles = true;
  var clickEvent = new MouseEvent(eventType, options);
  node.dispatchEvent(clickEvent);
}


function triggerKeyEvent (node: HTMLElement, eventType: string, options: any={}) {
  options.bubbles = true;
  var clickEvent = new KeyboardEvent(eventType, options);
  node.dispatchEvent(clickEvent);
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
        text: '&Save File',
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

  describe('MENU_BAR_CLASS', () => {

    it('should equal `p-MenuBar`', () => {
      expect(MENU_BAR_CLASS).to.be('p-MenuBar');
    });

  });

  describe('CONTENT_CLASS', () => {

    it('should equal `p-Menu-content`', () => {
      expect(CONTENT_CLASS).to.be('p-Menu-content');
    });

  });

  describe('MENU_ITEM_CLASS', () => {

    it('should equal `p-Menu-item`', () => {
      expect(MENU_ITEM_CLASS).to.be('p-Menu-item');
    });

  });

  describe('ICON_CLASS', () => {

    it('should equal `p-Menu-item-icon`', () => {
      expect(ICON_CLASS).to.be('p-Menu-item-icon');
    });

  });

  describe('TEXT_CLASS', () => {

    it('should equal `p-Menu-item-text`', () => {
      expect(TEXT_CLASS).to.be('p-Menu-item-text');
    });

  });

  describe('SEPARATOR_TYPE_CLASS', () => {

    it('should equal `p-mod-separator-type`', () => {
      expect(SEPARATOR_TYPE_CLASS).to.be('p-mod-separator-type');
    });

  });

  describe('ACTIVE_CLASS', () => {

    it('should equal `p-mod-active`', () => {
      expect(ACTIVE_CLASS).to.be('p-mod-active');
    });

  });

  describe('DISABLED_CLASS', () => {

    it('should equal `p-mod-disabled`', () => {
      expect(DISABLED_CLASS).to.be('p-mod-disabled');
    });

  });

  describe('HIDDEN_CLASS', () => {

    it('should equal `p-mod-hidden`', () => {
      expect(HIDDEN_CLASS).to.be('p-mod-hidden');
    });

  });

  describe('FORCE_HIDDEN_CLASS', () => {

    it('should equal `p-mod-force-hidden`', () => {
      expect(FORCE_HIDDEN_CLASS).to.be('p-mod-force-hidden');
    });

  });

  describe('MenuBar', () => {

    describe('.fromTemplate', () => {

      it('should create a menu bar from a template', () => {
        var menu = MenuBar.fromTemplate(MENU_TEMPLATE);
        expect(menu.items.length).to.be(6);
      });

    });

    describe('#constructor()', () => {

      it('should accept no arguments', () => {
        var menu = new MenuBar();
        expect(menu instanceof MenuBar).to.be(true);
      });

      it('should add MENU_BAR_CLASS', () => {
        var menu = new MenuBar();
        expect(menu.hasClass(MENU_BAR_CLASS)).to.be(true);
      });

    });

    describe('#dispose()', () => {

      it('should dispose of the resources held by the menu', () => {
        var menu = MenuBar.fromTemplate(MENU_TEMPLATE);
        menu.dispose();
        expect(menu.items.length).to.be(0);
      });

    });

    describe('#childMenu', () => {

      it('should get the child menu of the menu', () => {
        var menu = MenuBar.fromTemplate(MENU_TEMPLATE);
        menu.activeIndex = 0;
        menu.openActiveItem();
        expect(menu.childMenu).to.eql(menu.items[0].submenu);
        menu.close(true);
      });

      it('should null if the menu does not have an open submenu', () => {
        var menu = MenuBar.fromTemplate(MENU_TEMPLATE);
        expect(menu.childMenu).to.be(null);
        menu.close(true);
      });

    });

    describe('#handleEvent()', () => {

      it('should trigger the active item on keyCode 13', (done) => {
        var menu = MenuBar.fromTemplate(MENU_TEMPLATE);
        attachWidget(menu, document.body);
        menu.activateNextItem();
        menu.openActiveItem();
        var called = false;
        menu.childMenu.activateNextItem();
        menu.childMenu.items[menu.childMenu.activeIndex].handler = () => {
          called = true;
        }
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keydown', { keyCode: 13 });
          expect(called).to.be(true);
          menu.close(true); 
          done();
        }, 0);
      });

      it('should close the leaf menu on keyCode 27', (done) => {
        var menu = MenuBar.fromTemplate(MENU_TEMPLATE);
        attachWidget(menu, document.body);
        menu.activateNextItem();
        menu.openActiveItem();
        menu.childMenu.activateNextItem();
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keydown', { keyCode: 27 });
          expect(menu.childMenu).to.be(null); 
          menu.close(true);
          done();
        }, 0);
      });

      it('should open the previous menu on keyCode 37', (done) => {
        var menu = MenuBar.fromTemplate(MENU_TEMPLATE);
        attachWidget(menu, document.body);
        menu.activateNextItem();
        menu.openActiveItem();
        menu.childMenu.activateNextItem();
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keydown', { keyCode: 37 });
          expect(menu.childMenu).to.not.be(null);
          expect(menu.activeIndex).to.be(MENU_TEMPLATE.length - 1);
          menu.close(true);
          done();
        });
      });

      it('should close a sub menu on keyCode 37', (done) => {
        var menu = MenuBar.fromTemplate(MENU_TEMPLATE);
        attachWidget(menu, document.body);
        menu.activeIndex = 0;
        menu.openActiveItem();
        menu.childMenu.activeIndex = 8;
        menu.childMenu.openActiveItem();
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keydown', { keyCode: 37 });
          expect(menu.childMenu.childMenu).to.be(null);
          menu.close(true);
          done();
        });
      });

      it('should activate the previous menu item on keyCode 38', (done) => {
        var menu = MenuBar.fromTemplate(MENU_TEMPLATE);
        attachWidget(menu, document.body);
        menu.activateNextItem();
        menu.openActiveItem();
        menu.childMenu.activateNextItem();
        var previous = menu.childMenu.activeIndex;
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keydown', { keyCode: 38 });
          expect(menu.childMenu.activeIndex).to.not.be(previous);
          menu.close(true);
          done();
        }, 0);
      });

      it('should open a sub menu on keyCode 39', (done) => {
        var menu = MenuBar.fromTemplate(MENU_TEMPLATE);
        attachWidget(menu, document.body);
        menu.activeIndex = 0;
        menu.openActiveItem();
        menu.childMenu.leafMenu.activeIndex = 8;
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keydown', { keyCode: 39 });
          setTimeout(() => {
            expect(menu.childMenu.childMenu).to.not.be(null);
            menu.close(true);
            done();
          }, 500);
        }, 0);
      });

      it('should open next menu on keyCode 39', (done) => {
        var menu = MenuBar.fromTemplate(MENU_TEMPLATE);
        attachWidget(menu, document.body);
        menu.activateNextItem();
        menu.openActiveItem();
        var previous = menu.activeIndex;
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keydown', { keyCode: 39 });
          expect(menu.activeIndex).to.not.be(previous);
          expect(menu.childMenu).to.not.be(null);
          menu.close(true);
          done();
        }, 0);
      });

      it('should activate the next menu item on keyCode 40', (done) => {
        var menu = MenuBar.fromTemplate(MENU_TEMPLATE);
        attachWidget(menu, document.body);
        menu.activateNextItem();
        menu.openActiveItem();
        menu.childMenu.activateNextItem();
        var previous = menu.childMenu.activeIndex;
        setTimeout(() => {
          triggerKeyEvent(document.body, 'keydown', { keyCode: 40 });
          expect(menu.childMenu.activeIndex).to.not.be(previous);
          menu.close(true);
          done();
        }, 0);
      });

      it('should trigger the item if we mouse over and click', () => {
        var menu = MenuBar.fromTemplate(MENU_TEMPLATE);
        attachWidget(menu, document.body);
        menu.activeIndex = 1;
        menu.openActiveItem();
        menu.childMenu.activeIndex = 0;
        menu.childMenu.openActiveItem();
        var checked = false;
        menu.childMenu.items[0].handler = () => { checked = true; };
        var node = menu.childMenu.node.firstChild.firstChild as HTMLElement;
        triggerMouseEvent(node, 'mouseenter');
        triggerMouseEvent(node, 'mousedown');
        triggerMouseEvent(node, 'mouseup');
        expect(checked).to.be(true);
        menu.close(true);
      });

      it('should activate an item based on mnemonic', (done) => {
        var menu = MenuBar.fromTemplate(MENU_TEMPLATE);
        attachWidget(menu, document.body);
        menu.activeIndex = 1;
        menu.openActiveItem();
        menu.childMenu.activeIndex = 0;
        menu.childMenu.openActiveItem();
        var node = menu.childMenu.node.firstChild.firstChild as HTMLElement;
        setTimeout(() => {
          triggerKeyEvent(node, 'keypress', { charCode: 82 } );  // 'r' key
          expect(menu.childMenu.activeIndex).to.be(1);
          menu.close(true);
          done();
        }, 0);
      });

      it('should open the submenu', () => {
        var menu = MenuBar.fromTemplate(MENU_TEMPLATE);
        attachWidget(menu, document.body);
        var node = menu.node.firstChild.firstChild as HTMLElement;
        var rect = node.getBoundingClientRect();
        triggerMouseEvent(node, 'mousedown',
                          { clientX: rect.left, clientY: rect.bottom });
        expect(menu.activeIndex).to.be(0);
        menu.close(true);
      });

      it('should close the submenu on an outside mousedown', (done) => {
        var menu = MenuBar.fromTemplate(MENU_TEMPLATE);
        attachWidget(menu, document.body);
        var node = menu.node.firstChild.firstChild as HTMLElement;
        var rect = node.getBoundingClientRect();
        triggerMouseEvent(node, 'mousedown',
                          { clientX: rect.left, clientY: rect.bottom });
        setTimeout(() => {
          triggerMouseEvent(document.body, 'mousedown');  
          expect(menu.activeIndex).to.be(-1);
          menu.close(true);
          done();
        }, 0);
      });

      it('should open a new the submenu', (done) => {
        var menu = MenuBar.fromTemplate(MENU_TEMPLATE);
        attachWidget(menu, document.body);
        var node = menu.node.firstChild.firstChild as HTMLElement;
        var rect = node.getBoundingClientRect();
        triggerMouseEvent(node, 'mousedown',
                          { clientX: rect.left, clientY: rect.bottom });
        setTimeout(() => {
          node = menu.node.firstChild.childNodes[1] as HTMLElement;
          rect = node.getBoundingClientRect();
          triggerMouseEvent(node, 'mousemove',
                            { clientX: rect.left + 1, clientY: rect.bottom });
          setTimeout(() => {
            expect(menu.activeIndex).to.be(1);
            menu.close(true);
            done();
          }, 0);
        }, 500);
      });

    });

    describe('#onItemsChanged()', () => {

      it('should be invoked when the menu items change', () => {
        var menu = LogMenu.fromTemplate(MENU_TEMPLATE);
        menu.items = [];
        expect(menu.messages.indexOf('onItemsChanged')).to.not.be(-1);
        menu.close(true);
      });

    });

    describe('#onActiveIndexChanged()', () => {

      it('should be invoked when the active index changes', () => {
        var menu = LogMenu.fromTemplate(MENU_TEMPLATE);
        menu.activeIndex = 0;
        expect(menu.messages.indexOf('onActiveIndexChanged')).to.not.be(-1);
        menu.close(true);
      });

    });

    describe('#onOpenItem()', () => {

      it('should be invoked when a menu item should be opened', () => {
        var menu = LogMenu.fromTemplate(MENU_TEMPLATE);
        menu.activateNextItem();
        menu.openActiveItem();
        expect(menu.messages.indexOf('onOpenItem')).to.not.be(-1);
        menu.close(true);
      });

      it('should open the child menu', () => {
        var menu = LogMenu.fromTemplate(MENU_TEMPLATE);
        menu.activateNextItem();
        menu.openActiveItem();
        expect(menu.messages.indexOf('onOpenItem')).to.not.be(-1);
        expect(menu.childMenu).to.be(menu.items[0].submenu);
        menu.close(true);
      });

    });

    describe('#onAfterAttach()', () => {

      it('should add four event listeners on the node', () => {
        var menu = LogMenu.fromTemplate(MENU_TEMPLATE);
        attachWidget(menu, document.body);
        expect(menu.messages.indexOf('onAfterAttach')).to.not.be(-1);
        triggerMouseEvent(menu.node, 'mousedown');
        triggerMouseEvent(menu.node, 'mousemove');
        triggerMouseEvent(menu.node, 'mouseleave');
        triggerMouseEvent(menu.node, 'contextmenu');
        expect(menu.messages.indexOf('mousedown')).to.not.be(-1);
        expect(menu.messages.indexOf('mousemove')).to.not.be(-1);
        expect(menu.messages.indexOf('mouseleave')).to.not.be(-1);
        expect(menu.messages.indexOf('contextmenu')).to.not.be(-1);
        menu.close(true);
      });

    });

    describe('#onBeforeDetach()', () => {

      it('should remove all event listeners', () => {
        var menu = LogMenu.fromTemplate(MENU_TEMPLATE);
        attachWidget(menu, document.body);
        menu.close(true);
        triggerMouseEvent(menu.node, 'mousedown');
        triggerMouseEvent(menu.node, 'mousemove');
        triggerMouseEvent(menu.node, 'mouseleave');
        triggerMouseEvent(menu.node, 'contextmenu');
        expect(menu.messages.indexOf('mousedown')).to.be(-1);
        expect(menu.messages.indexOf('mousemove')).to.be(-1);
        expect(menu.messages.indexOf('mouseleave')).to.be(-1);
        expect(menu.messages.indexOf('contextmenu')).to.be(-1);
        expect(menu.messages.indexOf('onBeforeDetach')).to.not.be(-1);
      });

    });

    describe('#onUpdateRequest()', () => {

      it('should create the menu bar', () => {
        var menu = LogMenu.fromTemplate(MENU_TEMPLATE);
        attachWidget(menu, document.body);
        expect(menu.messages.indexOf('onUpdateRequest')).to.not.be(-1);
        var children = menu.node.firstChild.childNodes;
        expect(children.length).to.be(MENU_TEMPLATE.length);
        menu.close(true);
      });

    });

    describe('#onCloseRequest()', () => {

      it('should detach the widget from the DOM', () => {
        var menu = LogMenu.fromTemplate(MENU_TEMPLATE);
        attachWidget(menu, document.body);
        menu.close(true);
        var rect = menu.node.getBoundingClientRect();
        expect(rect.left - rect.right).to.be(0);    
        expect(menu.messages.indexOf('onCloseRequest')).to.not.be(-1); 
      });

    });

  });
});
