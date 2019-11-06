import request from '@/utils/request'


export function getTree(params) {
  return request({
    url: '/kgmaker/restapi/v1/tree/load',
    method: 'post',
    params
  })
}
