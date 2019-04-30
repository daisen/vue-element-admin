import request from '@/utils/request'

export function fetchMenus() {
  return request({
    url: '/system/menus',
    method: 'post',
    params: null
  })
}
