<template>
  <div id="app">
    <p>使用div标签的可编辑属性实现的富文本编辑器</p>
    <editer></editer>
  </div>
</template>

<script>

import editer from './components'

export default {
  name: 'App',
  components: {
    editer
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
