const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

// Expo Web custom webpack configuration to stub out react-native-maps on web
module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  // Remove webpack-manifest-plugin (incompatible version) to avoid compilation errors
  if (Array.isArray(config.plugins)) {
    config.plugins = config.plugins.filter(
      (plugin) => !['WebpackManifestPlugin', 'ManifestPlugin'].includes(
        plugin.constructor && plugin.constructor.name
      )
    );
  }
  // Redirect react-native-maps imports to a web stub
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    'react-native-maps': path.resolve(__dirname, 'src/MapViewStub.js'),
  };
  return config;
};