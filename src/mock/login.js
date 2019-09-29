// import { param2Obj } from '@/utils'

// const userMap = {
  // admin: {
  //   roles: ['admin'],
  //   token: 'admin',
  //   introduction: '我是超级管理员',
  //   avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
  //   name: 'Super Admin'
  // },
  // editor: {
  //   roles: ['editor'],
  //   token: 'editor',
  //   introduction: '我是编辑',
  //   avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
  //   name: 'Normal Editor'
  // }
// }

export default {
  // login: config => {
  //   const { username } = JSON.parse(config.body)
  //   return userMap[username]
  // },
  login: config => {
    const data = JSON.parse(config.body);
    let userList = {}
    if (data.username === 'admin') {
      userList = {
        // token:'admin',
        // name:'管理员',
        roles: ['admin'],
        token: 'admin',
        introduction: '我是超级管理员',
        avatar: '',
        name: '管理员'
      }
    } else if (data.username === 'editor') {
      userList = {
        //token: 'editor',
        roles: ['editor'],
        token: 'editor',
        introduction: '我是editor',
        avatar: '',
        name: 'editor'
      }
    } else {
      return {
        code: -1,
        data: {
          msg: '用户名错误',
          status: 'fail'
        }
      }
    }
    return {
      code: 20000,
      data: userList
    }
  },
  // getUserInfo: config => {
  //   const { token } = param2Obj(config.url)
  //   if (userMap[token]) {
  //     return userMap[token]
  //   } else {
  //     return false
  //   }
  // },
  getUserInfo: config => {
    const data = JSON.parse(config.body);
    let userList = {}
    if (data.token === 'admin') {
      userList = {
        roles: ['admin'],
        role: 'admin',
        token: 'admin',
        avatar: '',
        name: 'admin'
      }
    } else if (data.token === 'editor') {
      userList = {
        roles: ['editor'],
        role: 'editor',
        token: 'editor',
        avatar: '',
        name: 'editor'
      }
    } else {
      userList = {}
    }
    return {
      code: 20000,
      data: userList
    }
  },
  logout: () => 'success'
}
