<template>
  <div class="dict-grid">
    <auto-grid :obj-id="objId" :height="gridHeight" />
    <el-pagination v-if="showPagination" :current-page="currentPage" :page-sizes="[50, 100, 200, 300, 400]" :page-size="50" layout="total, sizes, prev, pager, next, jumper" :total="totalCount" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
  </div>

</template>
<script>
import AutoGrid from './components/autoGrid'
import UIObj from 'dict/UIObj'
// const actions = {
//   currentChanged: 'currentChanged',
//   rowsChanged: 'rowsChanged',
//   pageChanged: 'pageChanged',
//   cellChanged: 'cellChanged',
//   cellClick: 'cellClick',
//   cellDbClick: 'cellDbClick',
//   cellRightClick: 'cellRightClick',
//   beforeCellEdit: 'beforeCellEdit',
//   beforeNewRow: 'beforeNewRow',
//   keyDown: 'keyDown',
//   focused: 'focused'
// }

export default {
  name: 'DictGrid',
  components: {
    AutoGrid
  },
  props: {
    objId: {
      type: Number
    },
    pageSize: {
      type: Number,
      default: 50
    },
    gridHeight: [String, Number]
  },
  data() {
    return {
      currentPage: 1,
      totalCount: 0,
      showPagination: true
    }
  },
  methods: {
    bindUIObj() {
      const obj = UIObj.getUIObj(this.objId)
      obj.on('onCollectChanged', (target, args) => {
        this.totalCount = target.getTotalRows()
      })

      this.pageSize = obj.getPageSize()

      this.showPagination = obj.isMultiPage
    },
    handleSizeChange(val) {
      const obj = UIObj.getUIObj(this.objId)
      obj.setPageSize(val)
    },
    handleCurrentChange(val) {
      const obj = UIObj.getUIObj(this.objId)
      obj.setPagenum(val)
    }
  }

}
</script>
<style>
.dict-grid {
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>

