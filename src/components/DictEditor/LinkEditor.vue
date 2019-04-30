<template>
  <div>
    <a :href="value" />
    <router-link :to="path || '#'">{{ text }}</router-link>
  </div>
</template>
<script>
import { methods, props, data } from './uiobj-adpater'

const name = 'link-editor'
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

