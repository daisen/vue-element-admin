<template>
  <div>
    <el-input v-show="editable" v-model="value" :placeholder="bindColumn.hint" :readonly="readonly" v-bind="$attrs" v-on="$listeners" @blur="validate" />
    <span v-show="!editable" :class="displayClass">{{ text }}</span>
  </div>
</template>
<script>
import { methods, props, data } from './uiobj-adpater'

const name = 'text-editor'
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

