/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  Command, SimpleCommand
} from 'phosphor-command';

import {
  Menu
} from '../lib/index';

import './index.css';


function logHandler(args: any): void {
  console.log('executed');
}


function createCommand(text: string): Command {
  return new SimpleCommand({ handler: logHandler, text });
}


function main() {

  // let logHandler = (item: MenuItem) => {
  //   var node = document.getElementById('log-span');
  //   node.textContent = item.text.replace(/&/g, '');
  // };

  // let saveOnExitHandler = (item: MenuItem) => {
  //   logHandler(item);
  //   item.checked = !item.checked;
  // };

  // let fileMenu = new Menu([
  //   new MenuItem({
  //     text: 'New File',
  //     shortcut: 'Ctrl+N',
  //     handler: logHandler,
  //   }),
  //   new MenuItem({
  //     text: 'Open File',
  //     shortcut: 'Ctrl+O',
  //     handler: logHandler,
  //   }),
  //   new MenuItem({
  //     text: 'Save File',
  //     shortcut: 'Ctrl+S',
  //     handler: logHandler,
  //   }),
  //   new MenuItem({
  //     text: 'Save As...',
  //     shortcut: 'Ctrl+Shift+S',
  //     disabled: true,
  //     handler: logHandler,
  //   }),
  //   new MenuItem({
  //     type: MenuItem.Separator
  //   }),
  //   new MenuItem({
  //     text: 'Close File',
  //     shortcut: 'Ctrl+W',
  //     handler: logHandler,
  //   }),
  //   new MenuItem({
  //     text: 'Close All',
  //     handler: logHandler,
  //   }),
  //   new MenuItem({
  //     type: MenuItem.Separator
  //   }),
  //   new MenuItem({
  //     text: 'More...',
  //     submenu: new Menu([
  //       new MenuItem({
  //         text: 'One',
  //         handler: logHandler,
  //       }),
  //       new MenuItem({
  //         text: 'Two',
  //         handler: logHandler,
  //       }),
  //       new MenuItem({
  //         text: 'Three',
  //         handler: logHandler,
  //       }),
  //       new MenuItem({
  //         text: 'Four',
  //         handler: logHandler,
  //       })
  //     ])
  //   }),
  //   new MenuItem({
  //     type: MenuItem.Separator
  //   }),
  //   new MenuItem({
  //     text: 'Exit',
  //     handler: logHandler,
  //   })
  // ]);

  // let editMenu = new Menu([
  //   new MenuItem({
  //     text: '&Undo',
  //     icon: 'fa fa-undo',
  //     shortcut: 'Ctrl+Z',
  //     handler: logHandler,
  //   }),
  //   new MenuItem({
  //     text: '&Repeat',
  //     icon: 'fa fa-repeat',
  //     shortcut: 'Ctrl+Y',
  //     disabled: true,
  //     handler: logHandler,
  //   }),
  //   new MenuItem({
  //     type: MenuItem.Separator
  //   }),
  //   new MenuItem({
  //     text: '&Copy',
  //     icon: 'fa fa-copy',
  //     shortcut: 'Ctrl+C',
  //     handler: logHandler,
  //   }),
  //   new MenuItem({
  //     text: 'Cu&t',
  //     icon: 'fa fa-cut',
  //     shortcut: 'Ctrl+X',
  //     handler: logHandler,
  //   }),
  //   new MenuItem({
  //     text: '&Paste',
  //     icon: 'fa fa-paste',
  //     shortcut: 'Ctrl+V',
  //     handler: logHandler,
  //   })
  // ]);

  // let findMenu = new Menu([
  //   new MenuItem({
  //     text: 'Find...',
  //     shortcut: 'Ctrl+F',
  //     handler: logHandler,
  //   }),
  //   new MenuItem({
  //     text: 'Find Next',
  //     shortcut: 'F3',
  //     handler: logHandler,
  //   }),
  //   new MenuItem({
  //     text: 'Find Previous',
  //     shortcut: 'Shift+F3',
  //     handler: logHandler,
  //   }),
  //   new MenuItem({
  //     type: MenuItem.Separator
  //   }),
  //   new MenuItem({
  //     text: 'Replace...',
  //     shortcut: 'Ctrl+H',
  //     handler: logHandler,
  //   }),
  //   new MenuItem({
  //     text: 'Replace Next',
  //     shortcut: 'Ctrl+Shift+H',
  //     handler: logHandler,
  //   })
  // ]);

  // let helpMenu = new Menu([
  //   new MenuItem({
  //     text: 'Documentation',
  //     handler: logHandler,
  //   }),
  //   new MenuItem({
  //     text: 'About',
  //     handler: logHandler,
  //   })
  // ]);

  // let menuBar = new MenuBar([
  //   new MenuItem({
  //     text: 'File',
  //     submenu: fileMenu
  //   }),
  //   new MenuItem({
  //     text: 'Edit',
  //     submenu: editMenu
  //   }),
  //   new MenuItem({
  //     text: 'Find',
  //     submenu: findMenu
  //   }),
  //   new MenuItem({
  //     text: 'View',
  //     type: MenuItem.Submenu
  //   }),
  //   new MenuItem({
  //     type: MenuItem.Separator
  //   }),
  //   new MenuItem({
  //     text: 'Help',
  //     submenu: helpMenu
  //   })
  // ]);

  // let contextMenu = new Menu([
  //   new MenuItem({
  //     text: '&Copy',
  //     icon: 'fa fa-copy',
  //     shortcut: 'Ctrl+C',
  //     handler: logHandler,
  //   }),
  //   new MenuItem({
  //     text: 'Cu&t',
  //     icon: 'fa fa-cut',
  //     shortcut: 'Ctrl+X',
  //     handler: logHandler,
  //   }),
  //   new MenuItem({
  //     text: '&Paste',
  //     icon: 'fa fa-paste',
  //     shortcut: 'Ctrl+V',
  //     handler: logHandler,
  //   }),
  //   new MenuItem({
  //     type: MenuItem.Separator
  //   }),
  //   new MenuItem({
  //     text: '&New Tab',
  //     handler: logHandler,
  //   }),
  //   new MenuItem({
  //     text: '&Close Tab',
  //     handler: logHandler,
  //   }),
  //   new MenuItem({
  //     type: MenuItem.Check,
  //     checked: true,
  //     text: '&Save On Exit',
  //     handler: saveOnExitHandler,
  //   }),
  //   new MenuItem({
  //     type: MenuItem.Separator
  //   }),
  //   new MenuItem({
  //     text: 'Task Manager',
  //     disabled: true,
  //     handler: logHandler,
  //   }),
  //   new MenuItem({
  //     type: MenuItem.Separator
  //   }),
  //   new MenuItem({
  //     text: 'More...',
  //     submenu: new Menu([
  //       new MenuItem({
  //         text: 'One',
  //         handler: logHandler,
  //       }),
  //       new MenuItem({
  //         text: 'Two',
  //         handler: logHandler,
  //       }),
  //       new MenuItem({
  //         text: 'Three',
  //         handler: logHandler,
  //       }),
  //       new MenuItem({
  //         text: 'Four',
  //         handler: logHandler,
  //       })
  //     ])
  //   }),
  //   new MenuItem({
  //     type: MenuItem.Separator
  //   }),
  //   new MenuItem({
  //     text: 'Close',
  //     icon: 'fa fa-close',
  //     handler: logHandler,
  //   })
  // ]);

  // menuBar.attach(document.getElementById('menubar-host'));

  let popup = new Menu();
  popup.addCommand({ command: createCommand('Cut'), shortcut: 'Ctrl+X' });
  popup.addCommand({ command: createCommand('Copy'), shortcut: 'Ctrl+C' });
  popup.addCommand({ command: createCommand('Paste'), shortcut: 'Ctrl+V' });

  document.addEventListener('contextmenu', (event: MouseEvent) => {
    event.preventDefault();
    let x = event.clientX;
    let y = event.clientY;
    popup.open(x, y);
  });
}


window.onload = main;
