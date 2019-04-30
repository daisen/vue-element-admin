import Enums from './enums'

import UIColumn from './UIColumn'
import UIObj from './UIObj'
import { Convert } from './util'

// ///////////////////////////////////////////////////////////////
// /主从关系类

class UIRelation {
  /**
     * 主从关系类
     * @param {DataSource} master           [description]
     * @param {DataSource} detail           [description]
     * @param {String} masterColunmsStr [description]
     * @param {String} detailColumnsStr [description]
     */
  constructor(masterId, detailId, masterColunmsStr, detailColumnsStr) {
    const self = this
    const masterColunms = typeof masterColunmsStr === 'string' ? masterColunmsStr.split(',') : null
    const detailColumns = typeof detailColumnsStr === 'string' ? detailColumnsStr.split(',') : null
    if (!masterColunms || !detailColumns || masterColunms.length !== detailColumns.length) {
      throw new Error(`ui relation require master columns size equal detail columns size`)
    }
    this.masterId = masterId
    this.detailId = detailId
    this.masterColunms = masterColunms
    this.detailColumns = detailColumns

    // 检查子表合计
    this._totalMap = {}
    this.getMaster().columns.forEach(function(col) {
      if (col.refType === Enums.RefType.TOTAL && col.refObj === self.detailId.uiObjCode) {
        self._totalMap[col.refField] = col.fieldName
      }
    })
  }

  getMaster() {
    return UIObj.getUIObj(this.masterId)
  }

  getDetail() {
    return UIObj.getUIObj(this.detailId)
  }
  /**
       * 获取主从关系
       * @return {[type]} [description]
       */
  getSchema() {
    const schema = {
      masterKey: this.masterColunms.toString(),
      detailKey: this.detailColumns.toString(),
      uiObjId: this.detailId
    }
    return schema
  }

  /**
       * 获取从表约束
       * @param  {[type]} dr [description]
       * @return {[type]}    [description]
       */
  getParams(dr) {
    const p = {}
    for (let i = 0; i < this.detailColumns.length; i++) {
      const col = this.detailColumns[i]
      p[col] = dr[this.masterColunms[i]]
    }
    return p
  }

  /**
       * 获取从表对应值
       * @return {[type]} [description]
       */
  getDetailValue(detailCol) {
    if (typeof detailCol !== 'string') {
      detailCol = detailCol.fieldName
    }

    // 检查是否是关系键
    const index = this.detailColumns.indexOf(detailCol)
    if (index < 0) {
      return null
    }

    // 检查主表当前行是否为空
    if (!this.getMaster().currentRow) {
      return null
    }
    return this.getMaster().currentRow[this.masterColunms[index]]
  }

  updateRelationValue(dr) {
    if (dr.dataSrc !== this.getMaster()) {
      return
    }

    for (let j = 0, len = this.getDetail().rows.length; j < len; j++) {
      const row = this.getDetail().rows[j]
      for (let i = 0; i < this.detailColumns.length; i++) {
        const detailCol = this.detailColumns[i]
        const masterCol = this.masterColunms[i]
        row.setColumnText(detailCol, dr[masterCol])
      }
    }
  }

  /**
       * 字表合计
       * @param {String|UIColumn} detailColName
       */
  aggregateDetail(detailColName) {
    try {
      if (detailColName instanceof UIColumn) {
        detailColName = detailColName.fieldName
      }

      const masterColName = this._totalMap[detailColName]
      if (!masterColName) {
        return
      }
      const curRow = this.getMaster().currentRow
      if (curRow) {
        curRow.setColumnText(masterColName, this.getTotalValue(detailColName))
      }
    } catch (ex) {
      console.log(ex)
    }
  }

  /**
       * 获取明细的合计值
       * @param {String} colName
       */
  getTotalValue(colName) {
    // 遍历明细，赋值，以最后一个为准
    let result = 0
    const detail = UIObj.getUIObj(this.detailId)
    detail.rows.forEach(function(row) {
      result = result.add(Convert.toFloat(row[colName]))
    })
    return result
  }
}

export default UIRelation
