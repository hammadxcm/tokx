export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', ['core', 'cli', 'web', 'tooling', 'ci', 'docs', 'deps']],
  },
};
