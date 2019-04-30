import Enums, { getEnums } from './enums'
import Dict from './dict'
import _ from 'underscore'
import MSG from './local'
import UIColumn from './UIColumn'
import UIRow from './UIRow'
import UIRelation from './UIRelation'
import { serialize, format, ID_PROPERTY, ROW_SELECT_COLNAME, toStrLines, getLength, getScaleLength, getIntegerLength, eventuality, Convert } from './util'

/**
 * 数据源
 * @description 用于业务操作数据，以及界面关联
 * @version 3.0
 * @author  huangshengtao
 * 2015-15-14 hst v3.0 重构代码，移除view和biz的影响
 */

/**
 * 界面对象
 */
class UIObj {
  /**
     * 数据源，用于进行操作业务数据，影响界面和后台
     * @param {[type]} opts [description]
     */
  constructor(opts) {
    this.columns = []
    this.rows = []
    this.currentRow = null
    this._error = null
    this._deletedRows = []
    this._originRows = []
    this._childRelations = []
    this._parentRelation = null
    this._needUpdateTotalRows = true // 是否更新总行
    this._totalRows = -1
    this._pageSize = -1
    this._pagenum = 0
    this._isOpened = true
    this._idSequence = {}
    this._editable = false
    this._requireDetail = false

    this.isDataSource = true
    this.onlySaveCurrent = false
    this.fixQuery = {}
    this.queryParamPlugin = null

    const defaultOpts = {
      allowDel: true,
      allowEdit: true,
      allowInsert: true,
      isMaster: false,
      isMultiPage: true,
      isSaveRefresh: true,
      isShowSelCol: false,
      isShow: true,
      objType: 0,
      multiType: 0
    }

    Object.assign(defaultOpts, opts)
    this.init(defaultOpts)

    eventuality(this)
  }

  /**
     * 初始化界面字典
     * @param  {object} dict 服务器传过来的字典对象
     * @return {object}      this
     */
  init(dict) {
    this.menuId = dict.menuId
    this.objName = dict.objName
    this.objId = dict.objId
    this.objDesc = dict.objDesc
    this.detailKey = dict.detailKey
    this.fixedSearch = dict.fixedSearch
    this.isDeletable = Convert.toBoolean(dict.isDeletable)
    this.isEditable = Convert.toBoolean(dict.isEditable)
    this.isInsertable = Convert.toBoolean(dict.isInsertable)
    this.isMaster = Convert.toBoolean(dict.isMaster)
    this.isMultiPage = Convert.toBoolean(dict.isMultiPage)
    this.isSaveRefresh = Convert.toBoolean(dict.isSaveRefresh)
    this.isShowSelCol = Convert.toBoolean(dict.isShowSelCol)
    this.isShow = dict.isShow
    this.masterKey = dict.masterKey
    this.parentObjId = dict.parentObjId
    this.defaultOrder = dict.defaultOrder
    this.objType = dict.objType
    this.multiFields = dict.multiFields
    this.multiMsg = dict.multiMsg
    this.multiType = dict.multiType
    this.treeField = dict.treeField
    this.headers = dict.headers
    this.dataObjId = dict.dataObjId
    this.columns.names = {}
    for (let i = 0; i < dict.columns.length; i++) {
      const col = new UIColumn(this.objId)
      const dictCol = dict.columns[i]
      col.init(dictCol)
      this.columns.push(col)
      this.columns.names[col.fieldName] = i
    }
    return this
  }

  setError(err) {
    this._error = err
    this.onError()
  }

  getError() {
    return this._error
  }

  hasError() {
    return !this._error
  }

  /**
     * 获取明细是否必填
     * @return {Number} [description]
     */
  getRequireDetail() {
    return this._requireDetail
  }

  /**
     * 设置是否明细是否必填
     * @param {Boolean} value
     */
  setRequireDetail(value) {
    this._requireDetail = value
    this.onPropertyChanged('RequireDetail')
  }

  /**
     * 获取是否需要更新总行数
     * @return {Number} [description]
     */
  getNeedUpdateTotalRows() {
    return this._needUpdateTotalRows
  }

  /**
     * 设置是否更新总行数属性
     * @param {[type]} value [description]
     */
  setNeedUpdateTotalRows(value) {
    this._needUpdateTotalRows = value
    this.onPropertyChanged('NeedUpdateTotalRows')
  }

  /**
     * 获取数据总行数
     * @return {number}
     */
  getTotalRows() {
    if (this._totalRows <= 0 && this.rows.length > 0) {
      return this.rows.length
    }
    return this._totalRows < 0 ? 0 : this._totalRows
  }

  setTotalRows(value) {
    this._totalRows = value
    this.onPropertyChanged('TotalRows')
  }

  /**
     * 获取每页行树，用于分页
     * @return {number}
     */
  getPageSize() {
    return this._pageSize
  }

  setPageSize(value) {
    this._pageSize = value
    this.onPropertyChanged('PageSize')
  }

  /**
     * 获取当前页号，查看数据所在的页号
     * @return {number}
     */
  getPagenum() {
    return this._pagenum
  }

  setPagenum(value) {
    this._pagenum = value
    this.onPropertyChanged('Pagenum')
  }

  getEditable() {
    return this._editable
  }

  setEditable(value) {
    this._editable = value
    this.onPropertyChanged('Editable')
  }

  // Property End
  // ///////////////////////////

  /**
   * 获取打印数据
   * @return {Array}
   */
  getPrintData() {
    const self = this
    const printData = []
    printData.push(serialize(self, true))
    for (let j = 0; j < self.getDetailRelations().length; j++) {
      const r = self.getDetailRelations()[j]
      printData.push(serialize(r.getDetail(), false))
    }

    return printData
  }

  /**
   * 获取打印变量
   * @return {Object}
   */
  getPrintVariables() {
    const self = this
    return self.onGetPrintVariables()
  }

  /**
   * 获取数据源上的指定列
   * @param  {UIColumn} col 列名，如果传入的是DataColumn，则直接返回
   * @return {UIColumn|null}         DataColumn或者null
   */
  getColumn(col) {
    if (col) {
      if (typeof col === 'string' && this.columns.names && this.columns.names.hasOwnProperty(col)) {
        return this.columns[this.columns.names[col]]
      }

      if (col.isDataColumn && this.columns.indexOf(col) >= 0) {
        return col
      }
    }
    return null
  }

  getCoumns() {
    return this.columns
  }

  getRows() {
    return this.rows
  }

  getIdxOfRow(row) {
    return this.rows.indexOf(row)
  }

  /**
   * 创建基于当前DataSource的行
   * @return {[type]} [description]
   */
  newRow(noDefault) {
    return new UIRow(this, noDefault)
  }

