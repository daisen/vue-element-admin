<template>
  <page-a :biz="biz" />
</template>
<script>
import PageA from '../base/PageA'
import BaseBiz from '../base/BaseBiz'

class DataObjBiz extends BaseBiz {
}
const biz = new DataObjBiz()
export default {
  name: 'Dataobj',
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

