const editors = ['text-editor', 'reference-editor', 'combo-box-editor', 'check-box-editor',
  'date-time-editor', 'date-editor', 'time-editor', 'button-editor', 'link-editor', 'big-text-editor', 'password-editor', 'number-editor', 'text-editor']
export function getEditor(col) {
  return editors[col.editStyle]
}
