---
slug: build-docusaurus-blog-on-windows
title: Windows 11 下使用 Docusaurus 搭建并发布 GitHub Pages 博客
authors: [cyan]

tags: [docusaurus, github-pages, windows, blog]
---

这篇文章记录我在 Windows 11 环境下，从零开始搭建 Docusaurus 博客并发布到 GitHub Pages 的完整流程。内容主要包括命令行操作、需要修改的文件，以及 GitHub 网页端需要点击的位置。

<!-- truncate -->

## 一、环境准备

我的本地环境如下：

- Windows 11
- 已安装 Git
- 已安装 Git Bash
- 已安装 Node.js 和 npm

先确认环境是否正常：

```bash
node -v
npm -v
git --version
```

如果这三条命令都能正常输出版本号，就可以继续。

------

## 二、克隆仓库

先进入自己准备放博客项目的目录，然后克隆远程仓库：

```bash
git clone https://github.com/eve0805/cyan.github.io.git
cd cyan.github.io
```

这里的仓库地址是：

```text
https://github.com/eve0805/cyan.github.io
```

克隆完成后，本地就有一个 `cyan.github.io` 目录。

------

## 三、初始化 Docusaurus 项目

因为仓库目录已经存在，不能直接在当前目录执行：

```bash
npx create-docusaurus@latest . classic --typescript
```

否则会报错：

```text
Directory already exists
```

正确做法是在旁边先创建一个临时项目目录：

```bash
cd ..
npx create-docusaurus@latest docusaurus-temp classic --typescript
```

生成完成后，把临时项目里的内容复制到仓库目录中。

如果当前使用的是 Git Bash，可以执行：

```bash
cd cyan.github.io
shopt -s dotglob
cp -rf ../docusaurus-temp/* .
```

复制完成后，仓库目录中就会出现这些核心文件和目录：

```text
blog/
docs/
src/
static/
docusaurus.config.ts
package.json
sidebars.ts
tsconfig.json
```

------

## 四、安装依赖并本地启动

在仓库根目录执行：

```bash
npm install
npm run start
```

如果启动成功，终端会输出类似内容：

```text
Docusaurus website is running at: http://localhost:3000/
```

然后在浏览器打开：

```text
http://localhost:3000/
```

就可以看到本地站点。

------

## 五、把默认结构改成自己的结构

我的目标结构是：

- 首页负责入口
- Blog 负责时间流文章
- Projects 负责作品夹
- Notes 负责知识点

因此需要把默认的 `docs` 改成 `notes`，并新增一个 `projects` 内容区。

先在仓库根目录执行：

```bash
mv docs notes
touch sidebarsProjects.ts
mkdir -p projects
```

执行后，目录结构会变成：

```text
blog/
notes/
projects/
src/
static/
docusaurus.config.ts
sidebars.ts
sidebarsProjects.ts
```

------

## 六、修改站点主配置

需要修改的文件是：

```text
docusaurus.config.ts
```

这个文件主要负责：

- 网站标题
- GitHub Pages 地址
- 导航栏
- Blog / Notes / Projects 路由

我这里最关键的配置是：

```ts
url: 'https://eve0805.github.io',
baseUrl: '/cyan.github.io/',
organizationName: 'eve0805',
projectName: 'cyan.github.io',
deploymentBranch: 'gh-pages',
```

这里必须注意：

我的仓库是：

```text
eve0805/cyan.github.io
```

它不是用户根站点仓库，所以不能把 `baseUrl` 写成 `/`，而要写成：

```ts
baseUrl: '/cyan.github.io/'
```

否则后面 GitHub Pages 的静态资源路径会出错。

导航栏里我保留的入口是：

- Home
- Blog
- Projects
- Notes
- GitHub

------

## 七、配置 Notes 和 Projects 的侧边栏

### 1. Notes 侧边栏

修改文件：

```text
sidebars.ts
```

最简单的写法是只保留一个入口文档：

```ts
import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  notesSidebar: [
    'intro',
  ],
};

export default sidebars;
```

### 2. Projects 侧边栏

新建文件：

```text
sidebarsProjects.ts
```

内容同样可以先保持最简单：

```ts
import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  projectsSidebar: [
    'intro',
  ],
};

export default sidebars;
```

------

## 八、创建 Notes 和 Projects 的入口页

### 1. Notes 入口页

新建文件：

```text
notes/intro.md
```

内容：

```md
---
id: intro
title: Notes
slug: /
---

Notes 首页
```

### 2. Projects 入口页

新建文件：

```text
projects/intro.md
```

内容：

```md
---
id: intro
title: Projects
slug: /
---

Projects 首页
```

这里的关键点是：

```md
slug: /
```

如果不写这一行，页面可能会变成 `/projects/intro`，而不是希望的 `/projects`。

------

