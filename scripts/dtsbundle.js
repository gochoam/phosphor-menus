require('dts-generator').generate({
  name: 'phosphor-menus',
  main: 'phosphor-menus/index',
  baseDir: 'lib',
  files: ['index.d.ts'],
  out: 'lib/phosphor-menus.d.ts',
});
