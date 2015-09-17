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


function logCommandRequest(sender: any, cmd: string): void {
  console.log('command requested:', cmd);
}


function makeSeparator(): MenuItem {
  return new MenuItem({ type: MenuItem.Separator });
}


function main(): void {

  var copyItem = new MenuItem({
    text: 'Copy',
    mnemonic: 'c',
    shortcut: 'Ctrl+C',
    className: 'copy',
    handler: () => console.log('Copy'),
  });

  var cutItem = new MenuItem({
    text: 'Cut',
    mnemonic: 'x',
    shortcut: 'Ctrl+X',
    className: 'cut',
    handler: () => console.log('Cut'),
  });

  var pasteItem = new MenuItem({
    text: 'Paste',
    mnemonic: 'v',
    shortcut: 'Ctrl+V',
    className: 'paste',
    handler: () => console.log('Paste'),
  });

  var newTabItem = new MenuItem({
    text: 'New Tab',
    mnemonic: 'n',
    handler: () => console.log('New Tab'),
  });

  var closeTabItem = new MenuItem({
    text: 'Close Tab',
    mnemonic: 'c',
    handler: () => console.log('Close Tab'),
  });

  var saveOnExitItem = new MenuItem({
    text: 'Save On Exit',
    type: MenuItem.Check,
    checked: true,
    mnemonic: 's',
    handler: (item: MenuItem) => {
      item.checked = !item.checked;
      console.log('Save on exit:', item.checked);
    },
  });

  var taskMgrItem = new MenuItem({
    text: 'Task Manager',
    disabled: true,
    command: 'my-proj:launch-taskmgr',
  });

  var moreMenu = new Menu();

  moreMenu.items = [
    new MenuItem({ text: 'One', command: 'my-proj:cmd-one' }),
    new MenuItem({ text: 'Two', command: 'my-proj:cmd-two' }),
    new MenuItem({ text: 'Three', command: 'my-proj:cmd-three' }),
    new MenuItem({ text: 'Four', command: 'my-proj:cmd-four' }),
    new MenuItem({ text: 'Five', command: 'my-proj:cmd-five' }),
  ];

  var moreItem = new MenuItem({
    text: 'More...',
    submenu: moreMenu,
  });

  var closeItem = new MenuItem({
    text: 'Close',
    className: 'close',
    handler: () => console.log('Close'),
  });

  var newFileItem = new MenuItem({
    text: 'New File',
    shortcut: 'Ctrl+N',
    command: 'my-proj:new-file',
  });

  var openFileItem = new MenuItem({
    text: 'Open File',
    shortcut: 'Ctrl+O',
    command: 'my-proj:open-file',
  });

  var saveFileItem = new MenuItem({
    text: 'Save File',
    shortcut: 'Ctrl+S',
    command: 'my-proj:save-file',
  });

  var saveAsItem = new MenuItem({
    text: 'Save As...',
    shortcut: 'Ctrl+Shift+S',
    command: 'my-proj:save-as',
  });

  var closeFileItem = new MenuItem({
    text: 'Close File',
    shortcut: 'Ctrl+W',
    command: 'my-proj:close-file',
  });

  var closeAllItem = new MenuItem({
    text: 'Close All Files',
    command: 'my-proj:close-all',
  });

  var exitItem = new MenuItem({
    text: 'Exit',
    command: 'my-proj:exit',
  });

  var fileMenu = new Menu();

  fileMenu.items = [
    newFileItem,
    openFileItem,
    saveFileItem,
    saveAsItem,
    makeSeparator(),
    closeFileItem,
    closeAllItem,
    makeSeparator(),
    moreItem,
    makeSeparator(),
    exitItem,
  ];

  var fileItem = new MenuItem({
    text: 'File',
    submenu: fileMenu,
  });

  var undoItem = new MenuItem({
    text: 'Undo',
    shortcut: 'Ctrl+Z',
    className: 'undo',
    handler: () => console.log('Undo'),
  });

  var repeatItem = new MenuItem({
    text: 'Repeat',
    shortcut: 'Ctrl+Y',
    className: 'repeat',
    handler: () => console.log('Repeat'),
  });

  var editMenu = new Menu();

  editMenu.items = [
    undoItem,
    repeatItem,
    makeSeparator(),
    copyItem,
    cutItem,
    pasteItem,
  ];

  var editItem = new MenuItem({
    text: 'Edit',
    submenu: editMenu,
  });

  var findItem = new MenuItem({
    text: 'Find...',
    shortcut: 'Ctrl+F',
    command: 'my-proj:find',
  });

  var findNextItem = new MenuItem({
    text: 'Find Next',
    shortcut: 'F3',
    command: 'my-proj:find-next',
  });

  var findPrevItem = new MenuItem({
    text: 'Find Previous',
    shortcut: 'Shift+F3',
    command: 'my-proj:find-prev',
  });

  var replaceItem = new MenuItem({
    text: 'Replace...',
    shortcut: 'Ctrl+H',
    command: 'my-proj:replace',
  });

  var replaceNextItem = new MenuItem({
    text: 'Replace Next',
    shortcut: 'Ctrl+Shift+H',
    command: 'my-proj:replace-next',
  });

  var fmMenu = new Menu();

  fmMenu.items = [
    findItem,
    findNextItem,
    findPrevItem,
    makeSeparator(),
    replaceItem,
    replaceNextItem,
  ];

  var fmItem = new MenuItem({
    text: 'Find',
    submenu: fmMenu,
  });

  var viewItem = new MenuItem({
    text: 'View',
    disabled: true,
  });

  var helpMenu = new Menu();

  helpMenu.items = [
    new MenuItem({
      text: 'Documentation',
      command: 'my-proj:open-docs',
    }),
    new MenuItem({
      text: 'About',
      command: 'my-proj:open-about',
    }),
  ];

  var helpItem = new MenuItem({
    text: 'Help',
    submenu: helpMenu,
  });

  var contextMenu = new Menu()

  contextMenu.items = [
    copyItem,
    cutItem,
    pasteItem,
    makeSeparator(),
    newTabItem,
    closeTabItem,
    saveOnExitItem,
    makeSeparator(),
    taskMgrItem,
    makeSeparator(),
    moreItem,
    makeSeparator(),
    closeItem,
  ];

  var menubar = new MenuBar();

  menubar.items = [
    fileItem,
    editItem,
    fmItem,
    viewItem,
    makeSeparator(),
    helpItem,
  ];

  contextMenu.commandRequested.connect(logCommandRequest);

  menubar.commandRequested.connect(logCommandRequest);

  attachWidget(menubar, document.body);

  document.addEventListener('contextmenu', (event: MouseEvent) => {
    event.preventDefault();
    var x = event.clientX;
    var y = event.clientY;
    contextMenu.popup(x, y);
  });
}


window.onload = main;