  /**
   * 增加行到当前数据源,如果dr未指定，则自动添加一行
   * @param {UIRow} [dr]
   * @param noDefault 是否不需要m默认值
   */
  addRow(dr, noDefault) {
    if (dr === undefined) {
      dr = this.newRow(noDefault)
    }

    if (!this._maxId) {
      this._maxId = 1
    }

    dr[ID_PROPERTY] = this._maxId++
    this.rows.push(dr)
    dr.dataRowState = Enums.DataRowState.ADDED

    if (this._isOpened) {
      this.onCollectChanged(Enums.CollectionChangedAction.ADD, dr)
      this.setCurrentRow(dr)
      this.onRowAdded(dr)
    }

    return dr
  }

  removeRow(dr) {
    const self = this
    let index = self.rows.indexOf(dr)
    if (index < 0) {
      return
    }

    this.rows.splice(index, 1)
    this.columns.forEach(function(col) {
      self.updateParent(col)
    })
    if (self._isOpened) {
      self.onRowRemoved(dr)
      self.onCollectChanged(Enums.CollectionChangedAction.REMOVE, dr)
      index = index - 1
      index = index > -1 ? index : 0
      self.setCurrentRow(index)
    }

    return self
  }

  /**
   * 删除行
   * @param  {UIRow} dr 要删除的行
   * @param   needConfirm 是否需要确认
   */
  deleteRow(dr, needConfirm) {
    const index = this.rows.indexOf(dr)
    if (index < 0) {
      return null
    }

    const self = this
    this.onRowDeleting(dr, needConfirm, function() {
      dr.rejectChanges()
      self.removeRow(dr)
      for (let j = 0; j < self._childRelations.length; j++) {
        const r = self._childRelations[j]
        if (dr.hasOwnProperty(r.getDetail().name)) {
          for (let i = 0; i < dr[r.getDetail().name].rows.length; i++) {
            dr[r.getDetail().name].rows[i].dataRowState = Enums.DataRowState.DELETED
          }
        }
      }
      if (dr.dataRowState === Enums.DataRowState.MODIFIED ||
      dr.dataRowState === Enums.DataRowState.UNCHANGED) {
        dr.dataRowState = Enums.DataRowState.DELETED
        self._deletedRows.push(dr)
      }

      self.onRowDeleted(dr)
    })
  }

  deleteAll() {
    for (let i = this.rows.length; i > 0; i--) {
      this.rows[i - 1].delete()
    }
  }

  /**
   * 清空数据。注意，clear后，所有数据都会销毁，包括删除的数据和原始数据
   * 无法通过rejectChange操作还原
   * @return {[type]} [description]
   */
  clear() {
  // if (this.rows.length > 0) {
    this.rows.splice(0)

    // 清空原始数据和删除数据
    this._idSequence = {}
    this._originRows.splice(0)
    this._deletedRows.splice(0)
    this.setTotalRows(0)
    // this.setPagenum(0);
    // this.setPageSize(-1);
    this.setCurrentRow(null)
    this.onCleared()
    this.onCollectChanged(Enums.CollectionChangedAction.RESET)

    return this
  }

  /**
   * 接受修改
   * @return {[type]} [description]
   */
  acceptChanges() {
    this._originRows = []
    for (let i = 0, len = this.rows.length; i < len; i++) {
      const dr = this.rows[i]
      // 主从从表数据
      for (let j = 0, len1 = this._childRelations.length; j < len1; j++) {
        const rel = this._childRelations[j]
        delete dr['$' + rel.detailId]
      }
      dr.acceptChanges()
      this._originRows.push(dr)
    }

    this._deletedRows.splice(0)
    return this
  }

  acceptChangesDeep() {
    this.acceptChanges()
    for (let i = 0; i < this._childRelations.length; i++) {
      const rel = this._childRelations[i]
      rel.getDetail().acceptChangesDeep()
    }
  }

  /**
   * 获取变动行，包含删除行
   * @param  {Function} iteratee 处理方法
   * @return {[type]}          [description]
   */
  getChanges(iteratee) {
    const self = this
    const changes = []

    // 删除行数据
    for (let k = 0; k < self._deletedRows.length; k++) {
      const delRow = self._deletedRows[k]
      changes.push(delRow)
      if (iteratee) {
        iteratee(delRow)
      }
    }

    // 本身修改数据
    for (let i = 0; i < self.rows.length; i++) {
      const row = self.rows[i]
      if (row.dataRowState !== Enums.DataRowState.UNCHANGED && row.dataRowState !== Enums.DataRowState.DETACHED) {
        changes.push(row)
        if (iteratee) {
          iteratee(row)
        }
      }
    }

    // 检查父数据是否有需要提交的内容
    const pr = self.getParentRelation()
    if (pr) {
      const masterRows = pr.getMaster().getAllRows()
      for (let j = 0; j < masterRows.length; j++) {
        const mrow = masterRows[j]
        const prRowKey = '$' + pr.detailId
        if (mrow.hasOwnProperty(prRowKey)) {
          for (let l = 0; l < mrow[prRowKey].rows.length; l++) {
            const drow = mrow[prRowKey].rows[l]
            if (drow.dataRowState !== Enums.DataRowState.UNCHANGED && drow.dataRowState !== Enums.DataRowState.DETACHED) {
              changes.push(drow)
              if (iteratee) {
                iteratee(drow)
              }
            }
          }

          // 删除行
          if (mrow[prRowKey].deleted.length > 0) {
            for (let l = 0; l < mrow[prRowKey].deleted.length; l++) {
              const dDelRow = mrow[prRowKey].deleted[l]
              if (dDelRow.dataRowState === Enums.DataRowState.DELETED) {
                changes.push(dDelRow)
                if (iteratee) {
                  iteratee(dDelRow)
                }
              }
            }
          }
        }
      }
    }

    return changes
  }

  /**
   * 获取实际的数据，通常与rows一致，只有在多级从表情况下才会导致不一致。
   * @param  {[type]} first_argument [description]
   * @return {[type]}                [description]
   */
  getAllRows() {
    const self = this
    const data = []

    // 删除行数据
    for (let k = 0; k < self._deletedRows.length; k++) {
      const delRow = self._deletedRows[k]
      data.push(delRow)
    }

    // 本身修改数据
    for (let i = 0; i < self.rows.length; i++) {
      const row = self.rows[i]
      data.push(row)
    }

    // 检查父数据是否有需要提交的内容
    const pr = self.getParentRelation()
    if (pr) {
      const masterRows = pr.getMaster().getAllRows()
      for (let j = 0; j < masterRows.length; j++) {
        const mrow = masterRows[j]
        const prRowKey = '$' + pr.detailId
        if (mrow.hasOwnProperty(prRowKey)) {
          for (let l = 0; l < mrow[prRowKey].rows.length; l++) {
            const drow = mrow[prRowKey].rows[l]
            data.push(drow)
          }
        }
      }
    }

    return data
  }

  /**
   * 获取选择行
   * @returns {Array}
   */
  getSelectedRows() {
    const selected = []
    this.rows.forEach(function(item) {
      if (item[ROW_SELECT_COLNAME]) {
        selected.push(item)
      }
    })

    return selected
  }

