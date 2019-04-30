export default {
  DataRowState: {
    DETACHED: 'DETACHED',
    UNCHANGED: 'UNCHANGED',
    ADDED: 'ADDED',
    DELETED: 'DELETED',
    MODIFIED: 'MODIFIED'
  },
  DataType: {
    NUMBER: 0,
    STRING: 1,
    DATETIME: 2,
    BOOLEAN: 3
  },
  UIObjType: {
    TABLE: '0',
    VIEW: '1',
    STOREDPROC: '2'
  },
  ProcParaType: {
    NONE: 0,
    IN: 1,
    OUT: 2,
    INOUT: 3,
    RETURN: 4,
    MSG: 5,
    ERRCODE: 6,
    LOGERRMSG: 7,
    FUNCTIONRESULT: 8
  },
  RefType: {
    NONE: 0,
    ENUM: 1,
    TABLE: 2,
    PROP: 3,
    TOTAL: 4
  },
  EditStyle: {
    TEXT: 0,
    REFERENCE: 1,
    COMBOBOX: 2,
    CHECKBOX: 3,
    DATETIME: 4,
    DATE: 5,
    TIME: 6,
    BUTTON: 7,
    LINK: 8,
    BIGTEXT: 9,
    PASSWORD: 10,
    NUMBER: 11,
    AUTOCOMPLETE: 12
  },
  DispPosition: {
    ALL: 0,
    BROWSER: 1,
    EDIT: 2,
    NONE: 3
  },
  StatType: {
    NONE: '0',
    TOTAL: '1',
    AVG: '2',
    MAX: '3',
    MIN: '4'
  },
  CollectionChangedAction: {
    ADD: 1,
    REMOVE: 2,
    REPLACE: 3,
    MOVE: 4,
    RESET: 5
  },
  OpCode: {
    ADD: 'add',
    EDIT: 'edit',
    DEL: 'delete',
    BACK: 'prev',
    FORWARD: 'next',
    REFRESH: 'refresh',
    LIST: 'list',
    DETAIL: 'detail',
    SAVE: 'save',
    CANCEL: 'cancel',
    CHILD: 'child'
  }
}

export function getEnums(enumType) {
  return {
    enumType: 'abc',
    enumName: 'ABC',
    hint: '',
    values: []
  }
}
