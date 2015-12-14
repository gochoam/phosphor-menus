phosphor-menus
==============

[![Build Status](https://travis-ci.org/phosphorjs/phosphor-menus.svg)](https://travis-ci.org/phosphorjs/phosphor-menus?branch=master)
[![Coverage Status](https://coveralls.io/repos/phosphorjs/phosphor-menus/badge.svg?branch=master&service=github)](https://coveralls.io/github/phosphorjs/phosphor-menus?branch=master)

Phosphor widgets for creating menus and menu bars.

[API Docs](http://phosphorjs.github.io/phosphor-menus/api/)


Package Install
---------------

**Prerequisites**
- [node](http://nodejs.org/)

```bash
npm install --save phosphor-menus
```


Source Build
------------

**Prerequisites**
- [git](http://git-scm.com/)
- [node](http://nodejs.org/)

```bash
git clone https://github.com/phosphorjs/phosphor-menus.git
cd phosphor-menus
npm install
```

**Rebuild**
```bash
npm run clean
npm run build
```


Run Tests
---------

Follow the source build instructions first.

```bash
# run tests in Firefox
npm test

# run tests in Chrome
npm run test:chrome

# run tests in IE
npm run test:ie
```


Build Docs
----------

Follow the source build instructions first.

```bash
npm run docs
```

Navigate to `docs/index.html`.


Supported Runtimes
------------------

The runtime versions which are currently *known to work* are listed below.
Earlier versions may also work, but come with no guarantees.

- IE 11+
- Firefox 32+
- Chrome 38+


Bundle for the Browser
----------------------

Follow the package install instructions first.

```bash
npm install --save-dev browserify browserify-css
browserify myapp.js -o mybundle.js
```


Usage Examples
--------------

**Note:** This module is fully compatible with Node/Babel/ES6/ES5. Simply
omit the type declarations when using a language other than TypeScript.

```typescript
import {
  DelegateCommand
} from 'phosphor-command';

import {
  Menu, MenuBar, MenuItem
} from 'phosphor-menus';


function main(): void {

  // A menu item takes an `ICommand` to execute its action when clicked.
  // A `DelegateCommand` is the simplest way to define a command, but an
  // application is free to define its own command implementations.
  let newCmd = new DelegateCommand(...);
  let openCmd = new DelegateCommand(...);
  let saveCmd = new DelegateCommand(...);
  let exitCmd = new DelegateCommand(...);
  let undoCmd = new DelegateCommand(...);
  let repeatCmd = new DelegateCommand(...);
  let copyCmd = new DelegateCommand(...);
  let cutCmd = new DelegateCommand(...);
  let pasteCmd = new DelegateCommand(...);

  let fileMenu = new Menu([
    new MenuItem({
      text: 'New File',
      shortcut: 'Ctrl+N',
      command: newCmd
    }),
    new MenuItem({
      text: 'Open File',
      shortcut: 'Ctrl+O',
      command: openCmd
    }),
    new MenuItem({
      text: 'Save As...',
      shortcut: 'Ctrl+Shift+S',
      command: saveCmd
    }),
    new MenuItem({
      type: MenuItem.Separator
    }),
    new MenuItem({
      text: 'Exit',
      command: exitCmd
    })
  ]);

  let editMenu = new Menu([
    new MenuItem({
      text: '&Undo',
      icon: 'fa fa-undo',
      shortcut: 'Ctrl+Z',
      command: undoCmd
    }),
    new MenuItem({
      text: '&Repeat',
      icon: 'fa fa-repeat',
      shortcut: 'Ctrl+Y',
      command: repeatCmd
    }),
    new MenuItem({
      type: MenuItem.Separator
    }),
    new MenuItem({
      text: '&Copy',
      icon: 'fa fa-copy',
      shortcut: 'Ctrl+C',
      command: copyCmd
    }),
    new MenuItem({
      text: 'Cu&t',
      icon: 'fa fa-cut',
      shortcut: 'Ctrl+X',
      command: cutCmd
    }),
    new MenuItem({
      text: '&Paste',
      icon: 'fa fa-paste',
      shortcut: 'Ctrl+V',
      command: pasteCmd
    })
  ]);

  let contextMenu = new Menu([
    new MenuItem({
      text: '&Copy',
      icon: 'fa fa-copy',
      shortcut: 'Ctrl+C',
      command: copyCmd
    }),
    new MenuItem({
      text: 'Cu&t',
      icon: 'fa fa-cut',
      shortcut: 'Ctrl+X',
      command: cutCmd
    }),
    new MenuItem({
      text: '&Paste',
      icon: 'fa fa-paste',
      shortcut: 'Ctrl+V',
      command: pastCmd
    })
  ]);

  let menuBar = new MenuBar([
    new MenuItem({
      text: 'File',
      submenu: fileMenu
    }),
    new MenuItem({
      text: 'Edit',
      submenu: editMenu
    })
  ]);

  menuBar.attach(document.body);

  document.addEventListener('contextmenu', (event: MouseEvent) => {
    event.preventDefault();
    let x = event.clientX;
    let y = event.clientY;
    contextMenu.popup(x, y);
  });
}
```
