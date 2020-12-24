const path = require('path');
const copyPlugin = require('copy-webpack-plugin');

const basicConfig = {
    module: {
        rules: [{
            test: /\.[tj]sx?$/u,
            exclude: '/node_modules/',
            use: [{
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                },
            }],
        }],
    },
    resolve: {
        symlinks: false,
        extensions: [
            '.ts',
            '.tsx',
            '.js',
        ],
    },
    watchOptions: {
        ignored: ['node_modules'],
    },
};

const viewConfig = {
    ...basicConfig,
    entry: [path.join(__dirname, 'src', 'www', 'index.tsx')],
    externals: [],
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist/www'),
    },
    target: 'electron-main',
    plugins: [
        new copyPlugin({
            patterns: [
                {from: 'src/www/index.html', to: 'index.html'},
            ],
        }),
    ],
};

const electronConfig = {
    ...basicConfig,
    entry: [path.join(__dirname, 'src', 'index.ts')],
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
    },
    target: 'electron-main',
};

const configs = [viewConfig, electronConfig];

if (process.env.BUILD_ENV === 'production') {
    module.exports = configs.map(config => ({
        ...config,
        mode: 'production',
    }));
} else {
    module.exports = configs.map(config => ({
        ...config,
        mode: 'development',
        devtool: 'source-map',
    }));
}
