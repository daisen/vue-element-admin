<template>
  <div>
    <el-date-picker v-show="editable" v-model="value" type="date" :readonly="readonly" :placeholder="bindColumn.hint" v-bind="$attrs" @blur="validate" v-on="$listeners" />
    <span v-show="!editable" :class="displayClass">{{ text }}</span>
  </div>
</template>
<script>
import { methods, props, data } from './uiobj-adpater'

const name = 'date-editor'
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

