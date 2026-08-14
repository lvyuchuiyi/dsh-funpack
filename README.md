# dsh-funpack

一个把夸夸、运势、战报、番茄钟、摸鱼提醒集成在一起的轻量
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 插件。

仓库：[https://github.com/lvyuchuiyi/dsh-funpack](https://github.com/lvyuchuiyi/dsh-funpack)

![演示](assets/demo.gif)

特点：

- 单文件 `index.js`，零依赖、零构建
- Web UI 输入框上方提供一键命令按钮，点击直接执行
- 网页右下角有一只 DeepSeek 娘风格的鲸鱼娘桌宠，支持完全自定义形象、台词和互动键
- 安装不需要任何构建授权
- 所有统计按会话记录，`/report` 生成一张摸鱼战报

## 安装

从 GitHub 安装：

```sh
dsh plugin --profile web add github:lvyuchuiyi/dsh-funpack
```

本地目录安装：

```sh
dsh plugin --profile web add ./dsh-funpack
```

不安装、直接调试单个文件时，可以用 `--patch` 挂载一个临时 overlay：

```yaml
- insert:
    - id: funpack-local
      name: 'file:///绝对路径/dsh-funpack/index.js'
```

## 命令

| 命令 | 说明 |
| --- | --- |
| `/praise` | 随机夸你一句 |
| `/fortune` | 抽一张开发者今日运势 |
| `/report` | 生成今天的摸鱼战报 |
| `/pomodoro 25` | 开始一个 25 分钟番茄钟 |
| `/pomodoro-status` | 查看剩余时间 |
| `/pomodoro-stop` | 停止番茄钟 |
| `/break` | 随机一条休息建议 |
| `/break-go` | 打开自定义摸鱼目标：网址或本地程序路径 |
| `/pet` | 摸摸桌宠的头 |
| `/feed` | 给桌宠喂食 |
| `/persona` | 查看或切换 AI 说话人设 |

## 人设

`/persona` 可以切换 AI 的说话风格：

| 人设 | 说明 |
| --- | --- |
| `nee` | 大姐姐 |
| `imouto` | 小妹妹 |
| `abstract` | 抽象搞怪 |
| `liangzi` | 良子 |
| `fengge` | 峰哥 |
| `default` | 恢复默认 |

## 桌宠自定义

点击桌宠旁的 `⚙` 打开设置面板：

- 形象：上传 GIF/PNG/WebP，或使用默认鲸鱼娘；支持动态和静态图片
- 宠物包：上传 `pet.json` + `spritesheet.webp/png`，直接加载 HatchPet/Codex 宠物包生态的现成动态宠物
- 内置预设：一键加载社区 Codex 宠物“塔菲 / Taffy”，无需手动上传
- 空闲台词：每行一条，用户空闲时由桌宠随机轮播
- 思考台词：每行一条，DeepSeek 思考时切换
- 互动键：每行一个 `名称,命令`，点击直接执行
- 显示开关：快捷按钮行里的 `桌宠开 / 桌宠关` 可以随时隐藏或唤回桌宠

位置和大小通过拖拽/`-`/`+` 调整，所有设置都会保存在浏览器本地。

## 内置塔菲预设

桌宠设置面板里点 `预设：塔菲 / Taffy`，就会加载社区 Codex 宠物
[Taffy / 塔菲](https://codex-pet.org/pets/taffy/) 的完整图集动画。资源随插件打包，
离线也能用；切换时会顺带换成塔菲风格的空闲/思考台词，之后仍可继续自定义。

## 桌宠养成

桌宠现在有真实好感度了：

- 摸头、喂食、抱抱和完成任务都会增加好感
- 好感达到 Lv.2 会解锁“抱抱”互动，更高等级会解锁专属台词
- 任务完成时桌宠会弹出庆祝气泡并奖励好感
- 设置面板可以查看摸头/喂食/抱抱/任务统计，也可以一键重置好感

好感数据保存在浏览器本地，刷新后继续累积。

## 美化面板

快捷按钮行末尾的 `🎨 美化` 会打开一个类似 Dev-C++ 美化器的实时预览面板：

- 主题：深空 / 樱花 / 薄荷 / 终端 / 纸白
- 背景图片：上传 GIF / PNG / WebP，支持拉伸、填充、居中、平铺
- 背景透明度与暗色蒙层：让图片融入界面而不是盖住文字
- 动态特效：星空 / 雨滴 / 樱花 / 极光
- 弹幕：夸我 / 运势以弹幕展示，可换样式、速度、大小、透明度，支持一键试看
- 按钮缩放与对齐：快捷按钮可以放大缩小，也可靠左 / 居中 / 靠右
- 快捷按钮模块：每个按钮可单独开关，用 `↑` / `↓` 调整顺序
- 摸鱼按钮：自定义跳转网址或启动本地程序，网址直接在浏览器打开，留空则显示普通摸鱼提醒
- 配置分享：一键导出美化与桌宠配置 JSON，别人导入后即可复用

所有美化设置会保存在浏览器本地，刷新后继续生效。

## 许可

MIT

## 素材致谢

桌宠 GIF 素材来自 [@linxin666/dsh-pet](https://www.npmjs.com/package/@linxin666/dsh-pet)（BSD-3-Clause，Copyright (c) 2026 zhu1090093659）。

塔菲 / Taffy 宠物包由 [shengwen](https://codex-pet.org/creators/shengwen/) 创作，来自
[codex-pet.org](https://codex-pet.org/pets/taffy/)，仅作个人/爱好者用途随插件分发。

宠物包播放格式参照 HatchPet 的 [Codex V2 Pet Contract](https://github.com/srwang0506/HatchPet-CapybaraLulu/blob/main/hatch-pet/references/codex-pet-contract.md)（8 列 × 9/11 行图集）。
