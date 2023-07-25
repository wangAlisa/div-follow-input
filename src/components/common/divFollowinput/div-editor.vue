<template>
<div class="div-editer">
  <div class="edit-box" :placeholder="placeholder" :class="{'show-placeholder':showPlaceholder}">
    <div id="message_text" @click="clickFn"  :style="{'min-height':minh,'max-height':maxh }" class="edit-panel" contenteditable="true" @keydown="handleDOMRemoved" @paste="onPaste" ref="editor"></div>
    <span class="input-num"><span :style="{'color': this.INPNUM - this.contentValueLength<0? 'red': ''}">{{ inputNum }}</span>，按下Enter键换行</span>
    <div class="publish-tools">
      <div class="icon-btn">
        <el-button v-popover:popover-click>🙂选择Emoji</el-button>
        <el-button class="tools-btn" size="medium" v-popover:popover-link @click="popoverChange('textForm')">【文字链接】</el-button>
        <el-button class="tools-btn" size="medium" v-popover:popover-minipro @click="popoverChange('minproForm')">【小程序链接】</el-button>
        <el-button class="tools-btn" size="medium" v-popover:popover-variable>【插入变量】</el-button>
      </div>
    </div>
  </div>
   <div class="bg" @click="closePopFn" v-if="showBg"></div>
  <el-popover  ref="popover-click" placement="bottom-start" width="390" trigger="click" @show="mountedEmoji = true">
    <Emoji @emoji = "selectEmoji"></Emoji>
  </el-popover>
  <el-popover ref="popover-link" placement="top" width="300" trigger="manual" @show="showpopover('textForm')" @hide="hiddenpopover('textForm')">
   <el-form label-width="60px" ref="textForm" :model="textForm" >
      <el-form-item label="文字：" >
        <el-input  v-model="textForm.text"></el-input>
      </el-form-item>
      <el-form-item label="链接：">
         <el-input  v-model="textForm.url"></el-input>
      </el-form-item>
      <el-button size="medium" class="pop-btn" type="primary" @click="save('textForm')">确定</el-button>
    </el-form>
  </el-popover>
  <el-popover ref="popover-minipro" placement="top" width="300" trigger="manual" @show="showpopover('minproForm')" @hide="hiddenpopover('minproForm')">
   <el-form label-width="70px" ref="minproForm" :model="minproForm" >
     <p class="minpro-tip" v-if="!microNoTips">提示：请确保小程序与公众号已关联</p>
      <el-form-item label="文字：" >
        <el-input  v-model="minproForm.title"></el-input>
      </el-form-item>
      <el-form-item label="appid：" >
        <el-input  v-model="minproForm.appid"></el-input>
      </el-form-item>
      <el-form-item label="页面：">
         <el-input  v-model="minproForm.pagepath"></el-input>
      </el-form-item>
      <el-button class="pop-btn" size="medium" type="primary" @click="save('minproForm')">确定</el-button>
    </el-form>
  </el-popover>
  <el-popover ref="popover-variable" placement="top" width="250" trigger="click">
     <p class="div-editer-variable" @click="writeVariable($event)"><span>【昵称】</span><span>【性别】</span><span>【省份】</span><span>【城市】</span></p>
  </el-popover>
  <div class="footer">
    <el-button size="medium" @click="sendMessage(false)">取消</el-button>
    <el-button size="medium" type="primary" @click="sendMessage(true)" :disabled="showSubmit">确定</el-button>
  </div>
  <div style="margin-top:20px;">
    <div v-html="rebackData(content)"></div>
  </div>
