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
  IChangedArgs, Property
} from 'phosphor-properties';

import {
  Signal
} from 'phosphor-signaling';

import {
  Menu, MenuItem, MenuItemType
} from '../../lib/index';


describe('phosphor-menus', () => {

  describe('MenuItem', () => {

    describe('.Normal', () => {

      it('should be an alias of the `Normal` MenuItemType', () => {
          expect(MenuItem.Normal).to.be(MenuItemType.Normal);
      });

    });

    describe('.Check', () => {

      it('should be an alias of the `Check` MenuItemType', () => {
          expect(MenuItem.Check).to.be(MenuItemType.Check);
      });

    });

    describe('.Separator', () => {

      it('should be an alias of the `Separator` MenuItemType', () => {
          expect(MenuItem.Separator).to.be(MenuItemType.Separator);
      });

    });

    describe('.Submenu', () => {

      it('should be an alias of the `Submenu` MenuItemType', () => {
          expect(MenuItem.Submenu).to.be(MenuItemType.Submenu);
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

      it('should default `Normal`', () => {
        let item = new MenuItem();
        expect(MenuItem.typeProperty.get(item)).to.be(MenuItem.Normal);
      });

      it('should coerce to `Submenu` if the item has a submenu', () => {
        let item = new MenuItem();
        item.submenu = new Menu();
        item.type = MenuItem.Check;
        expect(item.type).to.be(MenuItem.Submenu);
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

    describe('.commandProperty', () => {

      it('should be a property descriptor', () => {
        expect(MenuItem.commandProperty instanceof Property).to.be(true);
      });

      it('should have the name `command`', () => {
        expect(MenuItem.commandProperty.name).to.be('command');
      });

      it('should notify using the changed signal', () => {
        expect(MenuItem.commandProperty.notify).to.be(MenuItem.changedSignal);
      });

      it('should default to `null`', () => {
        let item = new MenuItem();
        expect(MenuItem.commandProperty.get(item)).to.be(null);
      });

    });

    describe('.commandArgsProperty', () => {

      it('should be a property descriptor', () => {
        expect(MenuItem.commandArgsProperty instanceof Property).to.be(true);
      });

      it('should have the name `command`', () => {
        expect(MenuItem.commandArgsProperty.name).to.be('commandArgs');
      });

      it('should notify using the changed signal', () => {
        expect(MenuItem.commandArgsProperty.notify).to.be(MenuItem.changedSignal);
      });

      it('should default to `null`', () => {
        let item = new MenuItem();
        expect(MenuItem.commandArgsProperty.get(item)).to.be(null);
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

      it('should coerce the `type` to `Submenu`', () => {
        let item = new MenuItem();
        item.type = MenuItem.Check;
        expect(item.type).to.be(MenuItem.Check);
        item.submenu = new Menu();
        expect(item.type).to.be(MenuItem.Submenu);
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
        expect(item.type).to.be(MenuItem.Normal);
      });

      it('should set the type of the menu item', () => {
        let item = new MenuItem();
        item.type = MenuItem.Check;
        expect(item.type).to.be(MenuItem.Check);
      });

      it('should a pure delegate to the typeProperty', () => {
        let item = new MenuItem();
        MenuItem.typeProperty.set(item, MenuItem.Separator);
        expect(item.type).to.be(MenuItem.Separator);
        item.type = MenuItem.Normal;
        expect(MenuItem.typeProperty.get(item)).to.be(MenuItem.Normal);
      });

      it('should emit the changed signal', () => {
        let item = new MenuItem();
        let args: IChangedArgs<any> = null;
        item.changed.connect((s, a) => { args = a; });
        item.type = MenuItem.Separator;
        expect(args).to.eql({
          name: 'type',
          oldValue: MenuItem.Normal,
          newValue: MenuItem.Separator,
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

    describe('#command', () => {

      it('should get the command for the menu item', () => {
        let item = new MenuItem();
        expect(item.command).to.be(null);
      });

      it('should set the command for the menu item', () => {
        let item = new MenuItem();
        let command = new DelegateCommand(() => { });
        item.command = command;
        expect(item.command).to.be(command);
      });

      it('should a pure delegate to the commandProperty', () => {
        let item = new MenuItem();
        let command = new DelegateCommand(() => { });
        MenuItem.commandProperty.set(item, command);
        expect(item.command).to.be(command);
        item.command = null;
        expect(MenuItem.commandProperty.get(item)).to.be(null);
      });

      it('should emit the changed signal', () => {
        let item = new MenuItem();
        let command = new DelegateCommand(() => { });
        let args: IChangedArgs<any> = null;
        item.changed.connect((s, a) => { args = a; });
        item.command = command;
        expect(args).to.eql({
          name: 'command',
          oldValue: null,
          newValue: command,
        });
      });

    });

    describe('#commandArgs', () => {

      it('should get the command args for the menu item', () => {
        let item = new MenuItem();
        expect(item.command).to.be(null);
      });

      it('should set the command args for the menu item', () => {
        let item = new MenuItem();
        let args = {};
        item.commandArgs = args;
        expect(item.commandArgs).to.be(args);
      });

      it('should a pure delegate to the commandArgsProperty', () => {
        let item = new MenuItem();
        let args = {};
        MenuItem.commandArgsProperty.set(item, args);
        expect(item.commandArgs).to.be(args);
        item.commandArgs = null;
        expect(MenuItem.commandArgsProperty.get(item)).to.be(null);
      });

      it('should emit the changed signal', () => {
        let item = new MenuItem();
        let args: IChangedArgs<any> = null;
        item.changed.connect((s, a) => { args = a; });
        item.commandArgs = {};
        expect(args).to.eql({
          name: 'commandArgs',
          oldValue: null,
          newValue: {},
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

  });

});
