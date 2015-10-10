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


function logItem(item: MenuItem): void {
  console.log(item.text);
}


var MENU_BAR_TEMPLATE = [
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
        expect(bar.childMenu).to.eql(bar.items[0].submenu);
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

  });

});
