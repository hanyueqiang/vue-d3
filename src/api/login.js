import request from '@/utils/request'

// export function login(username, password) {
//   return request({
//     url: '/user/login' + '?username=' + username,
//     method: 'post'
//   })
// }
export function login(params) {
  return request({
    url: '/user/login',
    method: 'post',
    data: JSON.stringify(params)
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    data: JSON.stringify({ token })
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}
