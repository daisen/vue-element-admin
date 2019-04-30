import Enums from './enums'
import { ID_PROPERTY, format, hasValue } from './util'
import _ from 'underscore'
import { getMessage } from './local'
import Dict from './dict'

/**
   * 数据行，用于界面对象存放数据
   * @param {String} objId   对象ID
   * @param {Boolean} nodefault 是否处理默认值
   */
class UIRow {
  constructor(objId, nodefault) {
    this._isDataRow = true
    this._objId = objId instanceof Object ? objId.objId : objId
    this.dataRowState = Enums.DataRowState.DETACHED
    this._origin = {}
    this._updating = false
    this._valueLocking = {}
    this[ID_PROPERTY] = Date.now()
    this._editable = false
    this._errors = {
      data: [],
      // 获取列错误
      getError(colName) {
        const len = this.data.length
        for (let i = 0; i < len; i++) {
          if (this.data[i].column === colName) {
            return this.data[i].errMsg
          }
        }
        return null
      },
      // 设置列错误
      setError(colName, value) {
        let index = -1
        const len = this.data.length

        for (let i = 0; i < len; i++) {
          if (this.data[i].column === colName) {
            index = i
            break
          }
        }

        if (index < 0) {
          const err = {
            column: colName,
            errMsg: value,
            id: colName + Date.now()
          }
          this.data.push(err)
        } else {
          this.data[index].id = colName + Date.now()
          this.data[index].errMsg = value
        }
      },
      // 清空错误
      clearError: function(colName) {
        let index = -1
        const len = this.data.length

        for (let i = 0; i < len; i++) {
          if (this.data[i].column === colName) {
            index = i
            break
          }
        }

        if (index >= 0) {
          this.data.splice(index, 1)
        }
      },
      // 清空所有错误
      clearAll: function() {
        this.data = []
      },
      // 获取错误数
      getLength: function() {
        return this.data.length
      },
      /**
             *  检查当前错误集合是否已经减少
             * @param errs 旧错误集合
             * @returns {boolean}
             */
      less: function(errs) {
        if (this.getLength() === 0) {
          return true
        }

        if (errs.getLength() < this.getLength()) {
          return false
        } else if (errs.getLength() === this.getLength()) {
          for (let i = 0; i < this.data.length; i++) {
            const err = this.data[i]
            const err1 = errs.data[i]
            if (err.id !== err1.id) {
              return false
            }
          }
        } else {
          for (let i = 0; i < this.data.length; i++) {
            const err = this.data[i]
            let hit = false
            // 检测是否能在errs找到原错误，找到则继续查找下一个错误
            for (let j = 0; j < errs.data.length; j++) {
              if (errs.data[j].id === err.id) {
                hit = true
                break
              }
            }

            // 找不到错误，则认为错误发生了变化
            if (!hit) {
              return false
            }
          }
        }

        return true
      }
    }

    this.init(nodefault)
  }

  getEditable() {
    return this._editable
  }

  getUIObj() {
    return Dict.getUIObj(this._objId)
  }
  clone() {
    const { ...newRow } = this
    return newRow
  }
  /**
     * 比较r是否是当前行
     * @param  {[type]} r [description]
     * @return {[type]}   [description]
     */
  equals(r) {
    return this === r
  }

  /**
     * 初始化数据源，默认根据列数生成属性
     * @param  {[type]} nodefault [description]
     * @return {[type]}           [description]
     */
  init(nodefault) {
    if (nodefault) {
      for (let i = 0; i < this.getUIObj().columns.length; i++) {
        const col = this.getUIObj().columns[i]
        this[col.fieldName] = null
      }
    } else {
      this.setDefaultValue()
    }
  }

  beginUpdate() {
    this._updating = true
  }

  endUpdate() {
    this._updating = false
  }

