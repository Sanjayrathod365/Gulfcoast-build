module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    // Temporarily disable exhaustive-deps to focus on fixing other errors first
    'react-hooks/exhaustive-deps': 'off',
    
    // Keep type checking rules enabled but configure them
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_' 
    }],
    
    // Allow unescaped entities temporarily
    'react/no-unescaped-entities': 'off'
  }
}; 