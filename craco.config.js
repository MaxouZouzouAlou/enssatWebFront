const path = require('path');

module.exports = {
    webpack: {
        alias: {
            '@assetsImg': path.resolve(__dirname, 'src/assets/img'),
            '@assetsPages': path.resolve(__dirname, 'src/assets/pages'),
            '@assetsComponents': path.resolve(__dirname, 'src/assets/components/')
        }
    }
};
