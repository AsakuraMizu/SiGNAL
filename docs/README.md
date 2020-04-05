---
home: true
heroImage: img/signal.png
heroText: SiGNAL Bot
tagline: 基于 NoneBot 的开源专业 QQ 机器人
actionText: 开始使用
actionLink: /usage/
features:
- title: 开源
  details: 源代码托管在GitHub上，您可以自由复刻，或者为 SiGNAL Bot 添加功能。
- title: 高性能
  details: 采用异步 I/O，利用 WebSocket 进行通信，以获得极高的性能。
- title: 专业
  details: 针对开发人员设计，提供了许多专业功能。
footer: MIT Licensed | Copyright © 2020-present water_lift
---

<PanelView title="SiGNAL Bot开发群(15)">
  <ChatMessage nickname="water_lift" avatar="img/water_lift.jpg">?todo ls</ChatMessage>
  <ChatMessage nickname="SiGNAL酱" avatar="img/signal.png">@water_lift <br/>TODOS:<br/>重构SiGNAL Bot(WIP)<br/>寒假作业(maybe)</ChatMessage>
</PanelView>

## 自行部署

<Terminal :content="[
  { content: [{ text: '# 克隆源代码', class: 'hint' }] },
  { content: [{ text: 'git', class: 'input' }, ' clone https://github.com/water-lift/SiGNAL.git'] },
  { content: [] },
  { content: [{ text: '# 进入文件夹', class: 'hint' }] },
  { content: [{ text: 'cd', class: 'input' }, ' SiGNAL'] },
  { content: [] },
  { content: [{ text: '# 初始化配置文件', class: 'hint' }] },
  { content: [{ text: 'cp', class: 'input' }, ' .env.sample .env'] },
  { content: [{ text: '# 请根据需要自行修改 .env 文件', class: 'hint' }] },
  { content: [{ text: 'cp', class: 'input' }, ' config.sample.json config.json'] },
  { content: [{ text: '# 请根据需要自行修改 config.json 文件', class: 'hint' }] },
  { content: [] },
  { content: [{ text: '# 启动', class: 'hint' }] },
  { content: [{ text: 'docker-compose', class: 'input' }, ' up -d'] }
]" static title="命令行" />