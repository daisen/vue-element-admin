<template>
  <div>
    <component :is="orientation" v-for="n in pageNum" :key="n" :obj-id="objId" :tag="tag" />
  </div>

</template>
<script>
import UIObj from 'dict/UIObj'
import HorizontalPanel from './HorizontalPanel'
import VerticalPanel from './VerticalPanel'
const LAYOUT = ['horizontal-panel', 'vertical-panel']
export default {
  name: 'DictEditPanel',
  components: {
    HorizontalPanel,
    VerticalPanel
  },
  props: {
    objId: Number,
    tag: Number,
    orientation: {
      type: String,
      default: LAYOUT[0]
    }
  },
  data: function() {
    return {
      state: 0, // 0-browser, 1-edit, 2-add
      pageNum: 1
    }
  },
  mounted() {
    this.computePanel()
  },
  methods: {
    computePanel() {
      const uiObj = UIObj.getUIObj(this.objId)
      let maxTag = 0
      for (const col of uiObj.columns) {
        if (col.pageId > maxTag) {
          maxTag = col.pageId
        }
      }

      this.pageNum = maxTag + 1
    }
  }
}
</script>

