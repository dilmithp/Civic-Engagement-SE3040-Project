module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { node: 'current' },
        modules: 'commonjs',
      },
    ],
  ],
  plugins: [
    // Transforms import.meta.url → a CommonJS __filename-based equivalent
    // Required because Jest runs in CommonJS mode (via babel-jest) but the
    // source uses `import.meta.url` for __dirname resolution (ESM pattern).
    'babel-plugin-transform-import-meta',
  ],
};
