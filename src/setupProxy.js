const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'http://175.212.190.95:8010',
            changeOrigin: true,
            // pathRewrite 제거

        })
    );
};
