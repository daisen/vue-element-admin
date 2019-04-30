import request from '@/utils/request'

export function fetchMenuDict(menuId) {
  return request({
    url: '/dict/menu',
    method: 'post',
    data: {
      menuId
    }
  })
}

export function searchObjData(query) {
  return request({
    url: '/dict/search',
    method: 'post',
    data: query
  })
}

export function saveObjData(data) {
  return request({
    url: '/dict/save',
    method: 'post',
    data
  })
}
