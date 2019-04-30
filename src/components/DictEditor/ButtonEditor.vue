<template>
  <div>
    <el-button v-show="editable" type="primary" :disabled="readOnly" :placeholder="bindColumn.hint" v-bind="$attrs" @click="handleClick" v-on="$listeners" />
    <span v-show="!editable" :class="displayClass">{{ text }}</span>
  </div>
</template>
<script>
import { methods, props, data } from './uiobj-adpater'

const name = 'button-editor'
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
      ...data
    }
  },
  methods: {
    ...methods,
    handleClick() {
      this.bindColumn.onClick()
    }
  }
}
</script>