  /**
   * 放弃修改数据，取消修改
   * @param  {[type]} deep 是否深还原，即还原明细数据
   * @return {[type]}      [description]
   */
  rejectChanges(deep) {
    this.rows = []
    let curIndex = -1
    let curRow = null

    // 记录当前行的坐标
    if (this.currentRow && (this.currentRow.dataRowState === Enums.DataRowState.MODIFIED || this.currentRow.dataRowState === Enums.DataRowState.UNCHANGED)) {
      curIndex = this.currentRow[ID_PROPERTY]
    }

    // 重置当前行
    this.currentRow = null

    // 还原数据
    if (this._originRows) {
      for (let i = 0; i < this._originRows.length; i++) {
        const row = this._originRows[i]
        if (curIndex === row[ID_PROPERTY]) {
          curRow = row
        }
        row.rejectChanges()
        this.rows.push(row)
      }
    }

    this._deletedRows.splice(0)

    // 还原当前行，如果curIndex为-1，则还原后的当前行仍为null
    this.currentRow = curRow
    this.onCollectChanged(Enums.CollectionChangedAction.RESET)

    if (deep) {
      for (let i = 0; i < this._childRelations.length; i++) {
        const r = this._childRelations[i]
        r.getDetail().rejectChanges(deep)
      }
    }

    // 如果当前行为null，同时存在行数据，则设置当前行为首行
    if (!this.currentRow && this.rows.length > -1) {
      this.setCurrentRow(this.rows[0])
    }
  }

  /**
   * 增加主从关系
   * @param {DataSource} detail        [description]
   * @param {String} masterColunms [description]
   * @param {String} detailColumns [description]
   */
  addRelation(detail, masterColunms, detailColumns) {
    for (let i = 0; i < this._childRelations.length; i++) {
      const r = this._childRelations[i]
      if (r.detailId === detail.objId) {
        return
      }
    }

    const relation = new UIRelation(this.objId, detail.objId, masterColunms, detailColumns)
    if (detail._parentRelation !== null) { throw new Error('明细表已存在主表对象') }
    detail._parentRelation = relation
    this._childRelations.push(relation)
  }

  /**
   * 获取第一个明细
   * @return {[type]} [description]
   */
  getFirstDetail() {
    if (this._childRelations.length > 0) {
      return this._childRelations[0].getDetail()
    }

    return null
  }

  /**
   * 获取所有明细
   * @param {String} [objId]
   * @return {Array[DataSource]} [description]
   */
  getDetails(objId) {
    const details = []
    for (let i = 0; i < this._childRelations.length; i++) {
      const d = this._childRelations[i]
      if (!objId || d.detailId === objId) {
        details.push(d.getDetail())
      }
    }
    return details
  }

  getMaster() {
    if (this._parentRelation) {
      return this._parentRelation.getMaster()
    }
    return null
  }

  getDetailRelations() {
    return this._childRelations
  }

  getParentRelation() {
    return this._parentRelation
  }

  setSchemaData(schemaData) {
    const rows = schemaData.rows
    const columns = schemaData.columns
    const totalRows = schemaData.totalRows

    // 总行数
    if (totalRows) {
      this.setTotalRows(totalRows)
    }

    // 列值
    if (columns) {
      for (const col in columns) {
        const index = this.columns.names[col]
        if (index === undefined) {
          continue
        }

        this.columns[index].paraValue = columns[col]
      }
    }

    // 数据
    if (rows) {
      this.loadData(rows)
    }
  }

  loadData(rows) {
    if (!rows || !(rows instanceof Array)) return
    this.onBeforeDataSrcLoadData(rows)

    this._isOpened = false
    try {
      for (let i = 0; i < rows.length; i++) {
        const rowData = rows[i]
        const row = new UIRow(this.objId, true)
        row.loadData(rowData)
        this.addRow(row)
      }

      this.acceptChanges()
      this._isOpened = true
      this.onCollectChanged(Enums.CollectionChangedAction.RESET)
      this.onAfterDataSrcLoadData(true)
    } catch (e) {
      this._isOpened = true
      this.onAfterDataSrcLoadData(false)
      throw e
    }

    this.setCurrentRow(this.rows[0])
  }

  /**
   * 快照当前数据，用于后续reset
   * @return {[type]} [description]
   */
  snapData() {
    const data = {}
    data.origin = [...this._originRows]
    data.deleted = [...this._deletedRows]
    data.rows = [...this.rows]
    return data
  }

  resetData(data) {
    this._isOpened = false
    try {
      this._idSequence = {}
      this.rows = data.rows
      this._originRows = data.origin
      this._deletedRows = data.deleted
      this.currentRow = this.rows[0] || null
      this.onCollectChanged(Enums.CollectionChangedAction.RESET)
    } catch (e) {
      console.log(e)
    }
    this._isOpened = true
  }

  removeEmptyRow() {
    const self = this
    // 移除空行
    for (let j = this.rows.length - 1; j > -1; j--) {
      const row = this.rows[j]
      if (row.isEmpty()) {
        row.delete()
      }

      const details = self.getDetails()
      for (let i = 0; i < details.length; i++) {
        const d = details[i]
        if (row[d.name]) {
          self.removeDetailEmptyRow(row[d.name].rows)
        }
      }
    }
  }

  removeDetailEmptyRow(rows) {
    for (let j = rows.length - 1; j > -1; j--) {
      const row = rows[j]
      if (row.isEmpty()) {
        rows.splice(j, 1)
      }
    }
  }

  validate(deep) {
    const msgs = []

    // 先移除空行，再校验
    this.removeEmptyRow()
    this.getChanges(row => {
      if (row.dataRowState !== Enums.DataRowState.DELETED) {
        this.validateDataRow(row, (err) => {
          msgs.push(err)
        })
      }
    })

    if (msgs.length > 0) {
      this.setError(toStrLines(msgs))
      return false
    }

    if (msgs.length === 0 && deep) {
      for (let i = 0; i < this._childRelations.length; i++) {
        const rel = this._childRelations[i]

        // 先移除空行，再校验
        if (!rel.getDetail().validate(true)) {
          return false
        }

        // 明细必填检查
        if (this.getRequireDetail() && rel.getDetail().isEmpty()) {
          this.setError(format(MSG.DS_REQUIREDETAIL, rel.detailId))
          return false
        }
      }
    }

    return true
  }

  /**
   * 设置保存扩展类，用于调用服务器的保存操作
   * @param {[type]} className [description]
   */
  setSaveExtClass(className) {
    this.saveExtClass = className
  }

