<template>
  <el-table
    ref="table"
    class="auto-grid"
    border
    fit
    highlight-current-row
    :height="height"
    row-class-name="auto-row"
    header-cell-class-name="auto-column"
    :data="uiObj.rows"
    @current-change="handleCurrentChange"
    @cell-click="handleCellClick"
    @cell-dbclick="handleDbCellClick"
  >
    <el-table-column type="index" width="50" />
    <el-table-column v-for="col in columns" :key="col.fieldName" :label="col.dispName" :prop="col.fieldName" :width="col.headerWidth">
      <template slot-scope="scope">
        <component :is="getEditor(col)" :obj-id="objId" is-grid :column="col.fieldName" :row="scope.row" />
      </template>
    </el-table-column>
  </el-table>
</template>
<script>
import { UIObj, Enums } from 'dict'
import editors from '../../DictEditor'
import { getEditor } from '../../DictEditor/util'

export default {
  name: 'AutoGrid',
  components: {
    ...editors
  },
  props: {
    objId: {
      type: Number
    },
    height: [String, Number]
  },
  data() {
    return {
      uiObj: {},
      columns: [],
      currentRowKey: 0
    }
  },
  created() {
    this.initObj()
  },
  methods: {
    initObj() {
      this.uiObj = UIObj.getUIObj(this.objId)
      for (const col of this.uiObj.columns) {
        if (col.dispPosition === Enums.DispPosition.ALL || col.dispPosition === Enums.DispPosition.BROWSER) {
          this.columns.push(col)
        }
      }

      this.uiObj.on('onCurrentChanged', (target, args) => {
        const trNum = this.$refs.table.bodyWrapper.querySelectorAll('tr').length
        if (trNum === 0) {
          this.$nextTick(() => {
            this.$refs.table.setCurrentRow(args.newRow)
          })
        } else {
          this.$refs.table.setCurrentRow(args.newRow)
        }
      })

      this.uiObj.on('onUpdateLayout', (target, args) => {
        this.$nextTick(() => {
          this.$refs.table.doLayout()
        })
      })
    },
    handleCurrentChange(currentRow) {
      this.uiObj.setCurrentRow(currentRow)
    },
    handleCellClick(row, column) {
      this.uiObj.onCustomEvent('cellClick', {
        row,
        column
      })
    },
    handleDbCellClick(row, column) {
      this.uiObj.onCustomEvent('cellDbClick', {
        row,
        column
      })
    },
    getRowKey(row) {
      return row['$id']
    },
    getEditor
  }
}
</script>
<style>
.auto-grid {
  width: 100%;
}
.auto-grid .auto-column {
  background: #f5f7fa;
}
.auto-grid .auto-row {
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>

