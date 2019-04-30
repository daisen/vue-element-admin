
const msgs = {
  zh: {
    ACC_CONFIRM: '确认进行记账处理？',
    ACC_BATCH_TIP: '批量记账结束，成功{0}条,失败{1}条。',
    ACC_NO_MESSAGE: '记账失败，但无法确定原因，请联系管理员。',
    ACC_BATCH_BREAK: '记账中断，请稍后再试。',
    ACC_SUCCESS: '记账成功。',

    BIZ_DAO_NEEDARRAY: 'dataSet必须是数组',
    BIZ_PRECISION_OUT: '【{0}】小数不允许超过{1}位,请修改',

    COL_NOT_FOUND: '列未定义',
    CLOSE_CURRENT_TAB: '关闭当前标签',
    CLOSE_OTHER_TABS: '关闭其他标签',
    CLOSE_ALL_TABS: '关闭所有标签',

    DELETE_NOROW: '删除操作无法完成，当前行不存在',
    DELETE_CONFIRM: '确定要删除当前数据？',
    DELETEALL_CONFIRM: '确定要删除所有行数据？',
    DS_REQUIREDETAIL: '{0}中没有录入数据，不允许保存。',

    EXCEPTION_THROW: '发生异常：',
    EXCEPTION_PAGEMD_NODETAIL: '模板需要提供从表信息',
    EXCEPTION_PAGEMD_NODETAILDETAIL: '模板需要提供从从表信息',
    EXPORT_SUCCESS: '数据导出已完成,请注意保存文件',
    EMPTY_ORGS: '无组织',

    GETSYSDATE_FAILD: '获取服务器时间失败',
    GRID_EDITLIMIT_FORBIDDEN: '【{0}】为空，不允许编辑明细。',

    LOCAL_OPTION_FAILURE: '本地选项加载失败，可能导致某些业务无法正常进行',
    LINE: '行',

    MASTERDETAIL_KEYERR: '主从关系键错误定义',
    METHOD_NOT_FOUND: '方法未定义',
    MULTIFIELD_MISS: '无法找到相应的重复字段',
    MESSAGER_TIP: '提示',
    MESSAGER_CONFIRM: '确认',
    MESSAGER_ERR: '错误',
    MESSAGER_WARNING: '警告',

    NONE_ENUM: '枚举值未能找到',
    NONE_REFDATA: '参照无数据',
    NET_NO_DATA: '未知错误',
    NET_ERROR: '网络错误',

    PROC_NO_DATA: '存储过程不需要数据脚本',
    PRINT_NO_DATA: '没有找到需要打印的数据，请勾选后再重试',

    SEARCH_MASTER_ROW_ERROR: '错误的主表行',
    SEARCH_ERROR_DETAIL: '明细表类型错误',

    UPDATEROW_ERR: '更新行数据失败，请检查数据库或者主键',
    UIOBJ_NOT_SELECT: '请先选择一个界面对象。',

    VALIDATE_REQUIRED: '该字段为必填项',
    VALUE_REQUIRE: '【{0}】不允许为空。',
    VALIDATE_LENGTH: '【{0}】不允许超过{1}个字',
    VALIDATE_LENGTH_NUM: '【{0}】整数部分不允许超过{1}位,小数部分不允许超过{2}位',
    VALIDATE_TYPE: '【{1}】不是【{0}】要求的类型',
    VALIDTE_STRICTREF: '【{1}】不在【{0}】的录入范围内',
    VAILIDATE_RULE: '【{1}】不符合【{0}】的录入规则',

    DATERANGE: '时间段：',
    TODAY: '今天',
    TOMORROW: '明天',
    YESTERDAY: '昨天',
    DAYBEFOREYESTERDAY: '前天',
    THISWEEK: '本周',
    LASTWEEK: '上周',
    THISMONTH: '本月',
    LASTMONTH: '上月',
    THISQUARTER: '本季度',
    LASTQUARTER: '上季度',
    THISYEAR: '本年度',
    LASTYEAR: '上年度',
    YEARTODATE: '全部',
    EMPTY: '<空>'
  }
}

export function getMessage(key) {
  return msgs.zh[key]
}

export default msgs.zh