</div>
</template>
<script>
import { getDomValue, emojiMap, getCursortPosition, getDomValuelength } from './utils';
import Emoji from './emoji';
const emoji = require('emoji');
export default {
  name: 'div-editor',
  props: {
    // 输入框的最小高度

    minHeight: {
      default: 100
    },
    // 输入框的最大高度
    maxHeight: {
      default: 200
    },
    editerContent: {
      type: Object,
      default: () => {
        return {};
      }
    },
    showBtnInfo: {
      type: Array,
      default: () => {
        return [];
      }
    },
    INPNUM: {
      type: Number,
      default: () => {
        return 300;
      }
    },
    placeholder: {
      type: String,
      default: () => {
        return '请输入内容';
      }
    },
    microNoTips: {
      type: Boolean,
      default: () => {
        return false;
      }
    }
  },
  data() {
    return {
      content: '',
      showBg: false,
      mountedEmoji: false,
      sel: '',
      range: '',
      taget: '', // 光标所在的标签
      selectContents: '', // 当前选中的文本
      selectUrl: '', // 当前选中的链接
      selectAppid: '', // 选中的appid
      selectPagepath: '', // 选中的小程序路径
      selectTitle: '', // 选中的小程序标题
      emojiMap: emoji.EMOJI_MAP,
      contentValue: '',
      contentValueLength: 0,
      textForm: {
        text: '',
        url: ''
      },
      minproForm: {
        title: '',
        appid: '',
        pagepath: ''
      }
    };
  },
  components: {
    Emoji
  },
  computed: {
    minh() {
      return parseFloat(this.minHeight) + 'px';
    },
    maxh() {
      return parseFloat(this.maxHeight) + 'px';
    },
    showPlaceholder() {
      // 判断是否有内容显示 placeholder
      return this.contentValueLength === 0;
    },
    // 确认按钮是否可点击
    showSubmit() {
      if (this.contentValueLength === 0 || this.contentValueLength > this.INPNUM) {
        return true;
      }
      return false;
    },
    // 计算目前还可输入多少字
    inputNum() {
      return this.INPNUM - this.contentValueLength >= 0 ? `还可以输入${this.INPNUM - this.contentValueLength}字` : `已产出${this.contentValueLength - this.INPNUM}字`;
    }
  },
  mounted() {
    // 初始化的时候让输入框自动聚焦
    this.$nextTick(() => {
      this.$refs.editor.focus();
      if (this.editerContent && this.editerContent.msgtype === 'text') {
        var reg = /<a[^>]+?href=["']?([^"']+)["']?[^>]*>([^<]+)<\/a>/gi;
        const constent = this.editerContent.text.content.replace(reg, function ($1) {
          let info = $1.split(' ');
          const str = info[0] + " style='color:#5392ff'";
          info[0] = str;
          info = info.join(' ');
          return info;
        });
        document.execCommand('insertHTML', false, this.regImoji(constent));
      }
    });
    this.initEvent();
  },
  beforeDestroy() {
    // 删除事件
    this.removeEvent();
  },
  watch: {
    contentValue(val) {
      this.$refs.editor.value = val;
    }
  },
  methods: {
    rebackData(data) {
      var reg = /<a[^>]+?href=["']?([^"']+)["']?[^>]*>([^<]+)<\/a>/gi;
      const constent = data.replace(reg, function ($1, $2, $3) {
        return `<a href='${$2}' style="color:#5392ff">${$3}</a>`;
      });
      // eslint-disable-next-line no-useless-escape
      return constent.replace(/\n/g, '<br/>').replace(/\[([^\[\]]+)\]/g, function ($1) {
        return `<img src="${emojiMap[$1]}" alt="${$1}" style="vertical-align:-6px; display: inline-block">`;
      });
    },
    save(type) {
      if (type === 'textForm') {
        this.$refs['popover-link'].showPopper = false;
      } else if (type === 'minproForm') {
        this.$refs['popover-minipro'].showPopper = false;
      }
      this.showBg = false;
    },
    // 点击a链家可出现弹窗并修改内容
    clickFn(e) {
      const taget = e.target;
      this.taget = taget;
      if (taget.nodeName === 'A') {
        switch (taget.getAttribute('data-miniprogram-appid')) {
          case null:
            this.selectContents = taget.innerHTML; // 根据类型判断赋值给selectContents
            this.selectUrl = taget.getAttribute('href');
            this.$refs['popover-link'].showPopper = true;
            break;
          default:
            this.selectTitle = taget.innerHTML; // 根据类型判断赋值给selectTitle
            this.selectAppid = taget.getAttribute('data-miniprogram-appid');
            this.selectPagepath = taget.getAttribute('data-miniprogram-path');
            this.$refs['popover-minipro'].showPopper = true;
            break;
        }
        this.showBg = true;
      }
    },
    closePopFn() {
      this.$refs['popover-link'].showPopper = false;
      this.$refs['popover-minipro'].showPopper = false;
      this.showBg = false;
    },
    // 显示或者隐藏pop
    popoverChange(type) {
      if (type === 'textForm') {
        this.$refs['popover-link'].showPopper = !this.$refs['popover-link'].showPopper;
      } else if (type === 'minproForm') {
        this.$refs['popover-minipro'].showPopper = !this.$refs['popover-minipro'].showPopper;
      }
      this.showBg = !!(this.$refs['popover-link'].showPopper || this.$refs['popover-minipro'].showPopper);
    },
    // 输入框失去焦点的时候
    blurDiveditor() {
      this.sel = window.getSelection();
      this.range = this.sel.getRangeAt(0);
      // 判断选中的区域的是不是a链接，不是a链接的话执行下面的事件
      if (!this.taget || this.taget.nodeName !== 'A') {
        this.taget = this.sel.focusNode.parentElement;
        const { sel, taget } = this;
        this.selectContents = sel.toString(); // 当选中未添加链接的内容时，选中内容复制给链接的
        this.selectTitle = sel.toString(); // 当选中未添加链接的内容时，选中的内容复制给小程序标题
        if (taget.nodeName === 'A') {
          this.selectContents = ''; // 当时a链接的时候，先置空根据类型判断赋值给selectContents还是selectTitle
          this.selectTitle = '';
          const status = taget.innerHTML && this.sel.toString() !== taget.innerHTML;
          switch (taget.getAttribute('data-miniprogram-appid')) {
            case null:
              this.selectContents = sel.toString(); // 根据类型判断赋值给selectContents
              this.selectUrl = status ? '' : taget.getAttribute('href');
              break;
            default:
              this.selectTitle = sel.toString(); // 根据类型判断赋值给selectTitle
              this.selectAppid = status ? '' : taget.getAttribute('data-miniprogram-appid');
              this.selectPagepath = status ? '' : taget.getAttribute('data-miniprogram-path');
              break;
          }
        }
      }
    },
    initEvent() {
      this.$refs.editor.addEventListener('blur', this.blurDiveditor);
      this.$refs.editor.addEventListener('focus', this.changeContentValue);
      this.$refs.editor.addEventListener('input', this.changeContentValue);
      this.$refs.editor.addEventListener('DOMNodeInserted', this.changeContentValue);
    },
    removeEvent() {
      this.$refs.editor.removeEventListener('blur', this.blurDiveditor);
      this.$refs.editor.removeEventListener('focus', this.changeContentValue);
      this.$refs.editor.removeEventListener('input', this.changeContentValue);
      this.$refs.editor.removeEventListener('DOMNodeInserted', this.changeContentValue);
    },
    // 编辑回显处理数据
    regImoji(data) {
      // eslint-disable-next-line no-useless-escape
      return data.replace(/\n/g, '<br/>').replace(/\[([^\[\]]+)\]/g, function ($1) {
        return `<img src="${emojiMap[$1]}" alt="${$1}" style="vertical-align:-6px; display: inline-block">`;
      });
    },
    // 粘贴数据处理
    onPaste() {
      // this.changeContentValue();
    },

    changeContentValue() {
      // 更新值
      this.contentValue = getDomValue(this.$refs.editor).replace(/^\n/, '').replace(/\n$/, '');
      if (this.contentValue) {
        this.contentValueLength = getDomValuelength(this.contentValue);
      } else {
        this.contentValueLength = 0;
      }
    },

    // 往光标位置插入HTML片段
    insertHtmlAtCaret(html) {
      if (window.getSelection) {
        // IE9 and non-IE
        if (this.sel.getRangeAt && this.sel.rangeCount) {
          var el = document.createElement('div');
          el.innerHTML = html;
          var frag = document.createDocumentFragment(); var node; var lastNode;
          while ((node = el.firstChild)) {
            lastNode = frag.appendChild(node);
          }
          this.range.insertNode(frag);
          if (lastNode) {
            this.range = this.range.cloneRange();
            this.range.setStartAfter(lastNode);
            this.range.collapse(true);
            this.sel.removeAllRanges();
            this.sel.addRange(this.range);
          }
        }
      } else if (document.selection && document.selection.type !== 'Control') {
        // IE < 9
        document.selection.createRange().pasteHTML(html);
      }
    },
    // 显示弹窗
    showpopover(type) {
      const { selectContents, selectUrl, selectAppid, selectPagepath, selectTitle } = this;
      if (type === 'textForm') {
        this.$set(this.textForm, 'text', selectContents);
        this.$set(this.textForm, 'url', selectUrl);
      } else if (type === 'minproForm') {
        this.$set(this.minproForm, 'title', selectTitle);
        this.$set(this.minproForm, 'appid', selectAppid);
        this.$set(this.minproForm, 'pagepath', selectPagepath);
      }
    },
    // 添加弹窗内容
    hiddenpopover(type) {
      // 添加链接
      if (type === 'textForm') {
        const { text, url } = this.textForm;
        if (text && url) {
          this.range && this.range.deleteContents(); // 删除输入框原有的文本内容
          const { selectContents, selectUrl, taget } = this;
          if (selectContents && selectUrl && taget) {
            Array.from(this.$refs.editor.childNodes).forEach((item) => {
              if (item === taget) {
                this.$refs.editor.removeChild(taget); // 删除输入框原有的文本链接内容
              } else if (taget.parentNode === item) {
                item.removeChild(taget); // 当村子a链接内有插入了一次a标签的情况处理
              }
            });
          }
          this.insertHtmlAtCaret(`<a href='${url}' style="color:#5392ff">${text}</a>`);
        }
        this.textForm = {
          url: '',
          text: ''
        };
      } else if (type === 'minproForm') {
        // 添加小程序
        const { appid, pagepath, title } = this.minproForm;
        if (appid && pagepath && title) {
          this.range.deleteContents(); // 删除输入框原有的文本内容
          const { selectTitle, selectAppid, selectPagepath, taget } = this;
          if (selectTitle && selectAppid && selectPagepath && taget) {
            Array.from(this.$refs.editor.childNodes).forEach((item) => {
              if (item === taget) {
                this.$refs.editor.removeChild(taget); // 删除输入框原有的文本链接内容
              } else if (taget.parentNode === item) {
                item.removeChild(taget);
              }
            });
          }
          this.insertHtmlAtCaret(`<a href='https://www.baidu.com/' style="color:#5392ff" data-miniprogram-appid='${appid}' data-miniprogram-path='${pagepath}'>${title}</a>`);
        }
        this.minproForm = {
          appid: '',
          pagepath: '',
          title: ''
        };
      }
      this.selectContents = ''; // 当前选中的文本
      this.selectUrl = ''; // 当前选中的链接
      this.selectTitle = ''; // 小程序标题
      this.selectAppid = ''; // 选中的appid
      this.selectPagepath = ''; // 选中的小程序路径
      this.taget = ''; // 清空当前选中的元素
    },
    // 模板消息插入变量
    writeVariable(e) {
      if (e.target.nodeName === 'SPAN') {
        const clickInner = this.switchVariable(e.target.innerHTML);
        this.insertHtmlAtCaret(clickInner);
      }
    },

    // 变量汉字转成英文
    switchVariable(data) {
      const variable = data.replace(/【/g, '').replace(/】/g, '');
      let newVar = '';
      switch (variable) {
        case '昵称':
          newVar = '{name}';
          break;
        case '性别':
          newVar = '{sex}';
          break;
        case '省份':
          newVar = '{province}';
          break;
        case '城市':
          newVar = '{city}';
          break;
        default:
          break;
      }
      return newVar;
    },

    // 插入表情
    selectEmoji(emoji) {
      this.insertHtmlAtCaret(emoji);
    },

    // 处理节点的删除
    handleDOMRemoved(e) {
      if (e.keyCode === 13) {
      //  关闭所有弹窗
        this.$refs['popover-click'].showPopper = false;
        this.$refs['popover-variable'].showPopper = false;
        this.$refs['popover-link'].showPopper = false;
        this.$refs['popover-minipro'].showPopper = false;
        // 当鼠标在最开头的时候禁止换行
        const text = this.$refs.editor;
        const position = getCursortPosition(text);
        if (!position) {
          // e.preventDefault();
        }
      }
    },

    // 发送消息
    sendMessage() {
      let textContent = this.contentValue;
      // 处理当选中多个a标签时候，重新添加一个链接，删除剩余没有innerHTMLa标签
      // eslint-disable-next-line no-irregular-whitespace
      const reg = /<a[^>]+?href=["']?([^"']+)["']?[^>]*><\/a>/gi;
      // eslint-disable-next-line no-irregular-whitespace
      textContent = textContent.replace(reg, function () {
        // eslint-disable-next-line no-irregular-whitespace
        return '';
      });
      this.content = textContent;
    }
  }
};
</script>
<style scoped lang="less">
  /deep/.el-input__inner{
    height:24px;
    line-height:24px;
    font-size: 12px;
  }
  /deep/.el-form-item{
    margin-bottom:0;
  }
  .pop-btn {
    margin-left:190px;
  }
  .minpro-tip {
      padding:0;
      margin:0;
      font-size:10px;
      color:red;
      line-height:18px;
      margin-left:5px;
    }
  .edit-box {
    position: relative;
    border: 1px solid #ccc;
    padding: 4px 6px;
    height: auto;
    font-size: 14px;
    line-height: 20px;
    box-sizing: border-box;
  }
  .show-placeholder::before {
    content: attr(placeholder);
    color: #555;
    pointer-events: none;
    position: absolute;
  }
  .edit-panel {
    /* 去掉外发光 */
    outline: none;
    overflow: auto;
    // height:150px;
  }
  .input-num {
    position: absolute;
    bottom: 4px;
    right: 6px;
    font-size:12px;
    color: #555;
    pointer-events: none;
  }
  .publish-tools {
    display: flex;
    flex-direction:row;
    justify-content: space-between;
    margin-top: 4px;
    vertical-align: baseline;
    .icon-btn {
      display: flex;
       /deep/.el-button{
        border-width: 0;
        margin-left:0;
      }
      /deep/.el-button--medium{
        padding:0 5px;
      }
    }
    .tools-btn {
      color: #38b7e9;;
      text-decoration:none;
    }
    .tools-btn:hover{
      color:#38b7e9;;
    }
    .emoji{
      margin-right: 8px;
    }
  }
  .div-editer{
    .bg{
      position: absolute;
      top: 0;
      left:0;
      right:0;
      bottom:0;
      background: rgba(0,0,0,0);
    }
    .footer{
      // padding-top:260px;
      text-align: center;
      position:absolute;
      bottom:40px;
      left:250px;
    }
    &-variable {
      color:#F9B001;
      i {
        color:#AFB0B3;
      }
      span{
        cursor: pointer;
      }
    }
  }
</style>
