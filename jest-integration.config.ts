import baseConfig from './jest.config';

export default {
  ...baseConfig,
  testMatch: [
    '**/__tests__/**/*.integration.+(ts|tsx|js)',
    '**/?(*.)+(integration).[jt]s?(x)',
  ],
};
