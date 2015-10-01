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
  Property
} from 'phosphor-properties';

import {
  Menu, MenuBase, MenuItem
} from '../../lib/index';


class LogMenu extends MenuBase {

  messages: string[] = [];

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

  protected onTriggerItem(index: number, item: MenuItem): void {
    super.onTriggerItem(index, item);
    this.messages.push('onTriggerItem');
  }
}


describe('phosphor-menus', () => {

  describe('MenuBase', () => {

    describe('.itemsProperty', () => {

      it('should be a property descriptor', () => {
        expect(MenuBase.itemsProperty instanceof Property).to.be(true);
      });

      it('should default a frozen empty list', () => {
        var menu = new MenuBase();
        var items = MenuBase.itemsProperty.get(menu);
        expect(items).to.eql([]);
        expect(() => items.push(new MenuItem())).to.throwError();
      });

      it('should trigger an items changed', () => {
        var menu = new LogMenu();
        var items = MenuBase.itemsProperty.set(menu, [new MenuItem()]);
        expect(menu.messages.indexOf('onItemsChanged')).to.not.be(-1);
      });

    });

    describe('.activeIndexProperty', () => {

      it('should be a property descriptor', () => {
        expect(MenuBase.activeIndexProperty instanceof Property).to.be(true);
      });

      it('should default `-1`', () => {
        var menu = new MenuBase();
        expect(MenuBase.activeIndexProperty.get(menu)).to.be(-1);
      });

      it('should trigger an active index changed', () => {
        var menu = new LogMenu();
        menu.items = [new MenuItem(), new MenuItem()];
        MenuBase.activeIndexProperty.set(menu, 1);
        expect(menu.messages.indexOf('onActiveIndexChanged')).to.not.be(-1);
      });

    });

    describe('#constructor()', () => {

      it('should accept no arguments', () => {
        var menu = new MenuBase();
        expect(menu instanceof MenuBase).to.be(true);
      });

    });

    describe('#items', () => {

      it('should get the array of menu items', () => {
        var menu = new MenuBase();
        expect(menu.items).to.eql([]);
      });

      it('should set the array of menu items', () => {
        var menu = new MenuBase();
        var items = [new MenuItem({ text: 'foo' }), 
                     new MenuItem({ text: 'bar' })];
        menu.items = items;
        expect(menu.items).to.eql(items);
      });

      it('should trigger an items changed', () => {
        var menu = new LogMenu();
        var items = [new MenuItem({ text: 'foo' }), 
                     new MenuItem({ text: 'bar' })];
        menu.items = items;
        expect(menu.messages.indexOf('onItemsChanged')).to.not.be(-1);
      });

      it('should a pure delegate to the itemsProperty', () => {
        var menu = new MenuBase();
        MenuBase.itemsProperty.set(menu, [new MenuItem()]);
        expect(menu.items.length).to.be(1);
        menu.items = [new MenuItem(), new MenuItem()];
        expect(MenuBase.itemsProperty.get(menu).length).to.be(2);
      });

    });

    describe('#activeIndex', () => {

      it('should get the index of the active menu item', () => {
        var menu = new MenuBase();
        expect(menu.activeIndex).to.eql(-1);
      });

      it('should set the index of the active menu item', () => {
        var menu = new MenuBase();
        menu.items = [new MenuItem({ text: 'foo' }), 
                      new MenuItem({ text: 'bar' })];
        menu.activeIndex = 1;
        expect(menu.activeIndex).to.eql(1);
      });

      it('should trigger an active index changed', () => {
        var menu = new LogMenu();
        menu.items = [new MenuItem({ text: 'foo' }), 
                      new MenuItem({ text: 'bar' })];
        menu.activeIndex = 1;
        expect(menu.messages.indexOf('onItemsChanged')).to.not.be(-1);
      });

      it('should a pure delegate to the activeIndexProperty', () => {
        var menu = new MenuBase();
        menu.items = [new MenuItem(), new MenuItem()];
        MenuBase.activeIndexProperty.set(menu, 1);
        expect(menu.activeIndex).to.be(1);
        menu.activeIndex = 0
        expect(MenuBase.activeIndexProperty.get(menu)).to.be(0);
      });

    });

    describe('#activateNextItem()', () => {

      it('should activate the next selectable menu item', () => {
        var menu = new MenuBase();
        menu.items = [new MenuItem({ text: 'foo', disabled: true }), 
                      new MenuItem({ text: 'bar' })];
        menu.activateNextItem();
        expect(menu.activeIndex).to.be(1);
      });

      it('should start at the current index', () => {
        var menu = new MenuBase();
        menu.items = [new MenuItem({ text: 'foo' }), 
                      new MenuItem({ text: 'bar' }),
                      new MenuItem({ text: 'baz' })];
        menu.activeIndex = 1;
        menu.activateNextItem();
        expect(menu.activeIndex).to.be(2);
      });

      it('should wrap around at the end of the menu', () => {
        var menu = new MenuBase();
        menu.items = [new MenuItem({ text: 'foo' }), 
                      new MenuItem({ text: 'bar' })];
        menu.activeIndex = 1;
        menu.activateNextItem();
        expect(menu.activeIndex).to.be(0);
      });

    });

    describe('#activatePreviousItem()', () => {

      it('should activate the previous selectable menu item', () => {
        var menu = new MenuBase();
        menu.items = [new MenuItem({ text: 'foo' }), 
                      new MenuItem({ text: 'bar'})];
        menu.items[1].hidden = true;
        menu.activatePreviousItem();
        expect(menu.activeIndex).to.be(0);
      });

      it('should start at the current index', () => {
        var menu = new MenuBase();
        menu.items = [new MenuItem({ text: 'foo' }), 
                      new MenuItem({ text: 'bar' }),
                      new MenuItem({ text: 'baz' })];
        menu.activeIndex = 1;
        menu.activatePreviousItem();
        expect(menu.activeIndex).to.be(0);
      });

      it('should wrap around at the front of the menu', () => {
        var menu = new MenuBase();
        menu.items = [new MenuItem({ text: 'foo' }), 
                      new MenuItem({ text: 'bar' })];
        menu.activeIndex = 0;
        menu.activatePreviousItem();
        expect(menu.activeIndex).to.be(1);
      });

    });

    describe('#activateMnemonicItem()', () => {

      it('should activate the next selectable menu item with the given mnemonic', () => {
        var menu = new MenuBase();
        menu.items = [new MenuItem({ text: '&foo', type: 'separator'}), 
                      new MenuItem({ text: '&bar'}),
                      new MenuItem({ text: 'a&foo'})];
        menu.activateMnemonicItem('f');
        expect(menu.activeIndex).to.be(2);
      });

      it('should start at the current index', () => {
        var menu = new MenuBase();
        menu.items = [new MenuItem({ text: '&foo' }), 
                      new MenuItem({ text: '&bar' }),
                      new MenuItem({ text: '&foo' })];
        menu.activeIndex = 1;
        menu.activateMnemonicItem('f');
        expect(menu.activeIndex).to.be(2);
      });

      it('should be case insensitive', () => {
        var menu = new MenuBase();
        menu.items = [new MenuItem({ text: '&foo' }), 
                      new MenuItem({ text: '&bar' })];
        menu.activateMnemonicItem('F');
        expect(menu.activeIndex).to.be(0);
      });

      it('should wrap around at the end of the menu', () => {
        var menu = new MenuBase();
        menu.items = [new MenuItem({ text: '&foo' }), 
                      new MenuItem({ text: '&bar' })];
        menu.activeIndex = 1;
        menu.activateMnemonicItem('f');
        expect(menu.activeIndex).to.be(0);
      });

    });

    describe('#openActiveItem()', () => {

      it('should open the active menu item', () => {
        var menu = new LogMenu();
        menu.items = [new MenuItem({ text: 'foo',
                                     submenu: new Menu() })];
        menu.activeIndex = 0;
        menu.openActiveItem();
        expect(menu.messages.indexOf('onOpenItem')).to.not.be(-1);
      });

      it('should be a no-op if there is no active menu', () => {
        var menu = new LogMenu();
        menu.items = [new MenuItem({ text: 'foo',
                                     submenu: new Menu() })];
        expect(menu.messages.indexOf('onOpenItem')).to.be(-1);
      });

      it('should be a no-op if the active menu item does not have a submenu', () => {
        var menu = new LogMenu();
        menu.items = [new MenuItem({ text: 'foo',
                                     submenu: new Menu() })];
        menu.activeIndex = 0;
        expect(menu.messages.indexOf('onOpenItem')).to.be(-1);
      });

    });

    describe('#triggerActiveItem()', () => {

      it('should trigger the active menu item', () => {
        var menu = new LogMenu();
        menu.items = [new MenuItem({ text: 'foo' })];
        menu.activeIndex = 0;
        menu.triggerActiveItem();
        expect(menu.messages.indexOf('onTriggerItem')).to.not.be(-1);
      });

      it('should be equivalent to openActiveItem if the menu item has a submenu', () => {
        var menu = new LogMenu();
        menu.items = [new MenuItem({ text: 'foo',
                                     submenu: new Menu() })];
        menu.activeIndex = 0;
        menu.triggerActiveItem();
        expect(menu.messages.indexOf('onTriggerItem')).to.be(-1);
        expect(menu.messages.indexOf('onOpenItem')).to.not.be(-1);
      });

      it('should be a no-op if there is no active menu', () => {
        var menu = new LogMenu();
        menu.items = [new MenuItem({ text: 'foo',
                                     submenu: new Menu() })];
        menu.triggerActiveItem();
        expect(menu.messages.indexOf('onTriggerItem')).to.be(-1);
        expect(menu.messages.indexOf('onOpenItem')).to.be(-1);
      });

    });

  });

});