  /**
     * 设置默认值
     */
  setDefaultValue() {
    for (let i = 0; i < this.getUIObj().columns.length; i++) {
      const col = this.getUIObj().columns[i]
      this[col.fieldName] = null
    }

    for (let i = 0; i < this.getUIObj().columns.length; i++) {
      const col = this.getUIObj().columns[i]
      // 获取默认值，会经过业务类的处理
      const dfValue = this.getUIObj().getDefaultValue(this, col)
      if (dfValue || dfValue === 0) {
        this.setColumnText(col, dfValue)
      }
    }
  }

  /**
     * 加载数据，数据来自于data，通常是服务获取来的数据
     * @param  {UIRow|Object} data 数据
     * @return {[type]}      [description]
     */
  loadData(data) {
    const self = this

    // 服务器返回的数据，列名都是小写
    for (let j = 0; j < self.getUIObj().columns.length; j++) {
      const col = self.getUIObj().columns[j]
      if (data.hasOwnProperty(col.fieldName.toLowerCase())) {
        self[col.fieldName] = col.getValue(data[col.fieldName.toLowerCase()])
      }

      if (data.hasOwnProperty(col.fieldName.toLowerCase() + '$')) {
        self[col.fieldName + '$'] = data[col.fieldName.toLowerCase() + '$']
      }

      if (data.hasOwnProperty(col.fieldName)) {
        self[col.fieldName] = col.getValue(data[col.fieldName])
      }

      if (data.hasOwnProperty(col.fieldName + '$')) {
        self[col.fieldName + '$'] = data[col.fieldName + '$']
      }
    }

    return this
  }

  /**
     * 接受当前对行的增加、修改
     * @return {UIRow}
     */
  acceptChanges() {
    // 接受操作，具体内容：
    // 1、修改行状态为UNCHANGED无修改状态
    // 2、备份数据，作为原始数据
    // 3、删除行做accept没有意义
    if (this.dataRowState === Enums.DataRowState.DELETED) {
      return this
    }
    this.dataRowState = Enums.DataRowState.UNCHANGED

    this._origin = {}
    for (let i = 0; i < this.getUIObj().columns.length; i++) {
      const c = this.getUIObj().columns[i]
      this._origin[c.fieldName] = this[c.fieldName]
      this._origin[c.fieldName + '$'] = this[c.fieldName + '$']
    }
    return this
  }

  /**
     * 丢弃
     * @return {[type]} [description]
     */
  rejectChanges() {
    // 丢弃修改
    // 放弃所有的修改，只对修改行有用
    if (this.dataRowState !== Enums.DataRowState.UNCHANGED) {
      this.dataRowState = Enums.DataRowState.UNCHANGED
      for (let i = 0; i < this.getUIObj().columns.length; i++) {
        const c = this.getUIObj().columns[i]
        this[c.fieldName] = this._origin[c.fieldName]
        this[c.fieldName + '$'] = this._origin[c.fieldName + '$']
      }
    }

    this._errors.clearAll()
    return this
  }

  beginTransaction() {
    if (!this.transData) {
      this.transData = _.extend({}, this)
      return 0
    }
    return 1
  }

  commit(id) {
    if (id === 0) {
      this.transData = null
    }
  }

  rollBack(id) {
    if (id !== 0) {
      return
    }

    // 丢弃修改
    // 放弃某个节点之后的修改
    const originRow = this.transData
    for (let i = 0; i < this.getUIObj().columns.length; i++) {
      const c = this.getUIObj().columns[i]
      this[c.fieldName] = originRow[c.fieldName]
      this[c.fieldName + '$'] = originRow[c.fieldName + '$']
    }
    this._errors = originRow._errors
    this.dataRowState = originRow.dataRowState
    this.getUIObj().onCollectChanged(Enums.CollectionChangedAction.REPLACE, this)
    this.transData = null
    return this
  }

  /**
     * 获取行上某列的错误信息
     * @param  {String} colName 列名
     * @return {[type]}         [description]
     */
  getColumnError(colName) {
    if (typeof colName === 'object') {
      colName = colName.fieldName
    }
    return this._errors.getError(colName)
  }