  /**
   * 获取包含结构信息的保存操作数据
   * @return {Object} 数据
   */
  getSchemaData(args) {
    const schema = {}

    if (!args) {
      args = {}
    }

    const self = this

    // 结构
    const table = {
      menuId: self.menuId,
      objType: self.objType,
      pageSize: args.updateRow ? 0 : self._pageSize,
      pageIndex: self._pagenum,
      totalRows: self._totalRows,
      queryParams: self.getQueryParams(args),
      columnParams: self.getColumnParams(),
      isMaster: self.isMaster,
      detailRelation: [],
      rows: []
    }
    schema[self.objId] = table

    if (args.deep) {
      for (let i = 0; i < self._childRelations.length; i++) {
        const r = self._childRelations[i]
        table.detailRelation.push(r.getSchema())
        _.extend(schema, r.getDetail().getSchemaData({
          deep: args.deep,
          nodata: args.nodata
        }))
      }
    }

    // 存储过程不需要数据
    if (self.objType === Enums.UIObjType.STOREDPROC) {
      args.nodata = true
    }

    // 数据
    if (!args.nodata) {
      if (args.onlyOne) {
        const curRow = self.currentRow
        table.rows.push(curRow.getData())
      } else {
        self.getChanges(function(row) {
          if (row.dataRowState === Enums.DataRowState.DELETED) {
            table.rows.push(row.getData())
          }
          if (row.dataRowState === Enums.DataRowState.MODIFIED) {
            table.rows.push(row.getData())
          }
          if (row.dataRowState === Enums.DataRowState.ADDED) {
            table.rows.push(row.getData())
          }
        })
      }
    }

    if (args.deleteCur) {
      const curRow = self.currentRow
      if (!curRow) throw new Error('delete row not found')

      const rowData = curRow.getData()
      rowData.$state = Enums.DataRowState.DELETED
      table.rows.push(rowData)
    }

    schema[self.objId] = table
    return schema
  }

  save(callback, deep) {
    const self = this

    const allow = this.onBeforeDataSrcSave()
    if (!allow) {
      return
    }

    // 检查业务逻辑是否通过
    if (this.validate(deep) === false) {
      return
    }

    // 存储过程的保存需要处理入参
    if (self.objType === Enums.UIObjType.STOREDPROC) {
      self.onSetStoredProcParas()
    }

    const postData = {
      beforeProc: '',
      afterProc: '',
      saveData: {},
      saveExtClass: self.saveExtClass
    }

    postData.saveData = self.getSchemaData({
      deep: deep,
      onlyOne: self.onlySaveCurrent
    })
    if (Object.keys(postData.saveData).length === 0) {
      self.onAfterDataSrcSave(true, callback)
      return
    }

    if (self.beforeSaveProc && self.beforeSaveProc.isDataSource) {
      postData.beforeProc = self.beforeSaveProc.objId
      _.extend(postData.saveData, self.beforeSaveProc.getSchemaData({
        nodata: true
      }))
    }

    if (self.beforeSaveProc && self.beforeSaveProc.isDataSource) {
      postData.afterProc = self.beforeSaveProc.objId
      _.extend(postData.saveData, self.beforeSaveProc.getSchemaData({
        nodata: true
      }))
    }

    UIObj.requestSave(postData, function(isOk, data) {
      if (isOk) {
        const schemaData = data[self.objId]
        self.setSchemaData(schemaData)
        if (deep) {
          self.acceptChangesDeep()
        } else {
          self.acceptChanges()
        }

        if (!self.onlySave) {
          self.updateRow()
        }
      }

      self.onAfterDataSrcSave(true, callback)
    })
  }

  /**
   * 删除当前行到服务器
   * @return {[type]} [description]
   */
  delete(callback) {
    if (this.currentRow) {
      const self = this
      const postData = {
        beforeProc: '',
        afterProc: '',
        saveData: {},
        saveExtClass: self.saveExtClass
      }

      postData.saveData = self.getSchemaData({
        deep: true,
        onlyOne: self.onlySaveCurrent,
        nodata: true,
        deleteCur: true
      })

      if (self.beforeDeleteProc && self.beforeDeleteProc.isDataSource) {
        postData.beforeProc = self.beforeDeleteProc.objId
        // self.beforeProc.getSaveSchemaData(false, postData.saveData);
        _.extend(postData.saveData, self.beforeDeleteProc.getSchemaData({
          nodata: true
        }))
      }

      if (self.beforeDeleteProc && self.beforeDeleteProc.isDataSource) {
        postData.afterProc = self.beforeDeleteProc.objId
        // self.afterProc.getSaveSchemaData(false, postData.saveData);
        _.extend(postData.saveData, self.beforeDeleteProc.getSchemaData({
          nodata: true
        }))
      }

      UIObj.requestSave(postData, function(isOk, data) {
        if (isOk) {
          const row = self.currentRow
          self.deleteRow(row)

          self.clearChild()
          self.acceptChanges()
          if (!self.currentRow) {
            self.moveToPrev()
          }
        }
        if (callback) {
          callback(isOk)
        }
      })
    }
  }

  clearChild() {
    for (let i = 0; i < this._childRelations.length; i++) {
      const r = this._childRelations[i]
      r.getDetail().clear()
      r.getDetail().clearChild()
    }
  }

  /**
   * @param {DataSource} ds 数据源
   * @param {UIRow} masterRow 主表行
   * @param {UIRow} curRow 当前行
   */
  getQueryParams(args) {
    let params = {}
    const ds = this
    if (args.updateRow) {
      params.fixQuery = {}
      for (let i = 0; i < ds.columns.length; i++) {
        const col = ds.columns[i]
        if (col.isPrimaryKey) {
          params.fixQuery[col.fieldName] = args.updateRow[col.fieldName]
        }
      }
    } else {
      params = {
        refQuery: ds.refQuery,
        searchQuery: ds.searchQuery,
        fixQuery: {},
        defaultQuery: {
          funcObjCode: ds.objName,
          menuId: ds.menuId
        },
        projectQuery: {},
        treeQuery: ds.treeQuery,
        userExtSqlQuery: ds.queryParamPlugin
      }

      _.extend(params.fixQuery, ds.fixQuery)

      if (ds.linkQuery) {
        params['linkQuery'] = ds.linkQuery
      }

      if (ds.cautionQuery) {
        params['cautionQuery'] = ds.cautionQuery
        ds.cautionQuery = null
      }

      if (ds.defaultOrder && ds.defaultOrder.length > 0) {
        params.order = ds.defaultOrder
      }

      if (args.masterRow) {
        _.extend(params.fixQuery, ds._parentRelation.getParams(args.masterRow))
      }

      this.onGetQueryParams(params)
    }

    if (ds._parentRelation) {
      const masterRow = ds._parentRelation.getMaster().currentRow
      params.M = masterRow ? masterRow.getData() : {}
    }
    return params
  }

  /**
   * 获取列值传输对象，用于服务器处理存储过程入参
   * @param  {DataSource} ds
   * @return {Object}
   */
  getColumnParams() {
    const params = {}
    const ds = this
    if (ds.objType === Enums.UIObjType.STOREDPROC) {
      for (let i = 0; i < ds.columns.length; i++) {
        const col = ds.columns[i]
        if (col.procParaType === Enums.ProcParaType.IN || col.procParaType === Enums.ProcParaType.INOUT) {
          params[col.fieldName] = col.paraValue
        }
      }
    }
    return params
  }

