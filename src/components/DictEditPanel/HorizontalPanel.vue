<template>
  <div class="horizontal-panel">
    <div class="clearfix card-title">
      <span>{{ title }}</span>
    </div>
    <el-form :label-position="labelPosition" class="edit-panel">
      <el-row v-for="(item, index) in items" :key="index">
        <el-col v-for="(col, index2) in item" :key="col.fieldName" :span="getColSpan(index2)">
          <el-form-item :ref="col.fieldName" :label="col.dispName + ':'" :prop="col.fieldName" :label-width="col.labelWidth + 'px'">
            <component :is="getEditor(col)" :obj-id="objId" :column="col.fieldName" :on-error="handleError" class="field-content" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>
<script>
import { UIObj } from 'dict'
import editors from '../DictEditor'
import { getEditor } from '../DictEditor/util'

export default {
  name: 'HorizontalPanel',
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
      title: '分组一',
      labelPosition: 'right',
      columns: [],
      items: []
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

      const arrHeader = uiObj.headers.split(',')
      if (arrHeader.hasOwnProperty(this.tag)) {
        this.title = arrHeader[this.tag]
      }
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
.horizontal-panel .card-title {
  padding: 8px 16px;
  background-color: #ecf8ff;
  border-radius: 4px;
  border-left: 5px solid #50bfff;
}

.horizontal-panel .edit-panel {
  margin-top: 10px;
}

.horizontal-panel .edit-panel .el-form-item__label {
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    border-top: 1px solid #e4e7ed;
    border-left: 1px solid #e4e7ed;
}

.horizontal-panel .field-content {
    border-bottom: 1px solid #e4e7ed;
    border-top: 1px solid #e4e7ed;
    border-right: 1px solid #e4e7ed;
    min-height: 38px;
}

.horizontal-panel .el-form-item {
  margin-bottom: -1px;
  margin-left: -1px;
}

.horizontal-panel .el-form-item>label {
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>

