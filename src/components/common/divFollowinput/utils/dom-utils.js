// 获取目标节点的纯文本内容
// 这里只涉及到了之后可能会用到的一些节点
function getDomValue(elem) {
  console.log('获取输入的内容',elem)
  var res = '';
  let arr = Array.from(elem.childNodes);
  if (arr[arr.length - 1] && arr[arr.length - 1].nodeName === 'BR' && arr.length > 1) {
    arr = arr.splice(0, arr.length - 1);
  }
  arr.forEach((child) => {
    if (child.nodeName === '#text') {
      res += child.nodeValue;
    } else if (child.nodeName === 'BR') {
      res += '\n';
    } else if (child.nodeName === 'P') {
      res += '\n' + getDomValue(child);
    } else if (child.nodeName === 'SPAN') {
      res += getDomValue(child);
    } else if (child.nodeName === 'BUTTON') {
      res += getDomValue(child);
    } else if (child.nodeName === 'IMG') {
      res += child.alt;
    } else if (child.nodeName === 'DIV') {
      const s = Array.from(child.childNodes);
      // eslint-disable-next-line no-irregular-whitespace
      if (s.length === 1 && s[0].nodeName === 'BR' || child.previousSibling && child.previousSibling.nodeName === 'BR') {
        // 处理复制粘贴钉钉内容多换行问题
        res += getDomValue(child);
      } else {
        res += '\n' + getDomValue(child);
      }
    } else if (child.nodeName === 'A') {
      if (child.getAttribute('data-miniprogram-appid') !== null) {
        const appid = child.getAttribute('data-miniprogram-appid');
        const path = child.getAttribute('data-miniprogram-path');
        const innerHTML = child.innerHTML.replace(/<br>/g, '').replace(/<span (.*?)>/gi, '').replace(/<\/span>/gi, '');
        res += `<a href='https://www.baidu.com/' data-miniprogram-appid='${appid}' data-miniprogram-path='${path}'>${innerHTML}</a>`;
      } else if (child.href !== null) {
        const innerHTML = child.innerHTML.replace(/<br>/g, '').replace(/<span (.*?)>/gi, '').replace(/<\/span>/gi, '');
        res += `<a href='${child.href}'>${innerHTML}</a>`;
      }
    }
  });
  return res;
}
// 统计字数
function getDomValuelength(elem) {
  var reg = /<a[^>]+?href=["']?([^"']+)["']?[^>]*>([^<]+)<\/a>/gi;
  var data = elem.toLowerCase().replace(reg, function ($1, $2, $3) {
    return $3;
  });
  return data.length;
}

// 往光标位置插入HTML片段
function insertHtmlAtCaret(html) {
  var sel, range, frag;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      range = sel.getRangeAt(0);
      range.deleteContents();
      var el = document.createElement('div');
      el.innerHTML = html;
      frag = document.createDocumentFragment();
      var node;
      var lastNode;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);
      if (lastNode) {
        range = range.cloneRange();
        range.setStartAfter(lastNode);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }
}

// 获取光标位置
function getCursortPosition(element) {
  var caretOffset = 0;
  var doc = element.ownerDocument || element.document;
  var win = doc.defaultView || doc.parentWindow;
  var sel;
  if (element.tagName === 'DIV') { // 谷歌、火狐
    sel = win.getSelection();
    if (sel.rangeCount > 0) { // 选中的区域
      var range = win.getSelection().getRangeAt(0);
      var preCaretRange = range.cloneRange(); // 克隆一个选中区域
      preCaretRange.selectNodeContents(element); // 设置选中区域的节点内容为当前节点
      preCaretRange.setEnd(range.endContainer, range.endOffset); // 重置选中区域的结束位置
      // caretOffset = preCaretRange.toString().length
      const tempElem = preCaretRange.cloneContents();
      caretOffset = getDomValue(tempElem).replace(/\n/g, '').length;
    }
  } else { // IE
    caretOffset = element.selectionEnd;
  }
  return caretOffset;
}

// 防抖函数
function debounce(func, wait) {
  var timer = null;

  return function () {
    var context = this;
    var args = arguments;

    timer && clearTimeout(timer);
    timer = setTimeout(function () {
      func.apply(context, args);
    }, wait);
  };
}

export {
  getDomValue,
  insertHtmlAtCaret,
  getCursortPosition,
  debounce,
  getDomValuelength
};