  getExportData(hasData) {
    return this.onGetExportData(hasData)
  }

  /**
   * 刷新数据源数据
   * @param  {Function} callback 参数isOk，DataSource
   * @return {undefined}
   */
  search(callback, args) {
    const self = this

    if (!args || args.reset) {
      self.setPagenum(0)
      self.setTotalRows(0)
    }

    if (!self.onBeforeSearch()) return

    if (self.objType === Enums.UIObjType.STOREDPROC) {
      self.onSetStoredProcParas()
    }

    const postData = {
      beforeProc: self.beforeSearchProc,
      afterProc: self.afterSearchProc,
      searchData: {}
    }
    _.extend(postData.searchData, self.getSchemaData())

    UIObj.requestSearch(postData, function(isOk, result) {
      if (isOk) {
        // 优先清除数据，保证数据的实时性
        self.clear()
        const schemaData = result[self.objId]
        self.setSchemaData(schemaData)
        self.acceptChanges()
      }
      if (callback) {
        callback(isOk, self)
      }
    })
  }

  /**
   * 更新某一行的数据
   * @param  {UIRow} [dr]
   * @return
   */
  updateRow(dr) {
    const self = this

    if (self.objType === Enums.UIObjType.STOREDPROC) {
      return
    }

    if (!dr) {
      dr = self.currentRow
    }

    const postData = {
      beforeProc: null,
      afterProc: null,
      searchData: {},
      sync: true
    }
    _.extend(postData.searchData, self.getSchemaData({
      updateRow: dr,
      nodata: true
    }))
    const isCurrentRow = dr === this.currentRow

    UIObj.requestSearch(postData, function(isOk, result) {
      if (isOk) {
        const schemaData = result[self.objId]
        if (schemaData.rows && schemaData.rows.length === 1) {
          dr.loadData(schemaData.rows[0])
        } else {
          self.setError(format(MSG.UPDATEROW_ERR))
        }
        dr.acceptChanges()
        if (isCurrentRow) {
          self.onCurrentChanged(dr, dr)
        }
        return
      }
    })
  }

  /**
   * 根据主表行，刷新当前明细
   * @param  {[type]}   dr       [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  searchByMaster(dr, callback) {
    const self = this
    self.clear()
    if (!dr || dr.dataRowState === Enums.DataRowState.ADDED) {
      if (callback) {
        callback(true, self)
      }
      return
    }

    if (self._parentRelation === null || self._parentRelation.getMaster() !== dr.dataSrc) {
      throw new Error('searchByMaster:' + MSG.SEARCH_MASTER_ROW_ERROR)
    }

    if (self.objType === Enums.UIObjType.STOREDPROC) {
      throw new Error(MSG.SEARCH_ERROR_DETAIL, 'searchByMaster')
    }

    const postData = {
      beforeProc: self.beforeSearchProc,
      afterProc: self.afterSearchProc,
      searchData: {}
    }

    self.setPagenum(0)
    _.extend(postData.searchData, self.getSchemaData({
      masterRow: dr
    }))

    UIObj.requestSearch(postData, function(isOk, result) {
      if (isOk) {
        // 优先清除数据，保证数据的实时性
        self.clear()
        const schemaData = result[self.objId]
        self.setSchemaData(schemaData)
      }
      if (callback) {
        callback(isOk, self)
      }
    })
  }

  /**
   * 加载相关明细
   * @param  {Function} callback 回调
   * @return {[type]}            [description]
   */
  loadDetails(callback) {
    const postData = {
      beforeProc: null,
      afterProc: null,
      searchData: {}
    }

    const dr = this.currentRow
    _.extend(postData.searchData, this.getDetailsParams(dr, function(ds) {
      ds.clear()
    }))

    if (postData.length === 0) {
      if (callback) {
        callback(true)
      }
    } else {
      const self = this
      UIObj.requestSearch(postData, function(isOk, data) {
        for (let j = 0; j < self._childRelations.length; j++) {
          const d = self._childRelations[j]
          if (isOk && data.hasOwnProperty(d.detailId)) {
            const result = data[d.detailId]
            d.getDetail().clear()
            d.getDetail().setSchemaData(result)
            d.getDetail().acceptChanges()
          }
        }

        if (callback) {
          callback(isOk, self)
        }
      })
    }
  }

  /**
   * 获取从表查询约束
   * @param  {当前行} dr 主表行
   * @param {function} fn 每个明细的处理 fn(ds){}
   * @return {array}    参数集合
   */
  getDetailsParams(dr, cb) {
    const searchData = {}

    for (let i = 0; i < this._childRelations.length; i++) {
      const r = this._childRelations[i]
      if (cb) {
        cb(r.getDetail())
      }

      if (dr && dr.dataRowState !== Enums.DataRowState.ADDED) {
        _.extend(searchData, r.getDetail().getSchemaData({
          masterRow: dr
        }))
      }
    }

    return searchData
  }

  /**
   * 校验列值宽度
   * @param {UIRow} dr
   * @param {UIColumn} dc
   * @param {Object} value
   * @returns {Boolean}
   */
  validateColumnWidth(dr, dc, value) {
    if (dc.isCalc || (!value && value !== 0)) {
      return true
    }

    if (dc.dataType === Enums.DataType.STRING || dc.dataType === Enums.DataType.TEXT) {
      const len = getLength(value)
      if (len > dc.dataWidth) {
        dr.setColumnError(dc, this.onGetDataWidthErr(dr, dc, format(MSG.VALIDATE_LENGTH, dc.dispName, dc.dataWidth)))
        return false
      }
    }

    if (dc.dataType === Enums.DataType.NUMBER) {
      const scale = getScaleLength(value)
      const integer = getIntegerLength(value)
      let realInteger = dc.dataWidth - dc.dataDec
      const realScale = this.onGetPrecision(dr, dc)
      realInteger = realInteger > 0 ? realInteger : 0
      if (scale > realScale || integer > realInteger) {
        dr.setColumnError(dc, this.onGetDataWidthErr(dr, dc, format(MSG.VALIDATE_LENGTH_NUM, dc.dispName, realInteger, realScale)))
        return false
      }
    }

    return true
  }

