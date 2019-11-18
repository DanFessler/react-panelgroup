module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'ReactPanelGroup',
      externals: {
        react: 'React'
      }
    }
  }
};
