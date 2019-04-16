const localhost = "https://www.kebencool.cn:8762"
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const property = {
  level: { "0": "轿车", "1": "SUV", "2": "MPV", "3": "跑车", "4": "微面", "5": "微卡", "6": "轻客", "7": "皮卡"},
  structure: { "0": "两厢", "1": "三厢", "2": "掀背", "3": "旅行版", "4": "硬顶敞篷车", "5": "软顶敞篷车", "6": "货车", "7": "客车" },
  displacement: { "-1":"1.0L及以下","0": "1.0L及以下", "1": "1.1-1.6L", "2": "1.7-2.0L", "3": "2.1-2.5L", "4": "2.6-3.0L", "5": "2.1-4.0L", "6": "4.0L以上"},
  Transmission: { "0":"手动","1":"自动"},
  country: { "0": "中国", "1": "德国", "2": "日本", "3": "美国", "4": "韩国", "5": "法国", "6": "英国", "7": "其他" },
  production_methods: { "0": "国产", "1": "进口" },
  seat: { "0": "2座", "1": "4座", "2": "5座", "3": "6座", "4": "7座", "5": "7以上" },
  energy: { "0": "汽油", "1": "柴油", "2": "油电混合", "3": "纯电动" },
  driving_method: { "": "前驱","0": "前驱", "1": "后驱", "2": "四驱" },
  air_intake: { "":"自然进气","0":"自然进气","1":"机械增压","2":"涡轮增压"}
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//获取个人信息并在后台登陆
const reLogin = (that,app) =>{
  wx.getUserInfo({
    success: res => {
      console.log("=========================================================================change")
      app.globalData.userInfo = res.userInfo
      app.globalData.getUserInfo = true
      app.globalData.signature = res.signature
      that.setData({
        userInfo: res.userInfo,
        hasUserInfo: true
      })
      sendlogin(res.userInfo,res.signature,res.rawData)
    }
  })
}
//让用户设置个人信息权限
const getUserInfoScope = (that, app) =>{
  wx.getSystemInfo({
    success: function(res) {
      wx.setStorage({
        key: 'sysInfo',
        data: res,
      })
    },
  })
  wx.getUserInfo({
    success: function (res) {
      console.log("util.js-拥有权限")

    },
    fail: function () {
      console.log("util.js-没有权限")
      app.globalData.getUserInfo = false
      wx.showModal({
        title: '相机需要授权才能使用',
        content: '是否继续使用小程序',
        cancelText: '退出',

        confirmText: '进入',
        //用户点击授权
        success: function (e) {
          //点击确认按钮
          if(e.confirm==true){
            //打开授权页面
            wx.switchTab({
              url: "/pages/persona/personal"
            })
          }else{
            //点击取消按钮
            wx.switchTab({
              url: "/pages/persona/personal"
            })

          }
        }
      })
    }
  })
}

const sendlogin = (userInfo, signature, rawData) => {
  // 登录
  wx.login({
    success: res => {
      console.log("服务端登陆请求：")
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      if (res.code) {
        //发起网络请求
        wx.request({
          url: localhost +'/api-basicS/personal/sendUserCode',
          data: {
            code: res.code,
            nickname: userInfo.nickName,
            headimg: userInfo.avatarUrl,
            sex: userInfo.gender,
            signature: signature,
            rawData: rawData
          },
          success: function (res) {
            console.log("登陆成功："+res.data)
            console.log( res.data)
            wx.setStorageSync("uid", res.data.uid)
          }
        })
      } else {
        console.log('登录失败！' + res.errMsg)
      }
    }
  })
}

function wxPromisify(fn) {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        resolve(res)
      }

      obj.fail = function (res) {
        reject(res)
      }

      fn(obj)
    })
  }
}

function parseRpxToPx(rpx){
  return rpx / 750 * wx.getSystemInfoSync().windowWidth
}
module.exports = {
  formatTime: formatTime,
  sendlogin:sendlogin,
  reLogin: reLogin,
  getUserInfoScope: getUserInfoScope,
  property: property,
  localhost: localhost,
  wxPromisify: wxPromisify,
  parseRpxToPx: parseRpxToPx
}