## 九、修改首页入口页

首页文件一般放在：

```text
src/pages/index.tsx
```

这个页面主要负责做导航入口，不放太多内容，只需要展示三个主要区域：

- Blog
- Projects
- Notes

我在这里做了一个简单入口页，让首页只负责跳转，不承担文档展示功能。

也就是说：

- 进入 `/` 时看到总入口
- 点击 Blog 进入文章列表
- 点击 Projects 进入作品夹
- 点击 Notes 进入知识点区域

------

## 十、清理默认示例内容

Docusaurus 模板默认会自带一些示例文章和文档。如果不想保留这些默认内容，可以手动删除。

比如删除默认 blog 示例文章：

```bash
rm -f blog/*.md blog/*.mdx
```

如果想先看看有哪些文件，可以先执行：

```bash
ls blog
```

删除之后，`blog/` 目录就是空的，后续再自己添加文章。

------

## 十一、本地构建检查

本地开发能跑起来不代表最终部署一定成功，因此还需要执行一次正式构建：

```bash
npm run build
```

这一步非常重要。

如果这里报错，GitHub Actions 部署也一定会失败。因为 GitHub Pages 的自动部署，本质上也是先执行构建，再上传构建产物。

我在这一阶段遇到的主要问题是：

- 导航栏中有不存在的路由
- 首页按钮指向了还没有生成的页面
- Blog 目录为空，但首页或导航栏仍然链接到 `/blog`
- Projects 页面没有正确生成到 `/projects`

这些问题都会导致 Docusaurus 在 build 阶段因为 broken links 直接退出。

------

## 十二、配置 GitHub Pages 自动发布

本地构建通过后，就可以配置 GitHub Pages 自动发布。

### 1. 新建 workflow 文件

先创建目录：

```bash
mkdir -p .github/workflows
```

然后新建文件：

```text
.github/workflows/deploy.yml
```

这个文件负责在每次 push 到 `main` 分支时：

- 安装依赖
- 执行 `npm run build`
- 上传 `build/` 目录
- 部署到 GitHub Pages

### 2. GitHub 网页端需要点击的位置

进入仓库页面后，点击：

```text
Settings → Pages
```

然后在 `Build and deployment` 里把 `Source` 设为：

```text
GitHub Actions
```

这一步必须做。否则即使 workflow 写好了，Pages 也不会按 Actions 的结果发布。

------

## 十三、推送到 GitHub

配置完成后，将本地改动提交到远程仓库：

```bash
git add .
git commit -m "Configure Docusaurus blog and GitHub Pages"
git push origin main
```

推送后，GitHub 会自动执行 workflow。

------

## 十四、查看部署结果

部署状态查看位置：

```text
GitHub 仓库页面 → Actions
```

如果流程正常，会看到类似：

- Build Docusaurus
- Deploy to GitHub Pages

如果 `Build Docusaurus` 失败，说明是项目本身构建有问题，需要先在本地执行：

```bash
npm run build
```

把构建错误修好后再重新 push。

------

## 十五、最终访问地址

因为我的仓库不是用户根站点仓库，而是项目站点仓库，所以最终访问地址不是：

```text
https://eve0805.github.io/
```

而是：

```text
https://eve0805.github.io/cyan.github.io/
```

------

## 十六、这套结构后续如何使用

我后续准备按下面的方式使用这个站点：

### 1. 首页

只作为入口页使用，不堆太多正文内容。

### 2. Blog

用于写时间流文章，例如：

- 周报
- 每个功能点的实现记录
- 每次改进的说明
- 踩坑与修复过程

### 3. Projects

用于整理长期项目内容，例如：

- 项目总览
- 路线图
- 阶段总结
- 功能索引

### 4. Notes

用于沉淀知识点，例如：

- 代码路径分析
- 调试经验整理

------

## 十七、完整命令流程汇总

最后把整个搭建流程用命令行再汇总一遍：

```bash
git clone https://github.com/eve0805/cyan.github.io.git
cd ..
npx create-docusaurus@latest docusaurus-temp classic --typescript
cd cyan.github.io
shopt -s dotglob
cp -rf ../docusaurus-temp/* .
npm install
npm run start
mv docs notes
touch sidebarsProjects.ts
mkdir -p projects
npm run build
mkdir -p .github/workflows
git add .
git commit -m "Configure Docusaurus blog and GitHub Pages"
git push origin main
```

------

## 十八、小结

整个搭建过程里，真正重要的不是把模板跑起来，而是把目录结构、路由配置和发布流程理顺。只要本地 `npm run start` 能运行、本地 `npm run build` 能通过、GitHub Pages 的 Source 设为 `GitHub Actions`，整个站点就可以稳定发布。

后续只需要继续往 `blog/`、`projects/` 和 `notes/` 里填内容即可。