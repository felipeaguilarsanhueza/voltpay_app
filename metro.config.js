// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Alias para reemplazar react-native-maps por el stub web
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'react-native-maps': path.resolve(__dirname, 'src/MapViewStub.js'),
};

module.exports = config;


