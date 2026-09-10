module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@reduxjs/toolkit|immer|redux-saga|react-redux|@react-navigation|react-native-gesture-handler)/)',
  ],
};
