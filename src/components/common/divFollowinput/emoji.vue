<template>
<div ref="emojibox" class="emojibox">
    <div class="box-title">表情</div>
    <ul class="emoji-list">
      <li v-for="(emoji, i) in  emojiMap" :key="i" class="emoji-item"  @click="selectEmoji(i,$event)">
      {{i}}
      </li>
    </ul>
  </div>
</template>
<script>
const emoji = require('emoji');
export default {
  data() {
    return {
      emojiMap: emoji.EMOJI_MAP
    };
  },
  methods: {
    // 插入表情
    selectEmoji(emoji) {
      this.$emit('emoji', emoji);
    }
  }
};
</script>
<style scoped lang="less">
 .emojibox {
    width: 380px;
    border: 1px solid #ccc;
    border-radius: 3px;
    padding: 4px;
    background: #ffffff;
    flex-direction: column;

    .box-title {
      display: flex;
      justify-content: space-between;
    }
    .emoji-list {
      height: 200px;
      margin: 0px;
      padding: 2px;
      display: flex;
      flex-basis: 100%;
      flex-wrap: wrap;
      align-items: flex-start;
      overflow-y:auto;
    }
    .emoji-item {
      list-style: none;
      cursor: pointer;
      font-size: 14px;
      text-align: center;
      width:22px;
      height:22px;
    }
    .emoji-item:hover {
      img{
        border: 1px solid #ccc;
      }
    }
  }
</style>