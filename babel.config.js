module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      '@babel/preset-react',
      ['@babel/preset-typescript', { allowNamespaces: true }]
    ],
    plugins: [
      // Add any additional plugins if needed
    ]
  };
};
