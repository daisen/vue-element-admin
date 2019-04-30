export default function fetchMenus() {
  const asyncRouterMap = [
    {
      path: '/system',
      meta: { roles: ['admin'] },
      children: [{
        path: 'user',
        component: 'system/user',
        name: 'user',
        meta: {
          title: '用户管理',
          icon: 'lock',
          roles: ['admin']
        }
      }, {
        path: 'role',
        component: 'system/role',
        name: 'role',
        meta: {
          title: '角色管理',
          icon: 'lock',
          roles: ['admin']
        }
      }, {
        path: 'org',
        component: 'system/org',
        name: 'org',
        meta: {
          title: '组织管理',
          icon: 'lock',
          roles: ['admin']
        }
      }, {
        path: 'menu',
        component: 'system/menu',
        name: 'menu',
        meta: {
          title: '菜单管理',
          icon: 'lock',
          roles: ['admin']
        }
      }]
    },

    {
      path: '/dict',

      children: [{
        path: 'uiobj',
        component: 'dict/uiobj',
        name: 'uiobj',
        meta: { title: '界面对象', icon: 'icon', roles: ['admin'] }
      }, {
        path: 'dataobj',
        component: 'dict/dataobj',
        name: 'dataobj',
        meta: { title: '数据对象', icon: 'icon', roles: ['admin'] }
      }]
    },
    { path: '*', redirect: '/404', hidden: true }
  ]
  return asyncRouterMap
}
