# Reddit / Linux DO · JetBrains / Darcula 外观

油猴脚本：把 **linux.do** 或 **Reddit** 换成 **JetBrains IDE / Darcula** 风格。

只换皮，不碰数据——内容、链接、按钮与交互全部保留。

包含两个脚本：

| 脚本 | 站点 | 说明 |
| --- | --- | --- |
| [`reddit-idea.user.js`](./reddit-idea.user.js) | [reddit.com](https://www.reddit.com/) | Reddit 新版 UI（shreddit），主页伪造 Git Log、回帖渲染为代码编辑区 |
| [`linuxdo-idea.user.js`](./linuxdo-idea.user.js) | [linux.do](https://linux.do/) | 话题列表伪装 Git Log、回帖渲染为编辑器 + 语法着色 |

## 安装（Reddit 版）

1. 安装 [Tampermonkey](https://www.tampermonkey.net/)（或 Violentmonkey）
2. 打开 [`reddit-idea.user.js`](./reddit-idea.user.js)，点 **Raw** 后安装
3. 访问 <https://www.reddit.com/>；脚本更新后请硬刷新一次

Raw 直链（仓库公开后可用）：

```text
https://github.com/czm15053/reddit-idea-ui/raw/main/reddit-idea.user.js
```

## 功能（Reddit 版）

- **IDEA / PyCharm 切换**：点击顶栏品牌标，选择写入 `localStorage`（联动 favicon）
- **网站头**：原生顶栏替换为注入的 IDE 菜单栏（36px、File / Edit / View / Navigate…），含真实搜索框、Home/Popular/All 快捷链接与登录按钮
- **主页**：帖子列表伪装为 **Git Log**（多泳道 SVG 图谱，按 Subreddit 分泳道）
- **帖子 / 评论页**：评论渲染为代码编辑器阅读区——行号 gutter、嵌套缩进与 │ 引导线、`└──` 分支标记
- **侧栏**：原生侧栏保留占位但被遮盖，改为 Project View 风格面板（路径栏、黄文件夹、选中色）
- **工具窗条**：左右两侧 IDE 风格条带（Project / Commit / Maven / Python 等装饰按钮，窄屏自动隐藏）
- **颜色模式**：默认 Darcula 深色，顶栏 Dark/Light 按钮即时切换
- **状态栏**：底部 IDE 状态条；赞助帖以 `// sponsored` 标注
- **SPA**：站内跳转与前进后退后自动重新套用样式
- *仅本地换肤*：不调用 Reddit API / JSON 内部端点，不拦截登录与广告

## 安装（Linux DO 版）

1. 安装 [Tampermonkey](https://www.tampermonkey.net/)（或 Violentmonkey）
2. 打开 [`linuxdo-idea.user.js`](./linuxdo-idea.user.js)，点 **Raw** 后安装
3. 访问 <https://linux.do/>；脚本更新后请硬刷新一次

Raw 直链（仓库公开后可用）：

```text
https://github.com/czm15053/linuxdo-idea-ui/raw/main/linuxdo-idea.user.js
```

## 功能

- **IDEA / PyCharm 切换**：点击顶栏品牌标，选择写入 `localStorage`
- **主页**：话题列表伪装为 **Git Log**（多泳道 SVG 图谱）
- **话题页**：帖子渲染为代码编辑器阅读区（随产品切换 Java / Python 风）
- **回帖**：混合语句模板；过短的回帖会补少量样板行
- **代码行内图片**：默认收起，悬停预览，点击固定
- **侧栏**：Project View 风格（路径栏、黄文件夹、箭头与选中色）
- **工具窗条**：左右两侧 IDE 风格条带（Project / Commit / Maven / Python 等装饰按钮，窄屏自动隐藏）
- **加载页面 / favicon / 菜单**：偏 IDE 壳层；通知区接近 Event Log
- **颜色模式**：跟随 linux.do 浅色 / 深色 / 自动；深色对齐 Darcula
- **SPA**：站内跳转与前进后退后自动重新套用样式

## 截图（Linux DO 版）

| | |
| --- | --- |
| 加载页面 | ![Splash](https://github.com/czm15053/linuxdo-idea-ui/raw/main/snapshot/splash.png) |
| 主页 Git Log | ![Home](https://github.com/czm15053/linuxdo-idea-ui/raw/main/snapshot/home-git-log.png) |
| 话题 · IDEA | ![Topic IDEA](https://github.com/czm15053/linuxdo-idea-ui/raw/main/snapshot/topic-idea.png) |
| 话题 · PyCharm | ![Topic PyCharm](https://github.com/czm15053/linuxdo-idea-ui/raw/main/snapshot/topic-pycharm.png) |
| Hover 链接显示图片 | ![Image hover](https://github.com/czm15053/linuxdo-idea-ui/raw/main/snapshot/image-hover.png) |

## License

MIT © czm15053

JetBrains、IntelliJ IDEA、PyCharm 均为 JetBrains s.r.o. 商标。本项目为非官方、非关联作品。

## 友链

- [reddit.com](https://www.reddit.com/)
- [linux.do](https://linux.do/)
