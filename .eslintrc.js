module.exports = {
    root: true,
    env: {
        browser: true,
        node: true
    },
    parserOptions: {
        parser: 'babel-eslint'
    },
    extends: ['@nuxtjs', 'prettier', 'prettier/vue', 'plugin:nuxt/recommended'],
    plugins: ['prettier'],
    // add your custom rules here
    rules: {
        'nuxt/no-cjs-in-config': 'off',
        // "function-paren-newline": ["error", "never"],
        'max-len': [
            'off',
            180,
            4,
            {
                ignoreUrls: true,
                ignoreComments: true,
                ignoreRegExpLiterals: true,
                ignoreDestructuring: true,
                properties: 'never',
                ignoreStrings: true,
                ignoreTemplateLiterals: true
            }
        ]
    }
}
