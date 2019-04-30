export const ID_PROPERTY = '$id'
export const ROW_SELECT_COLNAME = '$is_sel'
export const hasValue = (o) => {
  if (o !== 0 && !o) {
    return false
  }
  return true
}

export const format = (msg, ...args) => {
  if (args.length === 0) {
    return msg
  } else {
    return msg.replace(/\{(\d+)\}/g, function(m, i) {
      return args[parseInt(i)]
    })
  }
}

export const toStrLines = arr => {
  const msgs = []
  for (let i = 0, len = arr.length; i < len; i++) {
    const elem = arr[i]
    if (msgs.indexOf(elem) === -1) {
      msgs.push(elem)
    }
  }
  return arr.join('<br>').replace(/\n/g, '<br>')
}

/**
 * 序列化对象
 * @param {UIObj} uiObj
 * @param {Boolean} onlyCur
 */
export const serialize = (uiObj, onlyCur) => {
  const data = {
    uiObjCode: uiObj.uiObjCode,
    uiObjName: uiObj.uiObjName,
    isMaster: uiObj.isMaster,
    fieldList: [],
    forPrint: []
  }

  for (let i = 0; i < uiObj.columns.length; i++) {
    const col = uiObj.columns[i]
    data.fieldList.push({
      fieldName: col.fieldName,
      fieldDes: col.dispName,
      dataType: col.dataType,
      dataWidth: col.dataWidth,
      dataDec: col.dataDec
    })
  }

  if (onlyCur) {
    if (uiObj.currentRow) {
      data.forPrint.push(uiObj.currentRow.getData())
    }
  } else {
    for (let k = 0; k < uiObj.rows.length; k++) {
      const row = uiObj.rows[k]
      data.forPrint.push(row.getData())
    }
  }

  return data
}

/**
   * 获取字符串字节长度
   * @param str
   * @returns {number}
   */
export const getLength = (str) => {
  if (str === null || str === undefined) return 0
  const [...arr] = str
  return arr.length
}

export const getScaleLength = (str) => {
  if (!str) {
    return 0
  }

  const dotIndex = str.indexOf('.')
  const len = str.length
  return dotIndex > 0 ? len - dotIndex - 1 : 0
}

export const getIntegerLength = (str) => {
  if (!str) {
    return 0
  }

  const dotIndex = str.indexOf('.')
  const len = str.length
  return dotIndex > 0 ? dotIndex : len
}

export const Convert = {
  toString: function(val) {
    if (!val && val !== 0) {
      return null
    }
    return val.toString()
  },
  toNString: function(val) {
    if (!val && val !== 0) {
      return ''
    }
    return val.toString()
  },
  toDate: function(val) {
    if (!val && val !== 0) {
      return null
    }

    if (typeof val === 'number') {
      return new Date(val)
    }

    if (typeof val === 'string') {
      var value = Date.parse(val)
      return isNaN(value) ? null : new Date(value)
    }

    return null
  },
  toInt: function(val) {
    if (!val && val !== 0) {
      return 0
    }
    var value = Number.parseInt(val)
    return isNaN(value) ? 0 : value
  },
  toFloat: function(val) {
    if (!val && val !== 0) {
      return 0.0
    }

    var value = Number.parseFloat(val)
    return isNaN(value) ? 0 : value
  },
  toBoolean(val) {
    return val === 't' || val === 1 || val === 'true' || val === 'T' || val === 'TRUE' || val === true
  }
}

