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
  IChangedArgs, Property
} from 'phosphor-properties';

import {
  Signal
} from 'phosphor-signaling';

import {
  Menu, MenuItem
} from '../../lib/index';


describe('phosphor-menus', () => {

  describe('MenuItem', () => {

    describe('.fromTemplate', () => {

      it('should create a menu item from a template', () => {
        let item = MenuItem.fromTemplate({
          text: 'foo',
          submenu: [{ text: 'bar' }, { text: 'baz' }],
        });
        expect(item instanceof MenuItem).to.be(true);
        expect(item.text).to.be('foo');
        expect(item.submenu instanceof Menu).to.be(true);
        expect(item.submenu.items.length).to.be(2);
        expect(item.submenu.items[0].text).to.be('bar');
        expect(item.submenu.items[1].text).to.be('baz');
      });

    });

    describe('.changedSignal', () => {

      it('should be a signal', () => {
        expect(MenuItem.changedSignal instanceof Signal).to.be(true);
      });

    });

    describe('.typeProperty', () => {

      it('should be a property descriptor', () => {
        expect(MenuItem.typeProperty instanceof Property).to.be(true);
      });

      it('should have the name `type`', () => {
        expect(MenuItem.typeProperty.name).to.be('type');
      });

      it('should notify using the changed signal', () => {
        expect(MenuItem.typeProperty.notify).to.be(MenuItem.changedSignal);
      });

      it('should default `normal`', () => {
        let item = new MenuItem();
        expect(MenuItem.typeProperty.get(item)).to.be('normal');
      });

      it('should allow `normal`, `check`, and `separator` types', () => {
        let item = new MenuItem();
        MenuItem.typeProperty.set(item, 'check');
        expect(MenuItem.typeProperty.get(item)).to.be('check');
        MenuItem.typeProperty.set(item, 'separator');
        expect(MenuItem.typeProperty.get(item)).to.be('separator');
        MenuItem.typeProperty.set(item, 'normal');
        expect(MenuItem.typeProperty.get(item)).to.be('normal');
      });

      it('should revert to `normal` if an invalid type is given', () => {
        let item = new MenuItem();
        MenuItem.typeProperty.set(item, 'check');
        expect(MenuItem.typeProperty.get(item)).to.be('check');
        MenuItem.typeProperty.set(item, 'foo');
        expect(MenuItem.typeProperty.get(item)).to.be('normal');
      });

      it('should coerced the `checked` property', () => {
        let item = new MenuItem({ type: 'check', checked: true });
        expect(MenuItem.typeProperty.get(item)).to.be('check');
        expect(MenuItem.checkedProperty.get(item)).to.be(true);
        MenuItem.typeProperty.set(item, 'normal');
        expect(MenuItem.checkedProperty.get(item)).to.be(false);
      });

    });

    describe('.textProperty', () => {

      it('should be a property descriptor', () => {
        expect(MenuItem.textProperty instanceof Property).to.be(true);
      });

      it('should have the name `text`', () => {
        expect(MenuItem.textProperty.name).to.be('text');
      });

      it('should notify using the changed signal', () => {
        expect(MenuItem.textProperty.notify).to.be(MenuItem.changedSignal);
      });

      it('should default to an empty string', () => {
        let item = new MenuItem();
        expect(MenuItem.textProperty.get(item)).to.be('');
      });

    });

    describe('.iconProperty', () => {

      it('should be a property descriptor', () => {
        expect(MenuItem.iconProperty instanceof Property).to.be(true);
      });

      it('should have the name `icon`', () => {
        expect(MenuItem.iconProperty.name).to.be('icon');
      });

      it('should notify using the changed signal', () => {
        expect(MenuItem.iconProperty.notify).to.be(MenuItem.changedSignal);
      });

      it('should default to an empty string', () => {
        let item = new MenuItem();
        expect(MenuItem.iconProperty.get(item)).to.be('');
      });

    });

    describe('.shortcutProperty', () => {

      it('should be a property descriptor', () => {
        expect(MenuItem.shortcutProperty instanceof Property).to.be(true);
      });

      it('should have the name `shortcut`', () => {
        expect(MenuItem.shortcutProperty.name).to.be('shortcut');
      });

      it('should notify using the changed signal', () => {
        expect(MenuItem.shortcutProperty.notify).to.be(MenuItem.changedSignal);
      });

      it('should default to an empty string', () => {
        let item = new MenuItem();
        expect(MenuItem.shortcutProperty.get(item)).to.be('');
      });

    });

    describe('.disabledProperty', () => {

      it('should be a property descriptor', () => {
        expect(MenuItem.disabledProperty instanceof Property).to.be(true);
      });

      it('should have the name `disabled`', () => {
        expect(MenuItem.disabledProperty.name).to.be('disabled');
      });

      it('should notify using the changed signal', () => {
        expect(MenuItem.disabledProperty.notify).to.be(MenuItem.changedSignal);
      });

      it('should default to `false`', () => {
        let item = new MenuItem();
        expect(MenuItem.disabledProperty.get(item)).to.be(false);
      });

    });

    describe('.hiddenProperty', () => {

      it('should be a property descriptor', () => {
        expect(MenuItem.hiddenProperty instanceof Property).to.be(true);
      });

      it('should have the name `hidden`', () => {
        expect(MenuItem.hiddenProperty.name).to.be('hidden');
      });

      it('should notify using the changed signal', () => {
        expect(MenuItem.hiddenProperty.notify).to.be(MenuItem.changedSignal);
      });

      it('should default to `false`', () => {
        let item = new MenuItem();
        expect(MenuItem.hiddenProperty.get(item)).to.be(false);
      });

    });

    describe('.checkedProperty', () => {

      it('should be a property descriptor', () => {
        expect(MenuItem.checkedProperty instanceof Property).to.be(true);
      });

      it('should have the name `checked`', () => {
        expect(MenuItem.checkedProperty.name).to.be('checked');
      });

      it('should notify using the changed signal', () => {
        expect(MenuItem.checkedProperty.notify).to.be(MenuItem.changedSignal);
      });

      it('should default to `false`', () => {
        let item = new MenuItem();
        expect(MenuItem.checkedProperty.get(item)).to.be(false);
      });

      it('should coerce to `false` if the type is not `check`', () => {
        let item = new MenuItem({ type: 'normal' });
        MenuItem.checkedProperty.set(item, true);
        expect(MenuItem.checkedProperty.get(item)).to.be(false);
      });

    });

    describe('.classNameProperty', () => {

      it('should be a property descriptor', () => {
        expect(MenuItem.classNameProperty instanceof Property).to.be(true);
      });

      it('should have the name `className`', () => {
        expect(MenuItem.classNameProperty.name).to.be('className');
      });

      it('should notify using the changed signal', () => {
        expect(MenuItem.classNameProperty.notify).to.be(MenuItem.changedSignal);
      });

      it('should default to an empty string', () => {
        let item = new MenuItem();
        expect(MenuItem.classNameProperty.get(item)).to.be('');
      });

    });

    describe('.handlerProperty', () => {

      it('should be a property descriptor', () => {
        expect(MenuItem.handlerProperty instanceof Property).to.be(true);
      });

      it('should have the name `handler`', () => {
        expect(MenuItem.handlerProperty.name).to.be('handler');
      });

      it('should notify using the changed signal', () => {
        expect(MenuItem.handlerProperty.notify).to.be(MenuItem.changedSignal);
      });

      it('should default to `null`', () => {
        let item = new MenuItem();
        expect(MenuItem.handlerProperty.get(item)).to.be(null);
      });

    });

    describe('.submenuProperty', () => {

      it('should be a property descriptor', () => {
        expect(MenuItem.submenuProperty instanceof Property).to.be(true);
      });

      it('should have the name `submenu`', () => {
        expect(MenuItem.submenuProperty.name).to.be('submenu');
      });

      it('should notify using the changed signal', () => {
        expect(MenuItem.submenuProperty.notify).to.be(MenuItem.changedSignal);
      });

      it('should default to `null`', () => {
        let item = new MenuItem();
        expect(MenuItem.submenuProperty.get(item)).to.be(null);
      });

    });

    describe('#constructor()', () => {

      it('should accept no arguments', () => {
        let item = new MenuItem();
        expect(item instanceof MenuItem).to.be(true);
      });

      it('should accept an IMenuItemOptions argument', () => {
        let item = new MenuItem({ text: 'foo', className: 'bar' });
        expect(item instanceof MenuItem).to.be(true);
        expect(item.text).to.be('foo');
        expect(item.className).to.be('bar');
      });

    });

    describe('#changed', () => {

      it('should be a pure delegate to the `changedSignal`', () => {
        let item = new MenuItem();
        expect(item.changed).to.eql(MenuItem.changedSignal.bind(item));
      });

    });

    describe('#type', () => {

      it('should get the type of the menu item', () => {
        let item = new MenuItem();
        expect(item.type).to.be('normal');
      });

      it('should set the type of the menu item', () => {
        let item = new MenuItem();
        item.type = 'check';
        expect(item.type).to.be('check');
      });

      it('should a pure delegate to the typeProperty', () => {
        let item = new MenuItem();
        MenuItem.typeProperty.set(item, 'separator');
        expect(item.type).to.be('separator');
        item.type = 'normal';
        expect(MenuItem.typeProperty.get(item)).to.be('normal');
      });

      it('should emit the changed signal', () => {
        let item = new MenuItem();
        let args: IChangedArgs<any> = null;
        item.changed.connect((s, a) => { args = a; });
        item.type = 'separator';
        expect(args).to.eql({
          name: 'type',
          oldValue: 'normal',
          newValue: 'separator',
        });
      });

    });

    describe('#text', () => {

      it('should get the text for the menu item', () => {
        let item = new MenuItem();
        expect(item.text).to.be('');
      });

      it('should set the text for the menu item', () => {
        let item = new MenuItem();
        item.text = 'foo';
        expect(item.text).to.be('foo');
      });

      it('should a pure delegate to the textProperty', () => {
        let item = new MenuItem();
        MenuItem.textProperty.set(item, 'foo');
        expect(item.text).to.be('foo');
        item.text = 'bar';
        expect(MenuItem.textProperty.get(item)).to.be('bar');
      });

      it('should emit the changed signal', () => {
        let item = new MenuItem();
        let args: IChangedArgs<any> = null;
        item.changed.connect((s, a) => { args = a; });
        item.text = 'foo';
        expect(args).to.eql({
          name: 'text',
          oldValue: '',
          newValue: 'foo',
        });
      });

    });

    describe('#icon', () => {

      it('should get the icon for the menu item', () => {
        let item = new MenuItem();
        expect(item.icon).to.be('');
      });

      it('should set the icon for the menu item', () => {
        let item = new MenuItem();
        item.icon = 'fa fa-close';
        expect(item.icon).to.be('fa fa-close');
      });

      it('should a pure delegate to the iconProperty', () => {
        let item = new MenuItem();
        MenuItem.iconProperty.set(item, 'fa fa-close');
        expect(item.icon).to.be('fa fa-close');
        item.icon = 'fa fa-open';
        expect(MenuItem.iconProperty.get(item)).to.be('fa fa-open');
      });

      it('should emit the changed signal', () => {
        let item = new MenuItem();
        let args: IChangedArgs<any> = null;
        item.changed.connect((s, a) => { args = a; });
        item.icon = 'fa fa-close';
        expect(args).to.eql({
          name: 'icon',
          oldValue: '',
          newValue: 'fa fa-close',
        });
      });

    });

    describe('#shortcut', () => {

      it('should get the shortcut key for the menu item', () => {
        let item = new MenuItem();
        expect(item.shortcut).to.be('');
      });

      it('should set the shortcut key for the menu item', () => {
        let item = new MenuItem();
        item.shortcut = 'ctrl+x';
        expect(item.shortcut).to.be('ctrl+x');
      });

      it('should a pure delegate to the shortcutProperty', () => {
        let item = new MenuItem();
        MenuItem.shortcutProperty.set(item, 'shift+tab');
        expect(item.shortcut).to.be('shift+tab');
        item.shortcut = 'alt+f';
        expect(MenuItem.shortcutProperty.get(item)).to.be('alt+f');
      });

      it('should emit the changed signal', () => {
        let item = new MenuItem();
        let args: IChangedArgs<any> = null;
        item.changed.connect((s, a) => { args = a; });
        item.shortcut = 'Ctrl+C';
        expect(args).to.eql({
          name: 'shortcut',
          oldValue: '',
          newValue: 'Ctrl+C',
        });
      });

    });

    describe('#disabled', () => {

      it('should get whether the menu item is disabled', () => {
        let item = new MenuItem();
        expect(item.disabled).to.be(false);
      });

      it('should set whether the menu item is disabled', () => {
        let item = new MenuItem();
        item.disabled = true;
        expect(item.disabled).to.be(true);
      });

      it('should a pure delegate to the disabledProperty', () => {
        let item = new MenuItem();
        MenuItem.disabledProperty.set(item, true);
        expect(item.disabled).to.be(true);
        item.disabled = false;
        expect(MenuItem.disabledProperty.get(item)).to.be(false);
      });

      it('should emit the changed signal', () => {
        let item = new MenuItem();
        let args: IChangedArgs<any> = null;
        item.changed.connect((s, a) => { args = a; });
        item.disabled = true;
        expect(args).to.eql({
          name: 'disabled',
          oldValue: false,
          newValue: true,
        });
      });

    });

    describe('#hidden', () => {

      it('should get whether the menu item is hidden', () => {
        let item = new MenuItem();
        expect(item.hidden).to.be(false);
      });

      it('should set whether the menu item is hidden', () => {
        let item = new MenuItem();
        item.hidden = true;
        expect(item.hidden).to.be(true);
      });

      it('should a pure delegate to the hiddenProperty', () => {
        let item = new MenuItem();
        MenuItem.hiddenProperty.set(item, true);
        expect(item.hidden).to.be(true);
        item.hidden = false;
        expect(MenuItem.hiddenProperty.get(item)).to.be(false);
      });

      it('should emit the changed signal', () => {
        let item = new MenuItem();
        let args: IChangedArgs<any> = null;
        item.changed.connect((s, a) => { args = a; });
        item.hidden = true;
        expect(args).to.eql({
          name: 'hidden',
          oldValue: false,
          newValue: true,
        });
      });

    });

    describe('#checked', () => {

      it('should get whether the menu item is checked', () => {
        let item = new MenuItem();
        expect(item.checked).to.be(false);
      });

      it('should set whether the menu item is checked', () => {
        let item = new MenuItem({ type: 'check' });
        item.checked = true;
        expect(item.checked).to.be(true);
      });

      it('should a pure delegate to the checkedProperty', () => {
        let item = new MenuItem({ type: 'check' });
        MenuItem.checkedProperty.set(item, true);
        expect(item.checked).to.be(true);
        item.checked = false;
        expect(MenuItem.checkedProperty.get(item)).to.be(false);
      });

      it('should emit the changed signal', () => {
        let item = new MenuItem();
        let args: IChangedArgs<any> = null;
        item.type = 'check';
        item.changed.connect((s, a) => { args = a; });
        item.checked = true;
        expect(args).to.eql({
          name: 'checked',
          oldValue: false,
          newValue: true,
        });
      });

    });

    describe('#className', () => {

      it('should get the extra class name for the menu item', () => {
        let item = new MenuItem();
        expect(item.className).to.be('');
      });

      it('should set the extra class name for the menu item', () => {
        let item = new MenuItem();
        item.className = 'foo';
        expect(item.className).to.be('foo');
      });

      it('should a pure delegate to the classNameProperty', () => {
        let item = new MenuItem();
        MenuItem.classNameProperty.set(item, 'foo');
        expect(item.className).to.be('foo');
        item.className = 'bar';
        expect(MenuItem.classNameProperty.get(item)).to.be('bar');
      });

      it('should emit the changed signal', () => {
        let item = new MenuItem();
        let args: IChangedArgs<any> = null;
        item.changed.connect((s, a) => { args = a; });
        item.className = 'foo';
        expect(args).to.eql({
          name: 'className',
          oldValue: '',
          newValue: 'foo',
        });
      });

    });

    describe('#handler', () => {

      it('should get the handler for the menu item', () => {
        let item = new MenuItem();
        expect(item.handler).to.be(null);
      });

      it('should set the handler for the menu item', () => {
        let item = new MenuItem();
        let handler = (item: MenuItem) => { };
        item.handler = handler;
        expect(item.handler).to.be(handler);
      });

      it('should a pure delegate to the handlerProperty', () => {
        let item = new MenuItem();
        let handler = (item: MenuItem) => { };
        MenuItem.handlerProperty.set(item, handler);
        expect(item.handler).to.be(handler);
        item.handler = null;
        expect(MenuItem.handlerProperty.get(item)).to.be(null);
      });

      it('should emit the changed signal', () => {
        let item = new MenuItem();
        let handler = (item: MenuItem) => { };
        let args: IChangedArgs<any> = null;
        item.changed.connect((s, a) => { args = a; });
        item.handler = handler;
        expect(args).to.eql({
          name: 'handler',
          oldValue: null,
          newValue: handler,
        });
      });

    });

    describe('#submenu', () => {

      it('should get the submenu for the menu item', () => {
        let item = new MenuItem();
        expect(item.submenu).to.be(null);
      });

      it('should set the submenu for the menu item', () => {
        let item = new MenuItem();
        let submenu = new Menu();
        item.submenu = submenu;
        expect(item.submenu).to.be(submenu);
      });

      it('should a pure delegate to the submenuProperty', () => {
        let item = new MenuItem();
        let submenu = new Menu();
        MenuItem.submenuProperty.set(item, submenu);
        expect(item.submenu).to.be(submenu);
        item.submenu = null;
        expect(MenuItem.submenuProperty.get(item)).to.be(null);
      });

      it('should emit the changed signal', () => {
        let item = new MenuItem();
        let submenu = new Menu();
        let args: IChangedArgs<any> = null;
        item.changed.connect((s, a) => { args = a; });
        item.submenu = submenu;
        expect(args).to.eql({
          name: 'submenu',
          oldValue: null,
          newValue: submenu,
        });
      });

    });

    describe('#isNormalType', () => {

      it('should test whether the menu item is a `"normal"` type', () => {
        let item = new MenuItem();
        expect(item.isNormalType).to.be(true);
        item.type = 'check';
        expect(item.isNormalType).to.be(false);
        item.type = 'separator';
        expect(item.isNormalType).to.be(false);
        item.type = 'foo';
        expect(item.isNormalType).to.be(true);
      });

      it('should be read-only', () => {
        let item = new MenuItem();
        expect(() => { item.isNormalType = false; } ).to.throwError();
      });

    });

    describe('#isCheckType', () => {

      it('should test whether the menu item is a `"check"` type', () => {
        let item = new MenuItem();
        expect(item.isCheckType).to.be(false);
        item.type = 'check';
        expect(item.isCheckType).to.be(true);
        item.type = 'separator';
        expect(item.isCheckType).to.be(false);
      });

      it('should be read-only', () => {
        let item = new MenuItem();
        expect(() => { item.isCheckType = false; } ).to.throwError();
      });

    });

    describe('#isSeparatorType', () => {

      it('should test whether the menu item is a `"separator"` type', () => {
        let item = new MenuItem();
        expect(item.isSeparatorType).to.be(false);
        item.type = 'check';
        expect(item.isSeparatorType).to.be(false);
        item.type = 'separator';
        expect(item.isSeparatorType).to.be(true);
      });

      it('should be read-only', () => {
        let item = new MenuItem();
        expect(() => { item.isSeparatorType = false; } ).to.throwError();
      });

    });

  });

});