  /**
     * 设置行上某列的错误信息
     * @param {[type]} colName [description]
     * @param {[type]} errMsg  [description]
     */
  setColumnError(colName, errMsg) {
    // 赋值错误也作为行修改的标识
    if (this.dataRowState === Enums.DataRowState.UNCHANGED) {
      this.dataRowState = Enums.DataRowState.MODIFIED
    }

    if (typeof colName === 'object') {
      colName = colName.fieldName
    }

    console.log(errMsg)
    this._errors.setError(colName, errMsg)
    return this
  }

  /**
     * 清除行上某列的错误
     * @param  {[type]} colName [description]
     * @return {[type]}         [description]
     */
  clearColumnError(colName) {
    if (typeof colName === 'object') {
      colName = colName.fieldName
    }
    this._errors.clearError(colName)
  }

  /**
     * 获取行上是否存在错误
     * @return {Boolean} [description]
     */
  hasError() {
    return this._errors.getLength() > 0
  }

  /**
     * 设置列值，不会触发校验，仍然触发值改变通知
     * @param {String} col   [description]
     * @param {Object} value [description]
     */
  setColumnValue(col, value) {
    const dc = this.getUIObj().getColumn(col)

    if (dc === null) {
      console.log(`column ${col} not found`)
      return
    }

    // 修改状态， 还原状态，通知内容修改
    this[dc.fieldName] = value
    this.clearColumnError(dc)
    if (this.dataRowState === Enums.DataRowState.UNCHANGED) {
      this.dataRowState = Enums.DataRowState.MODIFIED
    }
    this.getUIObj().onValueChanged(this, dc)
    return this
  }

  /**
     * 设置列的参照名称
     * @param {[type]} col      列名或者列
     * @param {string} refValue 参照名称
     */
  setColumnRefValue(col, refValue) {
    const dc = this.getUIObj().getColumn(col)

    if (dc === null) {
      console.log`column ${col} not found`
    }

    this[dc.fieldName + '$'] = refValue
    return this
  }

  /**
     * 判断值改变
     * @param newValue 新值
     * @param oldValue 旧值
     */
  isValueChanged(newValue, oldValue) {
    if (newValue === oldValue) {
      return false
    }

    if (newValue === null && oldValue === '') {
      return false
    }

    if (oldValue === null && newValue === '') {
      return false
    }

    return true
  }

  /**
     * 检查器，完成值校验、赋值、赋值后处理
     * @param  {UIColumn} col   [description]
     * @param  {Object} value [description]
     * @return {Boolean}       [description]
     */
  validator(col, value, callback) {
    if (typeof col === 'string') {
      col = this.getUIObj().getColumn(col)
    }

    try {
      // 检查值是否锁定，锁定则退出
      const lock = this._valueLocking[col.fieldName]
      if (lock) return true
      this._valueLocking[col.fieldName] = true

      // 获取需要保存的值，如果未改变则退出
      value = col.getValue(value)
      const err = this.getColumnError(col)
      if (!err && !this.isValueChanged(value, this.getColumnValue(col))) {
        return true
      }

      // 基本校验，包括参照内容的获取
      const bRet = this.getUIObj().validateColumn(this, col, value)
      if (bRet) {
        // 赋值以及相关值
        return this.calcColumnValue(col, value)
      }

      return false
    } finally {
      delete this._valueLocking[col.fieldName]
    }
  }