  /**
 * 校验列类型
 * @param dr
 * @param dc
 * @param value
 * @returns {Boolean}
 */
  validateColumnType(dr, dc, value) {
    if (dc.isCalc || (!value && value !== 0)) {
      return true
    }

    let bRet = false
    switch (dc.dataType.toString()) {
      case Enums.DataType.NUMBER:
        bRet = /^(-?\d+)(\.\d+)?$/.test(value)
        break
      case Enums.DataType.DATETIME:
        bRet = !isNaN(Date.parse(value))
        if (!bRet) {
          const regDate = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)([ T][0-2]?[0-9]:[0-5]?[0-9]:[0-5]?[0-9])?$/
          bRet = regDate.test(value)
        }
        break
      default:
        bRet = true
    }
    if (!bRet) {
      dr.setColumnError(dc, this.onGetDataTypeErr(dr, dc, format(MSG.VALIDATE_TYPE, dc.dispName, value)))
    }
    return bRet
  }

  valiateColumnRule(dr, dc, value) {
    if (!dc.setRule) return true
    const reg = new RegExp(dc.setRule)
    if (!reg.test(value)) {
      dr.setColumnError(dc, this.onGetDataRuleErr(dr, dc, format(MSG.VAILIDATE_RULE, dc.dispName, value)))
    }
  }

  validateColumnStrictRef(dr, dc, value) {
    if (dc.isTableRef() || dc.isEnumRef()) {
    // 获取参照内容
      dc.loadRefData(dr, value, false, true)

      if (value !== dc.match && (value || value === 0)) {
      // 严格校验,只有表参照和枚举生效
        if (dc.isStrictRef && !dc.getRefItem()) {
          dr.setColumnError(dc,
            this.onGetDataStrictErr(dr, dc, format(MSG.VALIDTE_STRICTREF, dc.dispName, value)))
          return false
        }
      }
    }

    return true
  }

  /**
   * 校验列值，调用业务类
   * @param  {UIRow} dr    [description]
   * @param  {UIColumn} dc    [description]
   * @param  {Object} value  [description]
   * @return {bool} [description]
   */
  validateColumn(dr, dc, value, callback) {
  // 类型校验
    if (!this.validateColumnType(dr, dc, value)) return false
    // 长度校验
    if (!this.validateColumnWidth(dr, dc, value)) return false
    // 严格校验
    if (!this.validateColumnStrictRef(dr, dc, value)) return false
    // 自定义校验
    return this.onDataColumnValidate(dr, dc, value)
  }

  /**
   * 检查重复校验字段
   * @return {Boolean}   两个属性valid和msg
   */
  checkMultiField(dr) {
    const ds = this
    // 检查行重复
    if (ds.multiFields && ds.multiFields.length > 0) {
      const cols = ds.multiFields.split(',')
      // 检查校验字段是否存在
      for (let i = 0; i < cols.length; i++) {
        if (!ds.getColumn(cols[i])) {
          ds.setError(MSG.MULTIFIELD_MISS)
          return false
        }
      }
      // 获取行标识，用于辨别重复
      const getTag = (r) => {
        let tag = ''
        for (let i = 0; i < cols.length; i++) {
          const col = cols[i]
          tag = tag + '_' + r[col]
        }

        return tag
      }

      const curTag = getTag(dr)
      for (let j = 0; j < ds.rows.length; j++) {
        const row = ds.rows[j]
        if (row === dr) {
          continue
        } else {
          const tag = getTag(row)
          if (tag === curTag) {
            const index = _.findIndex(row.dataSrc.rows, row) + 1
            ds.setError(MSG.LINE + index + ': ' + ds.onGetMultiMsg(dr))
            return false
          }
        }
      }
    }

    return true
  }

  /**
   * 校验行操作
   * @param  {UIRow} dr [description]
   * @return {[type]}    [description]
   */
  validateDataRow(dr) {
    const self = this

    // 处理更新字段并检查行必填
    for (let k = 0; k < self.columns.length; k++) {
      const col = self.columns[k]
      self.onUpdateValue(dr, col)
      if (col.isRequired && (!dr[col.fieldName] && dr[col.fieldName] !== 0)) {
        const msg = format(MSG.VALUE_REQUIRE, col.dispName)
        dr.setColumnError(col.fieldName, msg, true)
      }
    }
    // 检查空行
    if (dr.isEmpty()) {
      setTimeout(function() {
        dr.delete()
      }, 120)
      return false
    }

    if (dr.hasError()) {
      this.setError(toStrLines([dr.getErrors()]))
      return false
    }

    // 检查行重复
    const result = this.checkMultiField(dr)
    if (!result) {
      return false
    }

    return self.onDataRowValidate(dr)
  }
  /**
   * 获取默认值
   * @param  {[type]} dr  [description]
   * @param  {[type]} col [description]
   * @return {[type]}     [description]
   */
  getDefaultValue(dr, col) {
    if (typeof col === 'string') {
      col = this.getColumn(col)
    }

    if (col) {
      const relationValue = this._parentRelation ? this._parentRelation.getDetailValue(col) : null
      const dfValue = relationValue === null ? col.defaultValue : relationValue
      return this.onGetDefaultValue(dr, col, dfValue)
    }

    return null
  }

  /**
   * 获取列相关的参照内容
   * @param  {UIRow}   row      [description]
   * @param  {UIColumn}   column   [description]
   * @param  {Object}   value    [description]
   * @param  {Function} callback [description]
   * @return {bool}            是否有数据
   */
  loadDefaultRefData(row, column, value, ignoreValue, isEdit) {
    isEdit = isEdit ? !!isEdit : this.getEditable()
    column.setRefData()
    column.setRefItem()

    if (column.refType === Enums.RefType.ENUM) {
      let result = getEnums(column.refObj) || []
      if (isEdit && column.refEditWhere) {
        const items = column.refEditWhere.split(',')
        const enumValues = {}

        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          enumValues[item] = result[item]
        }
        result = enumValues
      }

      result = this.onGetUserRefData(row, column, result)
      if (result.hasOwnProperty(value)) {
        column.setRefItem(result)
      }
      column.setRefData(result)
    }

    if (column.isTableRef()) {
    // 行不为空，表示进行严格校验，如果值为空或者为通配符，则跳出校验
      if (!ignoreValue && !value && value !== 0) {
        return
      }

      if (!ignoreValue && value === column.match) {
        const item = {}
        this.columns.forEach(function(c) {
          item[c.fieldName.toLowerCase()] = c.defaultValue
        })
        item[column.fieldName.toLowerCase()] = column.match
        column.setRefItem(item, row)
        column.setRefData([item])
        return
      }

      // 同步访问服务器，获取参照数据
      const postData = {
        menuId: this.menuId || '*',
        searchData: {},
        sync: true
      }

      postData.searchData[column.getRefObjCode()] = {
        pageSize: 0,
        pageIndex: 0,
        totalRows: 0,
        queryParams: {
          refQuery: column.getRefParam(row, value, isEdit, ignoreValue)
        }
      }

      let result = UIObj.requestSearch(postData) || []
      const schemaData = result[column.getRefObjCode()]
      const refRows = schemaData ? schemaData.rows : []
      result = this.onGetUserRefData(row, column, refRows)
      if (_.isArray(result) && result.length > 0) {
        column.setRefItem(result[0], row)
      }
      column.setRefData(result)
    }
  }

  getNextId(dc) {
    if (dc.dataType !== Enums.DataType.NUMBER) {
      return
    }

    if (this._idSequence.hasOwnProperty(dc.fieldName)) {
      if (this.rows.length === 0) {
        this._idSequence[dc.fieldName] = 0
      }
      return ++this._idSequence[dc.fieldName]
    } else {
      let maxNum = 0
      for (let i = 0; i < this.rows.length; i++) {
        const num = parseInt(this.rows[i][dc.fieldName]) || 0
        if (maxNum < num) {
          maxNum = num
        }
      }

      this._idSequence[dc.fieldName] = maxNum + 1
      return maxNum + 1
    }
  }

  /**
   * 重置NextId种子，Clear方法会默认执行该方法
   * @param {UIColumn} [dc]
   */
  resetNextId(dc) {
    if (dc) {
      if (this._idSequence.hasOwnProperty(dc.fieldName)) {
        delete this._idSequence[dc.fieldName]
      }
    } else {
      this._idSequence = {}
    }
  }

  isEmpty() {
    for (let i = 0; i < this.rows.length; i++) {
      const row = this.rows[i]
      if (!row.isEmpty()) {
        return false
      }
    }

    return true
  }

  /**
   * 更新父数据
   * @param col 明细列
   */
  updateParent(col) {
    const parentRlt = this.getParentRelation()
    if (parentRlt) {
      parentRlt.aggregateDetail(col)
    }
  }

  /** **当前行操作-开始****/

  /**
   * 设置当前行，引起行变换事件
   * @param {Object} row DataRow，也可以为数字，指行在当前数据源中的位置
   */
  setCurrentRow(row) {
    if (this._isOpened) {
      if (typeof row === 'number') {
        row = this.rows[row]
      }

      const oldRow = this.currentRow
      this.currentRow = row === undefined ? null : row
      if (oldRow !== row) {
        this.onCurrentChanged(row, oldRow)
      }
    }
  }

  getCurrentRow() {
    return this.currentRow
  }

  /**
   * 求列和
   * @param  {[type]} col   [列]
   * @param  {[type]} start [开始位置]
   * @param  {[type]} end   [终止位置]
   * @return {[type]}       [列值之和]
   */
  sumColValue(col, start, end) {
    let sum = 0
    let i = null
    if (typeof col === 'string') {
      col = this.getColumn(col)
    }
    if (col.isDataColumn && col.dataType === Enums.DataType.NUMBER) {
      for (i = start; i <= end; i++) {
        if (this.rows.length === 0) {
          sum = sum.add(0)
        } else {
          sum = sum.add(parseFloat(this.rows[i][col.fieldName]) || 0)
        }
      }
      sum = sum.toFixed(parseInt(col.dispScale))
    } else {
      sum = ''
    }
    return sum
  }

  /**
   * 求平均值
   * @param  {[type]} col   [列]
   * @param  {[type]} start [开始位置]
   * @param  {[type]} end   [终止位置]
   * @return {[type]}       [列值之平均值]
   */
  averageColValue(col, start, end) {
    let average = null
    let sum = null
    if (typeof col === 'string') {
      col = this.getColumn(col)
    }
    if (col.isDataColumn && col.dataType === Enums.DataType.NUMBER) {
      sum = this.sumColValue(col, start, end)
      if (sum === '') {
        average = ''
      } else {
        average = (sum / (end - start + 1)).toFixed(parseInt(col.dispScale))
      }
    } else {
      average = ''
    }
    return average
  }

  /**
   * 获取特定范围内列的最大值
   * @param  {[type]} col   [列]
   * @param  {[type]} start [开始位置]
   * @param  {[type]} end   [终止位置]
   * @return {[type]}       [列最大值]
   */
  getColMaxValue(col, start, end) {
    let max = 0
    let i = null
    if (typeof col === 'string') {
      col = this.getColumn(col)
    }
    if (col.isDataColumn && col.dataType === Enums.DataType.NUMBER) {
      for (i = start; i <= end; i++) {
        const _temp = parseFloat(this.rows[i][col.fieldName]) || 0
        max = max >= _temp ? max : _temp
      }
    } else {
      max = ''
    }
    return max
  }

  /**
   * 获取特定范围内列的最小值
   * @param  {[type]} col   [列]
   * @param  {[type]} start [开始位置]
   * @param  {[type]} end   [终止位置]
   * @return {[type]}       [列最小值]
   */
  getColMinValue(col, start, end) {
    let min = 0
    let i = null
    if (typeof col === 'string') {
      col = this.getColumn(col)
    }
    if (col.isDataColumn && col.dataType === Enums.DataType.NUMBER) {
      for (i = start; i <= end; i++) {
        const _temp = parseFloat(this.rows[i][col.fieldName]) || 0
        min = min <= _temp ? min : _temp
      }
    } else {
      min = ''
    }
    return min
  }

  /**
   * 移动到指定位置
   * @param  {Number} position 行位置
   * @return {[type]}          [description]
   */
  moveTo(position) {
    if (this.dataView) {
      this.dataView.moveTo(position)
    } else {
      let row = this.rows[position]
      row = row === undefined ? null : row
      this.setCurrentRow(row)
    }
  }

  /**
   * 向下移动一行
   * @return {[type]} [description]
   */
  moveToNext() {
    let position = this.rows.indexOf(this.currentRow)
    position++
    if (position >= this.rows.length) {
      position = this.rows.length
    }

    if (position < 0) {
      position = 0
    }

    this.moveTo(position)
  }

  /**
   * 向上移动一行
   * @return {[type]} [description]
   */
  moveToPrev() {
    let position = this.rows.indexOf(this.currentRow)
    position--
    this.moveTo(position < 0 ? 0 : position)
  }

  /**
   * 移动到首行
   * @return {[type]} [description]
   */
  moveToFirst() {
    this.moveTo(0)
  }

  /**
   * 移动到最后一行
   * @return {[type]} [description]
   */
  moveToLast() {
    this.moveTo(this.rows.length - 1)
  }

  /** **当前行操作-结束****/

  /** **事件-开始****/

  /**
   * 获取某行某列的精度
   * @param dr
   * @param dc
   */
  onGetPrecision(dr, dc) {
    const args = {
      row: dr,
      col: dc,
      precision: dc.dataDec
    }
    this.fire('onGetPrecision', args)
    return args.precision
  }

  /**
   * 数据发生变化事件
   * @param  {[type]} row [description]
   * @param  {[type]} col [description]
   * @return {[type]}     [description]
   */
  onFieldChanged(row, col) {
    const args = {
      row: row,
      col: col,
      valid: true,
      err: ''
    }
    this.fire('onFieldChanged', args)
    return args
  }

  onBeforeSearch() {
    const params = {
      isCancel: false
    }
    this.fire('onBeforeSearch')
    return !params.isCancel
  }

  onGetQueryParams(params) {
    this.fire('onGetQueryParams', params)
    return params
  }

  onCollectChanged(type, dr) {
    this.fire('onCollectChanged', {
      action: type,
      row: dr
    })
  }

  onGetColumnFormatter(dc, fmt) {
    const args = {
      col: dc,
      formatter: fmt
    }
    this.fire('onGetColumnFormatter', args)
    return args.formatter
  }

  onUserRefDlg(args) {
    this.fire('onUserRefDlg', args)
  }

  onGetUserRefColumnWhere(dr, dc, isEdit) {
    const args = {
      row: dr,
      col: dc,
      isEdit: isEdit,
      where: {}
    }
    this.fire('onGetUserRefColumnWhere', args)
    return args.where
  }

  onGetRowFormatter(dr, dc) {
    const args = {
      row: dr,
      col: dc,
      formatter: null
    }
    this.fire('onGetRowFormatter', args)
    return args.formatter
  }

  /**
   * 获取类型错误信息
   * @param {UIRow} dr
   * @param {UIColumn} dc
   * @returns {*}
   */
  onGetDataTypeErr(dr, dc, err) {
    const args = {
      row: dr,
      col: dc,
      err: err
    }
    this.fire('onGetDataTypeErr', args)
    return args.err
  }

  onGetDataWidthErr(dr, dc, err) {
    const args = {
      row: dr,
      col: dc,
      err: err
    }
    this.fire('onGetDataWidthErr', args)
    return args.err
  }

  onGetDataRuleErr(dr, dc, err) {
    const args = {
      row: dr,
      col: dc,
      err: err
    }
    this.fire('onGetDataRuleErr', args)
    return args.err
  }

  /**
   * 属性改变通知
   * @param  {string} property 属性名称
   * @return {undefined}
   */
  onPropertyChanged(property) {
    this.fire('onPropertyChanged', {
      propertyName: property
    })
  }

  onGetMultiMsg(dr) {
    const args = {
      row: dr,
      err: this.multiMsg
    }
    this.fire('onGetMultiMsg', args)
    return args.err
  }

  onGetDataStrictErr(dr, dc, err) {
    const args = {
      row: dr,
      col: dc,
      err: err
    }
    this.fire('onGetDataStrictErr', args)
    return args.err
  }

  getFieldReadOnly(dr, dc) {
    const args = {
      row: dr,
      col: dc,
      readOnly: dc.getReadOnly()
    }

    if (!args.readOnly &&
    this._parentRelation &&
    this._parentRelation.detailColumns.indexOf(dc.fieldName) > -1) {
      args.readOnly = true
    }

    if (!args.readOnly &&
    this.isMaster &&
    dc.isPrimaryKey &&
    dr.dataRowState !== Enums.DataRowState.ADDED) {
      args.readOnly = true
    }

    this.fire('onGetFieldReadOnly', args)
    return args.readOnly
  }

  onGetContextMenus(source) {
    const args = {
      source: source,
      items: []
    }
    this.fire('onGetContextMenus', args)
    return args.items
  }

  onGetPrintVariables() {
    const args = {
      variables: {}
    }
    this.fire('onGetPrintVariables', args)
    return args.variables
  }

  onBeforeDataSrcLoadData(data) {
    this.fire('onBeforeDataSrcLoadData', {
      data: data
    })
  }

  onAfterDataSrcLoadData(result) {
    this.fire('onAfterDataSrcLoadData', {
      result: result
    })
  }

  onSetStoredProcParas() {
    this.fire('onSetStoredProcParas', {})
  }

  /**
   * 删除行前
   * @param dr 删除行
   * @param {Function} callback 回调
   * @return ｛bool}
   */
  onRowDeleting(dr, callback) {
    const self = this
    const args = {
      dataSrc: this,
      row: dr,
      isCancel: false,
      next: (ret) => {
        callback(ret)
      }
    }
    self.fire('onRowDeleting', args)
  }

  /**
   * 删除行后处理
   * @param dr 删除行
   * @return
   */
  onRowDeleted(dr) {
  // 删除后通知
    this.fire('onRowDeleted', {
      dataSrc: this,
      row: dr
    })
  }

  onUpdateValue(dr, col) {
    this.fire('onUpdateValue', {
      row: dr,
      col: col
    })
  }

  onDataColumnValidate(dr, dc, value) {
  // 自定义校验
    const args = {
      row: dr,
      col: dc,
      value: value,
      isCancel: false
    }
    this.fire('onDataColumnValidate', args)
    return !args.isCancel
  }

  onDataRowValidate(dr) {
  // 业务类校验
    const args = {
      row: dr,
      isCancel: false,
      msg: ''
    }
    this.fire('onDataRowValidate', args)
    if (args.isCancel) {
      this.setError(args.msg)
    }
    return !args.isCancel
  }

  onGetUserRefData(row, column, data) {
    const args = {
      row: row,
      col: column,
      result: data
    }
    this.fire('onGetUserRefData', args)
    return args.result
  }

  onRowAdded(dr) {
    this.fire('onRowAdded', {
      dataSrc: this,
      row: dr
    })
  }

  onRowRemoved(dr) {
    const args = {
      dataSrc: this,
      row: dr
    }
    this.fire('onRowRemoved', args)
  }

  onBeforeDataSrcSave() {
  // 保存前操作
    const args = {
      isCancel: false
    }
    this.fire('onBeforeDataSrcSave', args)
    return !args.isCancel
  }

  onAfterDataSrcSave(result, callback) {
    if (callback instanceof Function) {
      callback(this, result)
    }

    this.fire('onAfterDataSrcSave', {
      result: result
    })
  }

  onCleared() {
    this.fire('onCleared')
  }

  onGetDefaultValue(dr, col, dfValue) {
    const args = {
      row: dr,
      col: col,
      value: dfValue
    }
    this.fire('onGetDefaultValue', args)
    return args.value
  }

  onCurrentChanged(row, oldRow) {
    const args = {
      dataSrc: this,
      oldRow: oldRow,
      newRow: row
    }
    this.fire('onCurrentChanged', args)
  }

  onValueChanged(dr, dc) {
    const args = {
      row: dr,
      col: dc
    }
    this.fire('onValueChanged', args)
  }

  onGetExportData(hasData) {
    const args = {
      hasData: hasData
    }
    this.fire('onGetExportData', args)
    return args.data
  }

  onError() {
    const args = {
      error: this._error
    }

    this.fire('onError', args)
  }
  onUpdateLayout() {
    this.fire('onUpdateLayout', null)
  }
  onCustomEvent(event, args) {
    this.fire(event, args)
  }

/** **事件-结束****/
}

Object.assign(UIObj, {
  /**
   *
   * @param {String} objId
   * @returns {UIObj}
   */
  getUIObj(objId) {
    return Dict.getUIObj(objId)
  },
  addUIObj(uiObj) {
    Dict.addUiObj(uiObj)
  },
  removeUIObj(objId) {
    Dict.removeUIObj(objId)
  },
  requestSave(params, callback) {
    if (callback && callback instanceof Function) {
      callback(true, {})
    }
  },
  requestSearch(params, callback) {
    if (callback && callback instanceof Function) {
      callback(true, {})
    }
  }
})

export default UIObj
