/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use-strict';

import {
  attachWidget
} from 'phosphor-widget';

import {
  Menu, MenuBar, MenuItem
} from '../lib/index';

import './index.css';



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
        shortcut: 'Ctrl+O',
        handler: logItem
      },
      {
        text: 'Save File',
        shortcut: 'Ctrl+S',
        handler: logItem
      },
      {
        text: 'Save As...',
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


var CONTEXT_MENU_TEMPLATE = [
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
  },
  {
    type: 'separator'
  },
  {
    text: '&New Tab',
    handler: logItem
  },
  {
    text: '&Close Tab',
    handler: logItem
  },
  {
    type: 'check',
    checked: true,
    text: '&Save On Exit',
    handler: (item: MenuItem) => {
      item.checked = !item.checked;
      console.log('Save On Exit:', item.checked);
    }
  },
  {
    type: 'separator'
  },
  {
    text: 'Task Manager',
    disabled: true
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
    text: 'Close',
    className: 'close',
    handler: logItem
  }
];


function main(): void {

  var menuBar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);
  var contextMenu = Menu.fromTemplate(CONTEXT_MENU_TEMPLATE);

  attachWidget(menuBar, document.body);

  document.addEventListener('contextmenu', (event: MouseEvent) => {
    event.preventDefault();
    var x = event.clientX;
    var y = event.clientY;
    contextMenu.popup(x, y);
  });
}


window.onload = main;
