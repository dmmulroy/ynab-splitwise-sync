export default {
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['jest-extended'],
};
