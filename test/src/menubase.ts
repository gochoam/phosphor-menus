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


class LogMenuBase extends MenuBase {

  messages: string[] = [];

  constructor(items?: MenuItem[]) {
    super();
    if (items) this.items = items;
  }

  protected coerceActiveIndex(index: number): number {
    let i = super.coerceActiveIndex(index);
    this.messages.push('coerceActiveIndex');
    return i;
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

      it('should have the name `items`', () => {
        expect(MenuBase.itemsProperty.name).to.be('items');
      });

      it('should default a frozen empty list', () => {
        let base = new MenuBase();
        let items = MenuBase.itemsProperty.get(base);
        expect(items).to.eql([]);
        expect(() => items.push(new MenuItem())).to.throwError();
      });

      it('should trigger an items changed', () => {
        let base = new LogMenuBase();
        let items = MenuBase.itemsProperty.set(base, [new MenuItem()]);
        expect(base.messages.indexOf('onItemsChanged')).to.not.be(-1);
      });

    });

    describe('.activeIndexProperty', () => {

      it('should be a property descriptor', () => {
        expect(MenuBase.activeIndexProperty instanceof Property).to.be(true);
      });

      it('should have the name `activeIndex`', () => {
        expect(MenuBase.activeIndexProperty.name).to.be('activeIndex');
      });

      it('should default `-1`', () => {
        let base = new MenuBase();
        expect(MenuBase.activeIndexProperty.get(base)).to.be(-1);
      });

      it('should coerce the index to an appropriate value', () => {
        let base = new MenuBase();
        base.items = [new MenuItem(), new MenuItem({ type: MenuItem.Separator })];
        MenuBase.activeIndexProperty.set(base, 0);
        expect(MenuBase.activeIndexProperty.get(base)).to.be(0);
        MenuBase.activeIndexProperty.set(base, 1);
        expect(MenuBase.activeIndexProperty.get(base)).to.be(-1);
      });

      it('should trigger a coerce active index', () => {
        let base = new LogMenuBase();
        base.items = [new MenuItem(), new MenuItem()];
        MenuBase.activeIndexProperty.set(base, 1);
        expect(base.messages.indexOf('coerceActiveIndex')).to.not.be(-1);
      });

      it('should trigger an active index changed', () => {
        let base = new LogMenuBase();
        base.items = [new MenuItem(), new MenuItem()];
        MenuBase.activeIndexProperty.set(base, 1);
        expect(base.messages.indexOf('onActiveIndexChanged')).to.not.be(-1);
      });

    });

    describe('#constructor()', () => {

      it('should accept no arguments', () => {
        let base = new MenuBase();
        expect(base instanceof MenuBase).to.be(true);
      });

    });

    describe('#items', () => {

      it('should get the array of menu items', () => {
        let base = new MenuBase();
        expect(base.items).to.eql([]);
      });

      it('should set the array of menu items', () => {
        let base = new MenuBase();
        let items = [new MenuItem(), new MenuItem()];
        base.items = items;
        expect(base.items[0]).to.be(items[0]);
        expect(base.items[1]).to.be(items[1]);
      });

      it('should a pure delegate to the itemsProperty', () => {
        let base = new MenuBase();
        MenuBase.itemsProperty.set(base, [new MenuItem()]);
        expect(base.items.length).to.be(1);
        base.items = [new MenuItem(), new MenuItem()];
        expect(MenuBase.itemsProperty.get(base).length).to.be(2);
      });

    });

    describe('#activeIndex', () => {

      it('should get the index of the active menu item', () => {
        let base = new MenuBase();
        expect(base.activeIndex).to.be(-1);
      });

      it('should set the index of the active menu item', () => {
        let base = new MenuBase();
        base.items = [new MenuItem(), new MenuItem()];
        base.activeIndex = 1;
        expect(base.activeIndex).to.be(1);
      });

      it('should a pure delegate to the activeIndexProperty', () => {
        let base = new MenuBase();
        base.items = [new MenuItem(), new MenuItem()];
        MenuBase.activeIndexProperty.set(base, 1);
        expect(base.activeIndex).to.be(1);
        base.activeIndex = 0
        expect(MenuBase.activeIndexProperty.get(base)).to.be(0);
      });

    });

    describe('#activateNextItem()', () => {

      it('should activate the next selectable menu item', () => {
        let base = new MenuBase();
        base.items = [new MenuItem({ type: MenuItem.Separator }), new MenuItem()];
        base.activateNextItem();
        expect(base.activeIndex).to.be(1);
      });

      it('should start at the current index', () => {
        let base = new MenuBase();
        base.items = [new MenuItem(), new MenuItem(), new MenuItem()];
        base.activeIndex = 1;
        base.activateNextItem();
        expect(base.activeIndex).to.be(2);
      });

      it('should wrap around at the end of the menu', () => {
        let base = new MenuBase();
        base.items = [new MenuItem(), new MenuItem()];
        base.activeIndex = 1;
        base.activateNextItem();
        expect(base.activeIndex).to.be(0);
      });

    });

    describe('#activatePreviousItem()', () => {

      it('should activate the previous selectable menu item', () => {
        let base = new MenuBase();
        base.items = [new MenuItem(), new MenuItem()];
        base.activeIndex = 1;
        base.activatePreviousItem();
        expect(base.activeIndex).to.be(0);
      });

      it('should start at the current index', () => {
        let base = new MenuBase();
        base.items = [new MenuItem(), new MenuItem(), new MenuItem()];
        base.activeIndex = 2;
        base.activatePreviousItem();
        expect(base.activeIndex).to.be(1);
      });

      it('should wrap around at the front of the menu', () => {
        let base = new MenuBase();
        base.items = [new MenuItem(), new MenuItem()];
        base.activeIndex = 0;
        base.activatePreviousItem();
        expect(base.activeIndex).to.be(1);
      });

    });

    describe('#activateMnemonicItem()', () => {

      it('should activate the next selectable menu item with the given mnemonic', () => {
        let base = new MenuBase();
        base.items = [
          new MenuItem({ text: '&foo' }),
          new MenuItem({ type: MenuItem.Separator }),
          new MenuItem({ text: '&bar' }),
          new MenuItem({ text: 'ba&z' }),
          new MenuItem({ text: '&zazzy'}),
        ];
        base.activateMnemonicItem('f');
        expect(base.activeIndex).to.be(0);
        base.activateMnemonicItem('b');
        expect(base.activeIndex).to.be(2);
        base.activateMnemonicItem('z');
        expect(base.activeIndex).to.be(3);
        base.activateMnemonicItem('z');
        expect(base.activeIndex).to.be(4);
      });

      it('should start at the current index', () => {
        let base = new MenuBase();
        base.items = [
          new MenuItem({ text: '&foo' }),
          new MenuItem({ type: MenuItem.Separator }),
          new MenuItem({ text: '&bar' }),
          new MenuItem({ text: 'ba&z' }),
          new MenuItem({ text: '&zazzy'}),
        ];
        base.activeIndex = 3;
        base.activateMnemonicItem('z');
        expect(base.activeIndex).to.be(4);
      });

      it('should be case insensitive', () => {
        let base = new MenuBase();
        base.items = [
          new MenuItem({ text: '&foo' }),
          new MenuItem({ type: MenuItem.Separator }),
          new MenuItem({ text: '&bar' }),
          new MenuItem({ text: 'ba&z' }),
          new MenuItem({ text: '&zazzy'}),
        ];
        base.activateMnemonicItem('F');
        expect(base.activeIndex).to.be(0);
        base.activateMnemonicItem('B');
        expect(base.activeIndex).to.be(2);
        base.activateMnemonicItem('Z');
        expect(base.activeIndex).to.be(3);
        base.activateMnemonicItem('Z');
        expect(base.activeIndex).to.be(4);
      });

      it('should wrap around at the end of the menu', () => {
        let base = new MenuBase();
        base.items = [
          new MenuItem({ text: '&foo' }),
          new MenuItem({ type: MenuItem.Separator }),
          new MenuItem({ text: '&bar' }),
          new MenuItem({ text: 'ba&z' }),
          new MenuItem({ text: '&zazzy'}),
        ];
        base.activeIndex = 1;
        base.activateMnemonicItem('f');
        expect(base.activeIndex).to.be(0);
      });

    });

    describe('#openActiveItem()', () => {

      it('should open the active menu item', () => {
        let base = new LogMenuBase();
        base.items = [new MenuItem({ submenu: new Menu() })];
        base.activeIndex = 0;
        base.openActiveItem();
        expect(base.messages.indexOf('onOpenItem')).to.not.be(-1);
      });

      it('should be a no-op if there is no active menu item', () => {
        let base = new LogMenuBase();
        base.items = [new MenuItem({ submenu: new Menu() })];
        base.openActiveItem();
        expect(base.messages.indexOf('onOpenItem')).to.be(-1);
      });

      it('should be a no-op if the active menu item does not have a submenu', () => {
        let base = new LogMenuBase();
        base.items = [new MenuItem()];
        base.activeIndex = 0;
        base.openActiveItem();
        expect(base.messages.indexOf('onOpenItem')).to.be(-1);
      });

    });

    describe('#triggerActiveItem()', () => {

      it('should trigger the active menu item', () => {
        let base = new LogMenuBase();
        base.items = [new MenuItem()];
        base.activeIndex = 0;
        base.triggerActiveItem();
        expect(base.messages.indexOf('onTriggerItem')).to.not.be(-1);
      });

      it('should be equivalent to openActiveItem if the menu item has a submenu', () => {
        let base = new LogMenuBase();
        base.items = [new MenuItem({ submenu: new Menu() })];
        base.activeIndex = 0;
        base.triggerActiveItem();
        expect(base.messages.indexOf('onTriggerItem')).to.be(-1);
        expect(base.messages.indexOf('onOpenItem')).to.not.be(-1);
      });

      it('should be a no-op if there is no active item', () => {
        let base = new LogMenuBase();
        base.items = [new MenuItem()];
        base.triggerActiveItem();
        expect(base.messages.indexOf('onTriggerItem')).to.be(-1);
        expect(base.messages.indexOf('onOpenItem')).to.be(-1);
      });

    });

  });

});
