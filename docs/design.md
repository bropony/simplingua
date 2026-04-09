#Learn Simplingua 学习简语
## About Simplingua 关于简语
简语是一门人造语言，由路易·罗莎创建。学习群体主要是一群中国人造语言爱好者

## 关于本解决方案（Solution）
本解决方案是旨在建造一个简语学习网站
### 主要内容：
- 语法书：为语法书生成合适的引用手册，可搜索，可浏览
- 词汇表：为词汇表生成合适的引用手册，可搜索，可浏览
- 讨论：用户可发起讨论，所有用户可以对任意讨论发起评论，也可以对评论发起评论

### 辅助功能
- 用户系统：注册、登录、设置
- 系统管理：超级用户可以更新语法(增删改，或整体替换）、词汇（增删改，或整体替换）、及讨论（增删改）。超级用户的账号密码由配置生成，支持多个，不可动态创建

## 已经有资源
**docs/lexilibro_de_simplingua.txt**: 简语词汇表
**docs/lingua_regla_de_simplingua.txt**: 简语语法书

## 基本项目（Projects）
### backend
服务端，next.js + mongodb + jwt
### frontend
web客户端，tailwind CSS等
引用资源对中国大陆用户友好，无访问限制
### tools
需要开发三个工具
- lexi: 将词汇表转化为可导入数据库的格式（json），用于超级用户上传到后台
- regla：将语法书转化为可导入数据库的格式（json），用于超级用户上传到后台
- resource: 用于生成本项目所需要的图片和音效资源

## Deployment
Tow ways of deploymemts:
- no docker, standalone services in VPS
- docker
Generate deploy documents for both ways.

## IMPORTANT
**这是个非常简略的需求文档，AI务必根据理解，和目前市面上的实现惯例，进行合理规划，生成必要的开发文档，再进行开发。**