<template>
  <div v-if="columns.length > 0">
    <el-form inline="true" class="dict-query-panel-form" :style="styleObject">
      <el-form-item :ref="col.fieldName" :label="col.dispName" :prop="col.fieldName" :label-width="col.dispWidth + 'px'">
        <component :is="getEditor(col)" :obj-id="objId" is-query :column="col.fieldName" :on-error="handleError" class="field-content" />
      </el-form-item>
    </el-form>
  </div>

</template>
<script>
import { UIObj } from 'dict'
import editors from '../DictEditor'
import { getEditor } from '../DictEditor/util'

export default {
  name: 'DictQueryPanel',
  components: {
    ...editors
  },
  props: {
    objId: Number,
    tag: {
      type: Number,
      default: 0
    },
    colNum: {
      type: Number,
      default: 3
    }
  },
  data: function() {
    return {
      columns: [],
      items: [],
      styleObject: {
        height: '100px'
      }
    }
  },
  created: function() {
    this.computeLayout()
  },
  methods: {
    computeLayout() {
      const uiObj = UIObj.getUIObj(this.objId)
      for (const col of uiObj.columns) {
        if (col.isQrySele) {
          this.columns.push(col)
        }
      }
    },
    handleError(col, error) {
      this.$refs[col].error = error
    },
    getEditor
  }
}
</script>
<style>
.dict-query-panel-form {
  max-height: 200px
}
</style>
