module.exports = {
  entry: './example/index.js',
  output: {
    filename: './example/bundle.js'
  },
  bail: true,
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style-loader!css-loader' },
    ]
  }
}
