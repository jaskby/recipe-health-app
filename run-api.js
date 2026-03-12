const app = require('./api/index.js');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API 服务运行在 http://localhost:${PORT}`);
  console.log('健康检查端点: http://localhost:${PORT}/api/health');
  console.log('API 根路径: http://localhost:${PORT}/');
});