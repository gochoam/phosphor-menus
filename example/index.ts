/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use-strict';

import {
  DelegateCommand
} from 'phosphor-command';

import {
  Widget
} from 'phosphor-widget';

import {
  Menu, MenuBar, MenuItem
} from '../lib/index';

import './index.css';


function main() {

  let logCmd = new DelegateCommand(args => {
    var node = document.getElementById('log-span');
    node.textContent = args;
  });

  let disabledCmd = new DelegateCommand(() => { });
  disabledCmd.enabled = false;

  let saveOnExitCmd = new DelegateCommand(() => {
    logCmd.execute('Save On Exit');
    saveOnExitCmd.checked = !saveOnExitCmd.checked;
  });

  let fileMenu = new Menu([
    new MenuItem({
      text: 'New File',
      shortcut: 'Ctrl+N',
      command: logCmd,
      commandArgs: 'New File'
    }),
    new MenuItem({
      text: 'Open File',
      shortcut: 'Ctrl+O',
      command: logCmd,
      commandArgs: 'Open File'
    }),
    new MenuItem({
      text: 'Save File',
      shortcut: 'Ctrl+S',
      command: logCmd,
      commandArgs: 'Save File'
    }),
    new MenuItem({
      text: 'Save As...',
      shortcut: 'Ctrl+Shift+S',
      command: disabledCmd
    }),
    new MenuItem({
      type: MenuItem.Separator
    }),
    new MenuItem({
      text: 'Close File',
      shortcut: 'Ctrl+W',
      command: logCmd,
      commandArgs: 'Close File'
    }),
    new MenuItem({
      text: 'Close All',
      command: logCmd,
      commandArgs: 'Close All'
    }),
    new MenuItem({
      type: MenuItem.Separator
    }),
    new MenuItem({
      text: 'More...',
      submenu: new Menu([
        new MenuItem({
          text: 'One',
          command: logCmd,
          commandArgs: 'One'
        }),
        new MenuItem({
          text: 'Two',
          command: logCmd,
          commandArgs: 'Two'
        }),
        new MenuItem({
          text: 'Three',
          command: logCmd,
          commandArgs: 'Three'
        }),
        new MenuItem({
          text: 'Four',
          command: logCmd,
          commandArgs: 'Four'
        })
      ])
    }),
    new MenuItem({
      type: MenuItem.Separator
    }),
    new MenuItem({
      text: 'Exit',
      command: logCmd,
      commandArgs: 'Exit'
    })
  ]);

  let editMenu = new Menu([
    new MenuItem({
      text: '&Undo',
      icon: 'fa fa-undo',
      shortcut: 'Ctrl+Z',
      command: logCmd,
      commandArgs: 'Undo'
    }),
    new MenuItem({
      text: '&Repeat',
      icon: 'fa fa-repeat',
      shortcut: 'Ctrl+Y',
      command: disabledCmd
    }),
    new MenuItem({
      type: MenuItem.Separator
    }),
    new MenuItem({
      text: '&Copy',
      icon: 'fa fa-copy',
      shortcut: 'Ctrl+C',
      command: logCmd,
      commandArgs: 'Copy'
    }),
    new MenuItem({
      text: 'Cu&t',
      icon: 'fa fa-cut',
      shortcut: 'Ctrl+X',
      command: logCmd,
      commandArgs: 'Cut'
    }),
    new MenuItem({
      text: '&Paste',
      icon: 'fa fa-paste',
      shortcut: 'Ctrl+V',
      command: logCmd,
      commandArgs: 'Paste'
    })
  ]);

  let findMenu = new Menu([
    new MenuItem({
      text: 'Find...',
      shortcut: 'Ctrl+F',
      command: logCmd,
      commandArgs: 'Find...'
    }),
    new MenuItem({
      text: 'Find Next',
      shortcut: 'F3',
      command: logCmd,
      commandArgs: 'Find Next'
    }),
    new MenuItem({
      text: 'Find Previous',
      shortcut: 'Shift+F3',
      command: logCmd,
      commandArgs: 'Find Previous'
    }),
    new MenuItem({
      type: MenuItem.Separator
    }),
    new MenuItem({
      text: 'Replace...',
      shortcut: 'Ctrl+H',
      command: logCmd,
      commandArgs: 'Replace...'
    }),
    new MenuItem({
      text: 'Replace Next',
      shortcut: 'Ctrl+Shift+H',
      command: logCmd,
      commandArgs: 'Replace Next'
    })
  ]);

  let helpMenu = new Menu([
    new MenuItem({
      text: 'Documentation',
      command: logCmd,
      commandArgs: 'Documentation'
    }),
    new MenuItem({
      text: 'About',
      command: logCmd,
      commandArgs: 'About'
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
    }),
    new MenuItem({
      text: 'Find',
      submenu: findMenu
    }),
    new MenuItem({
      type: MenuItem.Separator
    }),
    new MenuItem({
      text: 'Help',
      submenu: helpMenu
    })
  ]);

  let contextMenu = new Menu([
    new MenuItem({
      text: '&Copy',
      icon: 'fa fa-copy',
      shortcut: 'Ctrl+C',
      command: logCmd,
      commandArgs: 'Copy'
    }),
    new MenuItem({
      text: 'Cu&t',
      icon: 'fa fa-cut',
      shortcut: 'Ctrl+X',
      command: logCmd,
      commandArgs: 'Cut'
    }),
    new MenuItem({
      text: '&Paste',
      icon: 'fa fa-paste',
      shortcut: 'Ctrl+V',
      command: logCmd,
      commandArgs: 'Paste'
    }),
    new MenuItem({
      type: MenuItem.Separator
    }),
    new MenuItem({
      text: '&New Tab',
      command: logCmd,
      commandArgs: 'New Tab'
    }),
    new MenuItem({
      text: '&Close Tab',
      command: logCmd,
      commandArgs: 'Close Tab'
    }),
    new MenuItem({
      type: MenuItem.Check,
      text: '&Save On Exit',
      command: saveOnExitCmd
    }),
    new MenuItem({
      type: MenuItem.Separator
    }),
    new MenuItem({
      text: 'Task Manager',
      command: disabledCmd
    }),
    new MenuItem({
      type: MenuItem.Separator
    }),
    new MenuItem({
      text: 'More...',
      submenu: new Menu([
        new MenuItem({
          text: 'One',
          command: logCmd,
          commandArgs: 'One'
        }),
        new MenuItem({
          text: 'Two',
          command: logCmd,
          commandArgs: 'Two'
        }),
        new MenuItem({
          text: 'Three',
          command: logCmd,
          commandArgs: 'Three'
        }),
        new MenuItem({
          text: 'Four',
          command: logCmd,
          commandArgs: 'Four'
        })
      ])
    }),
    new MenuItem({
      type: MenuItem.Separator
    }),
    new MenuItem({
      text: 'Close',
      icon: 'fa fa-close',
      command: logCmd,
      commandArgs: 'Close'
    })
  ]);

  Widget.attach(menuBar, document.getElementById('menubar-host'));

  document.addEventListener('contextmenu', (event: MouseEvent) => {
    event.preventDefault();
    let x = event.clientX;
    let y = event.clientY;
    contextMenu.popup(x, y);
  });
}


window.onload = main;
