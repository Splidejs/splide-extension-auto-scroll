module.exports = {
  presets: [
    [
      '@babel/env',
      {
        'modules': false,
        'loose'  : true,
      },
    ],
  ],
  env: {
    test: {
      presets: [
        [
          '@babel/env',
        ],
      ],
      plugins: [
        '@babel/plugin-transform-modules-commonjs',
      ],
    },
  },
  plugins: [
    '@babel/plugin-transform-modules-commonjs',
  ],
};