export function eventuality(self) {
  var registry = {}
  self.fire = function(event, args) {
    const type = typeof event === 'string' ? event : event.type

    if (registry.hasOwnProperty(type)) {
      const array = registry[type]
      for (let i = 0; i < array.length; i++) {
        const handler = array[i]
        let func = handler.method
        if (typeof func === 'string') {
          func = this[func]
        }

        func.apply(this, args ? [self, args] : [self, {}])
      }
    }

    return this
  }

  self.on = function(type, method) {
    const handler = {
      method: method
    }

    if (registry.hasOwnProperty(type)) {
      registry[type].push(handler)
    } else {
      registry[type] = [handler]
    }
    return this
  }

  self.un = function(type, method) {
    let array
    let index = -1
    if (registry.hasOwnProperty(type)) {
      array = registry[type]
      for (var i = 0; i < array.length; i++) {
        const handler = array[i]
        let func = handler.method
        if (typeof func === 'string') {
          func = this[func]
        }

        if (func === method) {
          index = i
          break
        }
      }

      if (index >= 0) {
        array.splice(index, 1)
      }
    }
  }

  self.dispose = function() {
    registry = null
    delete self.on
    delete self.un
    delete self.fire
  }

  return self
}

export const BigNumber = {
  /**
   * 加法函数，用来得到精确的加法结果
   * javascript的加法结果会有误差，在两个浮点数相加的时候会比较明显。这个函数返回较为精确的加法结果
   * @param {*} arg1
   * @param {*} arg2
   */
  add(arg1, arg2) {
    var r1, r2, m, c
    try {
      r1 = arg1.toString().split('.')[1].length
    } catch (e) {
      r1 = 0
    }
    try {
      r2 = arg2.toString().split('.')[1].length
    } catch (e) {
      r2 = 0
    }
    c = Math.abs(r1 - r2)
    m = Math.pow(10, Math.max(r1, r2))
    if (c > 0) {
      var cm = Math.pow(10, c)
      if (r1 > r2) {
        arg1 = Number(arg1.toString().replace('.', ''))
        arg2 = Number(arg2.toString().replace('.', '')) * cm
      } else {
        arg1 = Number(arg1.toString().replace('.', '')) * cm
        arg2 = Number(arg2.toString().replace('.', ''))
      }
    } else {
      arg1 = Number(arg1.toString().replace('.', ''))
      arg2 = Number(arg2.toString().replace('.', ''))
    }
    return (arg1 + arg2) / m
  },
  /**
   * 减法函数，用来得到精确的减法结果
   * javascript的减法结果会有误差，在两个浮点数相减的时候会比较明显。这个函数返回较为精确的减法结果
   * @param {*} arg1
   * @param {*} arg2
   */
  sub(arg1, arg2) {
    var r1, r2, m, n
    try {
      r1 = arg1.toString().split('.')[1].length
    } catch (e) {
      r1 = 0
    }
    try {
      r2 = arg2.toString().split('.')[1].length
    } catch (e) {
      r2 = 0
    }
    m = Math.pow(10, Math.max(r1, r2)) // last modify by deeka //动态控制精度长度
    n = (r1 >= r2) ? r1 : r2
    return ((arg1 * m - arg2 * m) / m).toFixed(n)
  },
  /**
   * 乘法函数，用来得到精确的乘法结果
   * javascript的乘法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的乘法结果
   * @param {*} arg1
   * @param {*} arg2
   */
  mul(arg1, arg2) {
    let m = 0
    const s1 = arg1.toString()
    const s2 = arg2.toString()
    try {
      m += s1.split('.')[1].length
    } catch (e) {
      console.log(e)
    }

    try {
      m += s2.split('.')[1].length
    } catch (e) {
      console.log(e)
    }
    return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m)
  },
  /**
   * 除法函数，用来得到精确的除法结果
   * javascript的除法结果会有误差，在两个浮点数相除的时候会比较明显。这个函数返回较为精确的除法结果
   * @param {*} arg1
   * @param {*} arg2
   */
  div(arg1, arg2) {
    let t1 = 0
    let t2 = 0
    try {
      t1 = arg1.toString().split('.')[1].length
    } catch (e) {
      console.log(e)
    }
    try {
      t2 = arg2.toString().split('.')[1].length
    } catch (e) {
      console.log(e)
    }
    const r1 = Number(arg1.toString().replace('.', ''))
    const r2 = Number(arg2.toString().replace('.', ''))
    return (r1 / r2) * Math.pow(10, t2 - t1)
  }
}