  /**
     * 处理与col列相关联的列的值
     * @param  {UIColumn} col
     * @param {Object} value 新值
     * @return {Boolean}     [description]
     */
  calcColumnValue(col, value) {
    let id = 0
    try {
      id = this.beginTransaction()

      // 参照值
      col.setRefValue(this, value)
      // 带出其他字段
      this.setColumnValue(col, value)

      let isOk = true
      // 关联参照，处理属性参照和属性参照的表参照
      if (col.isTableRef()) {
        for (let i = 0; i < this.getUIObj().columns.length; i++) {
          const c = this.getUIObj().columns[i]

          // 处理属性参照
          // 或处理属性参照的表参照
          if ((c.refType === Enums.RefType.PROP && c.refObj === col.fieldName) ||
            (col.refType === Enums.RefType.PROP && col.refObj === c.fieldName)) {
            const value = col.getRefValue(c.refField)
            c.setRefData(col.getRefData())
            c.setRefItem(col.getRefItem())
            this.setColumnText(c, value)
            const err = this.getColumnError(c)
            if (err) {
              isOk = false
              break
            }
          }
        }
      }

      if (!isOk) {
        // 回滚
        this.rollBack(id)
        return false
      }
      this.getUIObj().onFieldChanged(this, col)
      if (!this._errors.less(this.transData._errors)) {
        const colErr = this.getColumnError(col)
        this.rollBack(id)
        if (colErr) {
          this.setColumnError(col, colErr, true)
        }
        return false
      }

      this.commit(id)
      this.getUIObj().updateParent(col)
      return true
    } catch (ex) {
      this.setColumnError(col, ex.toString())
      this.rollBack(id)
      return false
    }
  }

  /**
     * 设置校验值，触发业务校验，通知界面更新
     * @param {String|UIColumn} col
     * @param {Object} value
     */
  setColumnText(col, value) {
    if (typeof col === 'string') {
      col = this.getUIObj().getColumn(col)
    }
    if (!col) {
      console.log(`column ${col} not found`)
      return false
    }
    return this.validator(col, value)
  }

  /**
     * 获取列显示值
     * @param  {UIColumn} col ，支持列名
     * @return {String}     code-name
     */
  getColumnText(col) {
    if (typeof col === 'string') {
      col = this.getUIObj().getColumn(col)
      if (col === null) {
        return ''
      }
    }

    return col.getText(this)
  }

  /**
     * 获取列值
     * @param  {String} col 列名
     * @return {[type]}     [description]
     */
  getColumnValue(col) {
    return typeof col === 'string' ? this[col] : this[col.fieldName]
  }

  /**
     * 删除该行
     * @param needConfirm 是否需要询问
     */
  delete(needConfirm) {
    return this.getUIObj().deleteRow(this, needConfirm)
  }

  /**
     * 获取带有行原始值的数据对象，不会带有方法
     * @return {type}
     */
  getData() {
    const data = {}
    for (let i = 0; i < this.getUIObj().columns.length; i++) {
      const col = this.getUIObj().columns[i]
      data[col.fieldName] = this[col.fieldName]
      data['old_' + col.fieldName] = this._origin[col.fieldName]
      data['$state'] = this.dataRowState
    }
    return data
  }

  /**
     * 行校验
     * @param {Function} onerror 错误回调
     * @return {boolean} 是否通过
     */
  validate(onerror) {
    return this.getUIObj().validateDataRow(this, onerror)
  }

  /**
     * 检查必填字段
     * @return {boolean} 是否通过
     */
  checkRequired() {
    for (let i = 0; i < this.getUIObj().columns.length; i++) {
      const col = this.getUIObj().columns[i]
      if (col.isRequired && (this[col.fieldName] === null || this[col.fieldName] === '')) {
        this.setColumnError(format(getMessage('VALUE_REQUIRE'), col.dispName))
      }
    }
    return !this.hasError()
  }

  /**
     * 获取行上所有错误的文本信息
     * @return {string}
     */
  getErrors() {
    let msg = ''
    for (let i = 0; i < this._errors.data.length; i++) {
      const err = this._errors.data[i].errMsg
      msg = msg + err + '\n'
    }
    return msg
  }

  /**
     * 获取该行上对应于某列的显示格式，通常用于网格使用
     * @param  {UIColumn} col
     * @return {All}
     */
  getFormatter(col) {
    return this.getUIObj().onGetRowFormatter(this, col)
  }

  isEmpty() {
    for (let i = 0; i < this.getUIObj().columns.length; i++) {
      const col = this.getUIObj().columns[i]
      if (col.isEmptyField && !hasValue(this[col.fieldName])) {
        return true
      }
    }

    return false
  }
}

export default UIRow
