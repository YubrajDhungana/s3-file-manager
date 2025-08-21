const { defineConfig } = require("@vue/cli-service"); 
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0',       // Listen on all network interfaces
    port: 8080,            // Must match container port in Docker
    allowedHosts: 'all',   // Accept requests from any host (needed behind Apache reverse proxy)
    proxy: {
      "/api": {
        target: process.env.VUE_APP_BASE_URL || "https://bucketmanager-api.cloudtechservice.com:3060/api",
        changeOrigin: true,
        pathRewrite: {
          "^/api": "",
        },
      },
    },
  },
});
