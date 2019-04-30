<template>
  <div>
    <el-checkbox v-show="editable" v-model="value" :placeholder="bindColumn.hint" :disabled="readonly" v-bind="$attrs" v-on="$listeners" @change="validate" />
    <span v-show="!editable" :class="displayClass">{{ text }}</span>
  </div>
</template>
<script>
import { methods, props, data } from './uiobj-adpater'

const name = 'check-box-editor'
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
    ...methods
  }
}
</script>

