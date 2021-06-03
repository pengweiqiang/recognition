const ald = require("./utils/ald-stat.js");
var user = require("utils/user.js");
const Bmob = require('utils/bmob.js')
Bmob.initialize("bd44714c25113a07648589d84642f57c", "f24ef813dd19b669a776aa9a9ac5f92d");
export { Bmob };
App({
  onLaunch: function () {
    // 展示本地存储能力
    //var logs = wx.getStorageSync('logs') || []
    //logs.unshift(Date.now())
    //wx.setStorageSync('logs', logs)

    user.getUserInfo();
    wx.setStorageSync('usedCount', 2);
    if(wx.getStorageSync('usedCount') == undefined) {
      
    }
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              console.log("getUserInfo------"+res.userInfo);
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    wx.setStorage({
      key: 'engine',
      data: 'CHN_ENG',
    })
    wx.setStorage({
        key: 'isAccu',
        data: false,
    })
    wx.setStorage({
        key: 'isPTH',
        data: true,
    })
    wx.setStorage({
      key: 'isHand',
      data: false,
  })

  wx.getSystemInfo({
    success: (e) => {
      this.globalData.StatusBar = e.statusBarHeight
      let capsule = wx.getMenuButtonBoundingClientRect()
      if (capsule) {
        this.globalData.Custom = capsule
        this.globalData.CustomBar =
          capsule.bottom + capsule.top - e.statusBarHeight
      } else {
        this.globalData.CustomBar = e.statusBarHeight + 50
      }
    },
  })

  },
  globalData: {
    aiAppId: '1106782523',//ai.qq.com appId
    aiAppKey: 'h2K2V1rl1sTchHLo',
    bmobAppId: 'bd44714c25113a07648589d84642f57c',//bmob 
    bmobAppRestApiKey: 'f24ef813dd19b669a776aa9a9ac5f92d',
    userInfo: null

  }
})