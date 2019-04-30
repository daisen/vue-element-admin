<template>
  <div>
    <el-select v-show="editable" v-model="value" :placeholder="bindColumn.hint" v-bind="$attrs" @blur="validate" @visible-change="handleVisibleChange" v-on="$listeners">
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
    <span v-show="!editable" :class="displayClass">{{ text }}</span>
  </div>
</template>
<script>
import { methods, props, data } from './uiobj-adpater'

const name = 'combo-box-editor'
export default {
  name,
  created() {
    this.bindUIObj()
  },
  props: {
    ...props
  },
  data() {
    return {
      ...data,
      options: []
    }
  },
  methods: {
    ...methods,
    handleVisibleChange(val) {
      if (val) {
        this.bindColumn.loadRefData(this.bindRow)
        this.options = this.bindColumn.getRefList()
      }
    }
  }
}
</script>

