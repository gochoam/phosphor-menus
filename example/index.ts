/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use-strict';

import {
  Widget
} from 'phosphor-widget';

import {
  Menu, MenuBar, MenuItem
} from '../lib/index';

import './index.css';


function logItem(item: MenuItem): void {
  console.log(item.text);
}


let MENU_BAR_TEMPLATE = [
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
        icon: 'fa fa-undo',
        shortcut: 'Ctrl+Z',
        handler: logItem
      },
      {
        text: '&Repeat',
        icon: 'fa fa-repeat',
        shortcut: 'Ctrl+Y',
        handler: logItem
      },
      {
        type: 'separator'
      },
      {
        text: '&Copy',
        icon: 'fa fa-copy',
        shortcut: 'Ctrl+C',
        handler: logItem
      },
      {
        text: 'Cu&t',
        icon: 'fa fa-cut',
        shortcut: 'Ctrl+X',
        handler: logItem
      },
      {
        text: '&Paste',
        icon: 'fa fa-paste',
        shortcut: 'Ctrl+V',
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


let CONTEXT_MENU_TEMPLATE = [
  {
    text: '&Copy',
    icon: 'fa fa-copy',
    shortcut: 'Ctrl+C',
    handler: logItem
  },
  {
    text: 'Cu&t',
    icon: 'fa fa-cut',
    shortcut: 'Ctrl+X',
    handler: logItem
  },
  {
    text: '&Paste',
    icon: 'fa fa-paste',
    shortcut: 'Ctrl+V',
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
    icon: 'fa fa-close',
    handler: logItem
  }
];


function main(): void {
  let menuBar = MenuBar.fromTemplate(MENU_BAR_TEMPLATE);

  let contextMenu = Menu.fromTemplate(CONTEXT_MENU_TEMPLATE);

  Widget.attach(menuBar, document.body);

  document.addEventListener('contextmenu', (event: MouseEvent) => {
    event.preventDefault();
    let x = event.clientX;
    let y = event.clientY;
    contextMenu.popup(x, y);
  });
}


window.onload = main;
