# dsh-funpack

一个把夸夸、运势、战报、番茄钟、摸鱼提醒集成在一起的轻量
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 插件。

仓库：[https://github.com/lvyuchuiyi/dsh-funpack](https://github.com/lvyuchuiyi/dsh-funpack)

![演示](assets/demo.gif)

特点：

- 单文件 `index.js`，零依赖、零构建
- Web UI 输入框上方提供一键命令按钮，点击直接执行
- 网页右下角有一只 DeepSeek 娘风格的鲸鱼娘桌宠，空闲时它会说“蓝色大肥鱼正在偷吃你的 token”，DeepSeek 思考时换成“鱼正在努力憋大招”
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

## 许可

MIT

## 素材致谢

桌宠 GIF 素材来自 [@linxin666/dsh-pet](https://www.npmjs.com/package/@linxin666/dsh-pet)（BSD-3-Clause，Copyright (c) 2026 zhu1090093659）。
