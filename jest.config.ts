export default {
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  setupFiles: ['jest-extended', 'dotenv/config'],
};
