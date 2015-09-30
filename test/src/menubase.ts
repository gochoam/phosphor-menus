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
  MenuBase, MenuItem
} from '../../lib/index';


describe('phosphor-menus', () => {

  describe('MenuBase', () => {

    describe('.itemsProperty', () => {

      it('should be a property descriptor', () => {
        expect(MenuBase.itemsProperty instanceof Property).to.be(true);
      });

      it('should default a frozen empty list', () => {
        var menu = new MenuBase();
        var items = MenuBase.itemsProperty.get(menu)
        expect(items).to.eql([]);
        expect(() => items.push(new MenuItem())).to.throwError();
      });

    });

    describe('#constructor()', () => {

      it('should accept no arguments', () => {
        var menu = new MenuBase();
        expect(menu instanceof MenuBase).to.be(true);
      });

    });

  });

});
