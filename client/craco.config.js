module.exports = {
  devServer: (devServerConfig) => {
    devServerConfig.allowedHosts = 'all'; // 모든 호스트 허용
    return devServerConfig;
  },
};