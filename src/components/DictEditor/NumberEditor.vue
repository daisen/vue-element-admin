<template>
  <div>
    <el-input v-show="editable" v-model="value" type="number" :placeholder="bindColumn.hint" :readonly="readonly" v-bind="$attrs" @blur="validate" v-on="$listeners" />
    <span v-show="!editable" :class="displayClass">{{ text }}</span>
  </div>
</template>
<script>
import { methods, props, data } from './uiobj-adpater'

const name = 'number-editor'
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

