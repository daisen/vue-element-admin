<template>
  <page-a :biz="biz" />
</template>
<script>
import PageA from '../base/PageA'
import BaseBiz from '../base/BaseBiz'

class UIObjBiz extends BaseBiz {
}
const biz = new UIObjBiz()
export default {
  name: 'Uiobj',
  beforeRouteEnter(to, from, next) {
    biz.beforeRouteEnter(to, from, next)
  },
  components: {
    PageA
  },
  data() {
    return {
      biz
    }
  }
}
</script>

