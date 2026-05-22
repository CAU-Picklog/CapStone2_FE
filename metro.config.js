const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// import.meta 문법을 쓰는 node_modules도 Babel로 변환하도록 강제
// zustand v4가 import.meta를 사용해서 웹에서 SyntaxError 발생
config.transformer.transformIgnorePatterns = [
  'node_modules/(?!(react-native|@react-native|expo|@expo|zustand|@react-navigation)/)',
];

config.resolver.unstable_enablePackageExports = true;

module.exports = config;
