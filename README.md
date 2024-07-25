# RayBook

RayBook 是一个基于 Electron 和 React 的开源电子书管理应用。它旨在为用户提供一个简洁、高效的电子书阅读和管理平台。

> **⚠️ 警告：早期开发阶段**
>
> RayBook 目前正处于早期开发阶段。许多功能尚未完成或可能存在问题。我们不建议在生产环境中使用，也不推荐用于管理重要的电子书收藏。如果您对参与开发感兴趣，我们非常欢迎您的贡献！

## 特性

- 📚 支持多种电子书格式 (EPUB, PDF, MOBI 等)
- 🔍 强大的元数据提取和管理
- 📖 内置电子书阅读器
- 🌐 集成微信读书网页版
- 🖼️ 自动提取和管理书籍封面
- 📁 批量导入和管理电子书
- 🔒 文件去重和 SHA256 校验
- 🔄 自动同步阅读进度
- ⚙️ 可自定义的存储和数据库设置

## 更新记录

2024-07-25

- 持久化记录微信登陆状态
- 微信读书网页版调试功能

## 技术栈

- Electron
- React
- TypeScript
- MongoDB
- MinIO (对象存储)
- Ant Design (UI 组件库)

## 安装

1. 克隆仓库:

```bash
git clone https://github.com/maxiee/RayBook.git
cd raybook
```

2. 安装依赖:

```bash
npm install
```

3. 运行应用:

```bash
npm start
```

## 使用方法

1. 启动应用后,首次运行需要在设置页面配置 MinIO 和 MongoDB 连接信息。
2. 在主页面,您可以通过点击 "添加图书" 或 "批量添加书籍" 来导入电子书。
3. 使用内置阅读器打开 EPUB 格式的电子书,或使用集成的微信读书功能。
4. 在设置页面,您可以管理存储路径、执行 SHA256 补齐等维护操作。

## 开发

要在开发模式下运行 RayBook:

```bash
npm run dev
```

## 构建

要构建生产版本的 RayBook:

```bash
npm run build
```

## 贡献

我们欢迎所有形式的贡献,包括但不限于:

- 提交 bug 报告
- 改进文档
- 提交功能请求
- 提交代码修复或新功能

请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解更多详情。

## 许可证

RayBook 使用 [MIT 许可证](LICENSE)。

## 联系我们

如果您有任何问题或建议,请开启一个 issue 或通过以下方式联系我们:

- Weibo: [@Maeiee](https://weibo.com/u/1240212845)

---

感谢您对 RayBook 的关注!我们期待您的参与和反馈。
