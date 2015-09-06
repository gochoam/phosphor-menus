/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use-strict';

import {
  Menu, MenuItem
} from '../lib/index';

import './index.css';


function main(): void {

  var onCut = () => console.log('Cut');
  var onCopy = () => console.log('Copy');
  var onPaste = () => console.log('Paste');
  var onNewTab = () => console.log('New Tab');
  var onClose = () => console.log('Close');
  var onCloseTab = () => console.log('Close Tab');
  var onUndo = () => console.log('Undo');
  var onRepeat = () => console.log('Repeat');
  var onToggleSave = (item: MenuItem, checked: boolean) => console.log('Save on exit:', checked);

  var copyItem = new MenuItem({
    text: 'Copy',
    mnemonic: 'c',
    shortcut: 'Ctrl+C',
    className: 'copy',
  });

  var cutItem = new MenuItem({
    text: 'Cut',
    mnemonic: 'x',
    shortcut: 'Ctrl+X',
    className: 'cut',
  });

  var pasteItem = new MenuItem({
    text: 'Paste',
    mnemonic: 'v',
    shortcut: 'Ctrl+V',
    className: 'paste',
  });

  var newTabItem = new MenuItem({
    text: 'New Tab',
    mnemonic: 'n',
  });

  var closeTabItem = new MenuItem({
    text: 'Close Tab',
    mnemonic: 'c',
  });

  copyItem.triggered.connect(onCopy);
  cutItem.triggered.connect(onCut);
  pasteItem.triggered.connect(onPaste);
  newTabItem.triggered.connect(onNewTab);
  closeTabItem.triggered.connect(onCloseTab);

  var saveOnExitItem = new MenuItem({
    text: 'Save On Exit',
    type: MenuItem.Check,
    checked: true,
    mnemonic: 's',
  });

  saveOnExitItem.toggled.connect(onToggleSave);

  var taskMgrItem = new MenuItem({
    text: 'Task Manager',
    disabled: true,
  });

  var moreMenu = new Menu();
  moreMenu.items = [
    new MenuItem({ text: 'One' }),
    new MenuItem({ text: 'Two' }),
    new MenuItem({ text: 'Three' }),
    new MenuItem({ text: 'Four' }),
    new MenuItem({ text: 'Five' }),
  ];

  var moreItem = new MenuItem({
    text: 'More...',
    submenu: moreMenu,
  });

  var closeItem = new MenuItem({
    text: 'Close',
    className: 'close',
  });

  closeItem.triggered.connect(onClose);

  var separator = () => new MenuItem({ type: MenuItem.Separator });

  var newFileItem = new MenuItem({
    text: 'New File',
    shortcut: 'Ctrl+N',
  });

  var openFileItem = new MenuItem({
    text: 'Open File',
    shortcut: 'Ctrl+O',
  });

  var saveFileItem = new MenuItem({
    text: 'Save File',
    shortcut: 'Ctrl+S',
  });

  var saveAsItem = new MenuItem({
    text: 'Save As...',
    shortcut: 'Ctrl+Shift+S',
  });

  var closeFileItem = new MenuItem({
    text: 'Close File',
    shortcut: 'Ctrl+W',
  });

  var closeAllItem = new MenuItem({ text: 'Close All Files' });

  var exitItem = new MenuItem({ text: 'Exit' });

  var fileMenu = new Menu();
  fileMenu.items = [
    newFileItem,
    openFileItem,
    saveFileItem,
    saveAsItem,
    separator(),
    closeFileItem,
    closeAllItem,
    separator(),
    moreItem,
    separator(),
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
  });

  var repeatItem = new MenuItem({
    text: 'Repeat',
    shortcut: 'Ctrl+Y',
    className: 'repeat',
  });

  undoItem.triggered.connect(onUndo);
  repeatItem.triggered.connect(onRepeat);

  var editMenu = new Menu();
  editMenu.items = [
    undoItem,
    repeatItem,
    separator(),
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
  });

  var findNextItem = new MenuItem({
    text: 'Find Next',
    shortcut: 'F3',
  });

  var findPrevItem = new MenuItem({
    text: 'Find Previous',
    shortcut: 'Shift+F3',
  });

  var replaceItem = new MenuItem({
    text: 'Replace...',
    shortcut: 'Ctrl+H',
  });

  var replaceNextItem = new MenuItem({
    text: 'Replace Next',
    shortcut: 'Ctrl+Shift+H',
  });

  var fmMenu = new Menu();
  fmMenu.items = [
    findItem,
    findNextItem,
    findPrevItem,
    separator(),
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
    new MenuItem({ text: 'Documentation' }),
    new MenuItem({ text: 'About' }),
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
    separator(),
    newTabItem,
    closeTabItem,
    saveOnExitItem,
    separator(),
    taskMgrItem,
    separator(),
    moreItem,
    separator(),
    closeItem,
  ];

  // var menubar = new MenuBar([
  //   fileItem,
  //   editItem,
  //   fmItem,
  //   viewItem,
  //   separator(),
  //   helpItem,
  // ]);

  //menubar.attach(document.getElementById('container'));

  document.addEventListener('contextmenu', (event: MouseEvent) => {
    event.preventDefault();
    var x = event.clientX;
    var y = event.clientY;
    contextMenu.popup(x, y);
  });
}


window.onload = main;
