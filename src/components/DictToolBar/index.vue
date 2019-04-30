<template>
  <sticky :class-name="'sub-navbar'" :z-index="5">
    <template>
      <span v-for="item in items" :key="item.code">
        <el-button v-if="!item.subItems && !item.isLink" :key="item.code" class="tool-bar-item" :type="item.type" @click="handleClick(item.code)">{{ item.caption }}</el-button>
        <el-dropdown v-if="item.subItems" class="tool-bar-item" split-button :type="item.type" @click="handleClick(item.code)">
          {{ item.caption }}
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="subItem in item.subItems" :key="subItem.code" :command="subItem.code">{{ subItem.caption }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <router-link v-if="item.isLink" class="tool-bar-item" :to="{ path: item.path}">
          <el-button type="info">{{ item.caption }}</el-button>
        </router-link>
      </span>
    </template>
  </sticky>
</template>
<script>
import Sticky from '@/components/Sticky' // 粘性header组件
export default {
  name: 'DictToolBar',
  components: {
    Sticky
  },
  props: {
    items: Array
  },
  methods: {
    init() {

    },
    handleClick(code) {
      this.$emit('onItemClick', code)
    }
  }
}
</script>
<style>
.tool-bar-item {
  margin-left: 10px;
}

.tool-bar {
  z-index: 100;
}
</style>

