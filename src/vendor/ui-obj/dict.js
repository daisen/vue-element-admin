const Dict = {
  uiObjMap: {
  },
  getUIObj(objId) {
    return this.uiObjMap[objId]
  },
  addUiObj(uiObj) {
    this.uiObjMap[uiObj.objId] = uiObj
  },
  removeUIObj(objId) {
    delete this.uiObjMap[objId]
  }
}

export default Dict
