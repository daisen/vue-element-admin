import { UIObj, Enums } from 'dict'

export const methods = {
  bindUIObj() {
    if (this.objId !== 0 && !this.objId) {
      throw new Error('editor prop objId is illegal')
    }
    const uiObj = UIObj.getUIObj(this.objId)
    if (!uiObj) {
      throw new Error('uiobj is null')
    }
    this.bindColumn = uiObj.getColumn(this.column)

    if (this.isQuery) {
      this.readonly = false
      this.editable = true

      uiObj.on('onGetQueryParams', (target, e) => {
        e[this.bindColumn.fieldName] = this.value
      })

      this.displayClass['dict-editor-display-text'] = false
      return
    }

    this.bindRow = this.row
    if (this.bindRow) {
      this.value = this.bindRow.getColumnValue(this.bindColumn)
      this.text = this.bindRow.getColumnText(this.bindColumn)
    }

    this.readonly = this.bindColumn.getReadonly()
    this.bindColumn.on('onPropertyChanged', (target, prop) => {
      this.readonly = target.isReadOnly()
    })

    uiObj.on('onValueChanged', (target, args) => {
      if (args.row === this.bindRow && args.col === this.bindColumn) {
        this.value = this.bindRow.getColumnValue(args.col)
        this.text = this.bindRow.getColumnText(args.col)
      }
    })

    uiObj.on('onPropertyChanged', (target, e) => {
      if (e.propertyName === 'Editable') {
        this.editable = target.getEditable()
      }
    })

    uiObj.on('onBeforeDataSrcSave', (target, e) => {
      if (this.bindRow) {
        this.bindRow.validator(this.bindColumn, this.value)
      }
    })

    uiObj.on('onCollectChanged', (target, e) => {
      if (this.bindRow && this.bindColumn) {
        if (e.action === Enums.CollectionChangedAction.REPLACE ||
          e.action === Enums.CollectionChangedAction.RESET) {
          this.value = this.bindRow.getColumnValue(this.bindColumn)
          this.text = this.bindRow.getColumnText(this.bindColumn)
        }
      }
    })

    if (this.isGrid) {
      this.displayClass['dict-editor-display-text'] = false
      return
    }

    if (this.isPanel) {
      this.displayClass['dict-editor-display-text'] = true
      uiObj.on('onCurrentChanged', (target, args) => {
        this.bindRow = args.newRow
        if (this.bindRow) {
          this.value = this.bindRow.getColumnValue(this.bindColumn)
          this.text = this.bindRow.getColumnText(this.bindColumn)
        } else {
          this.value = null
          this.text = null
        }
      })
    }
  },
  validate() {
    if (this.bindRow) {
      const valid = this.bindRow.validator(this.bindColumn, this.value)
      if (!valid) {
        this.$emit('onError', this.bindColumn.fieldName, this.bindRow.getColumnError(this.bindColumn))
      }
    }
  }
}

export const props = {
  objId: {
    type: Number
  },
  column: {
    type: String
  },
  row: Object,
  isQuery: {
    type: Boolean,
    default: false
  },
  isGrid: {
    type: Boolean,
    default: false
  },
  isPanel: {
    type: Boolean,
    default: true
  }
}

export const data = {
  readonly: true,
  editable: false,
  bindColumn: {},
  bindRow: {},
  value: null,
  text: null,
  displayClass: {
    'dict-editor-display-text': true
  }
}
