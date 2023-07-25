# divfollowiput

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


## div可编辑属性contenteditable实现富文本编辑器
## 同步文档可移步简书 https://www.jianshu.com/p/689621487200?v=1690271439140

## 功能实现
### 使用div标签的可编辑属性contenteditable实现可插入链接、表情包、其他变量的富文本编辑器


## 说明
### 1、技术栈: vue@^2.7.14, element-ui@^2.13.1, emoji@^0.3.2,  js, html, css
### 2、div可编辑属性,change事件失效,可通过监听input事件来时时得到输入内容的变化
### 3、开发此功能是为了实现用微信公众号向用户推送客服消息时,创建文本消息内容开发的,微信开放平台对于文本消息("msgtype":"text",)内容的格式有限制:文本中只支持a标签
### 去微信开放平台 https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Overview.html


# div-follow-input
