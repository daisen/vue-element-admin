<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix card-title">
        <span>{{ title }}</span>
      </div>
      <el-row>
        <el-col v-for="(item,index) in items" :key="index" :span="getColSpan(index)">
          <el-form :label-position="labelPosition">
            <el-form-item v-for="col in item" :ref="col.fieldName" :key="col.fieldName" :label="col.dispName" :prop="col.fieldName" :label-width="col.dispWidth + 'px'">
              <component :is="getEditor(col)" :obj-id="objId" :column="col.fieldName" :on-error="handleError" />
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>

    </el-card>
  </div>
</template>
<script>
import UIObj from 'dict/UIObj'
import editors from '../DictEditor'
import { getEditor } from '../DictEditor/util'

export default {
  name: 'VerticalPanel',
  components: {
    ...editors
  },
  props: {
    objId: Number,
    tag: {
      type: Number,
      default: 0
    },
    rowNum: {
      type: Number,
      default: 3
    }
  },
  data: function() {
    return {
      title: '分组一',
      labelPosition: 'right',
      columns: [],
      items: [],
      colNum: 0
    }
  },
  created: function() {
    this.computeLayout()
  },
  methods: {
    computeLayout() {
      const uiObj = UIObj.getUIObj(this.objId)
      for (const col of uiObj.columns) {
        if (col.pageId === this.tag) {
          this.columns.push(col)
        }
      }

      const layout = []
      for (let i = 0; i < this.columns.length; i++) {
        if (i % this.colNum === 0) {
          layout.push([])
        }

        layout[layout.length - 1].push(this.columns[i])
      }

      this.items = layout
    },
    getColSpan(index) {
      const colSpan = Number.parseInt(24 / this.colNum)
      if (index === this.colNum - 1) {
        return 24 - index * colSpan
      }

      return colSpan
    },
    handleError(col, error) {
      this.$refs[col].error = error
    },
    getEditor
  }
}
</script>
<style>
.card-title {
  padding: 8px 16px;
  background-color: #ecf8ff;
  border-radius: 4px;
  border-left: 5px solid #50bfff;
}
</style>

