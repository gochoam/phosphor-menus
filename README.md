phosphor-menus
==============

[![Build Status](https://travis-ci.org/phosphorjs/phosphor-menus.svg)](https://travis-ci.org/phosphorjs/phosphor-menus?branch=master)
[![Coverage Status](https://coveralls.io/repos/phosphorjs/phosphor-menus/badge.svg?branch=master&service=github)](https://coveralls.io/github/phosphorjs/phosphor-menus?branch=master)

This module provides phosphor widgets for creating menus, contextual menus and
menu bars. The user can customize each menu entry, assign a keyboard shortcut
and an icon.


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

The basic constructor to create a new menu is `Menu()`, which takes as argument
a list of menu items. Many components of each `MenuItem` can be further
customized: the `text` to show in the corresponding menu entry, a keyboard
`shortcut`, an event `handler` and an `icon`.

There are special menu items that provide extra flexibility. A `.Separator`
inserts a line between adjacent menu items for a better visual organization. It
is also possible to create a `submenu` to display a new `Menu` instance inside
a menu item.


```typescript
import {
  Menu, MenuBar, MenuItem
} from '../lib/index';

import './index.css';

// Handlers for the cliicking events
let logHandler = (item: MenuItem) => {
  var node = document.getElementById('log-span');
  node.textContent = item.text.replace(/&/g, '');
};

// File menu
let fileMenu = new Menu([
  new MenuItem({
    text: 'New File',
    shortcut: 'Ctrl+N',
    handler: logHandler,
  }),
  new MenuItem({
    text: 'Open File',
    shortcut: 'Ctrl+O',
    handler: logHandler,
  }),
  new MenuItem({
    text: 'Save File',
    shortcut: 'Ctrl+S',
    handler: logHandler,
  }),
  new MenuItem({
    type: MenuItem.Separator
  }),
  new MenuItem({
    text: 'Close File',
    shortcut: 'Ctrl+W',
    handler: logHandler,
  }),

	// Submenu
  new MenuItem({
    text: 'More...',
    submenu: new Menu([
      new MenuItem({
        text: 'One',
        handler: logHandler,
      }),
      new MenuItem({
        text: 'Two',
        handler: logHandler,
      })
    ])
  })
]);

// Edit Menu
let editMenu = new Menu([
  new MenuItem({
    text: '&Undo',
    icon: 'fa fa-undo',
    shortcut: 'Ctrl+Z',
    handler: logHandler,
  }),
  new MenuItem({
    type: MenuItem.Separator
  }),
  new MenuItem({
    text: '&Copy',
    icon: 'fa fa-copy',
    shortcut: 'Ctrl+C',
    handler: logHandler,
  }),
  new MenuItem({
    text: 'Cu&t',
    icon: 'fa fa-cut',
    shortcut: 'Ctrl+X',
    handler: logHandler,
  }),
  new MenuItem({
    text: '&Paste',
    icon: 'fa fa-paste',
    shortcut: 'Ctrl+V',
    handler: logHandler,
  })
]);
```

The menus created by the previous snippet can now be grouped into a main bar.
This is accomplished with the  `menuBar` constructor, which takes as argument a
list of menu items.

```typescript
// Main Menu Bar
let menuBar = new MenuBar([
  new MenuItem({
    text: 'File',
    submenu: fileMenu
  }),
  new MenuItem({
    text: 'Edit',
    submenu: editMenu
  }),
  new MenuItem({
    type: MenuItem.Separator
  }),
  new MenuItem({
    text: 'View',
    type: MenuItem.Submenu
  })
]);
```

Context menus are also supported by this module by means of the `contextMenu`
constructor. The syntax is the same as for regular menus and menu bars.

The following example also shows two additional features of menu items: the
possibility of disabling an item with the `disabled` flag, and the `checked`
flag to change the state of the item.


```typescript
// Context Menu
let contextMenu = new Menu([
  new MenuItem({
    text: '&Copy',
    icon: 'fa fa-copy',
    shortcut: 'Ctrl+C',
    handler: logHandler,
  }),
  new MenuItem({
    text: 'Cu&t',
    icon: 'fa fa-cut',
    shortcut: 'Ctrl+X',
    handler: logHandler,
  }),
  new MenuItem({
    text: '&Paste',
    icon: 'fa fa-paste',
    shortcut: 'Ctrl+V',
    handler: logHandler,
  }),
  new MenuItem({
    type: MenuItem.Separator
  }),
  new MenuItem({
    text: 'Task Manager',
    disabled: true,
    handler: logHandler,
  }),
  new MenuItem({
    type: MenuItem.Separator
  }),
  new MenuItem({
    text: 'More...',
    submenu: new Menu([
      new MenuItem({
        text: 'One',
        handler: logHandler,
      }),
      new MenuItem({
        text: 'Two',
        handler: logHandler,
      })
    ])
  }),
  new MenuItem({
    type: MenuItem.Separator
  }),
  new MenuItem({
    text: 'Close',
    icon: 'fa fa-close',
    handler: logHandler,
  })
]);

document.addEventListener('contextmenu', (event: MouseEvent) => {
  event.preventDefault();
  let x = event.clientX;
  let y = event.clientY;
  contextMenu.popup(x, y);
});

window.onload = () => { 
	menuBar.attach(document.getElementById('menubar-host'));
}
```

API
---

[API Docs](http://phosphorjs.github.io/phosphor-menus/api/)

