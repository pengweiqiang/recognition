//index.js
const Bmob = require('../../utils/bmob.js')
const util = require('../../utils/util.js');
const user = require('../../utils/user.js')
var COS = require("../../utils/cos-wx-sdk-v5.js")
var config = require("../../utils/tencent-cloud-config.js")
//const qiniuUploader = require("../../../utils/qiniuUploader.js");
//var uploadFn = require("../../../utils/upload.js");

var cos = new COS({
  getAuthorization: function (params, callback) {//获取签名 必填参数
    // 方法二（适用于前端调试）
    var authorization = COS.getAuthorization({
      SecretId: config.SecretId,
      SecretKey: config.SecretKey,
      Method: params.Method,
      Key: params.Key
    });
    callback(authorization);
  }
});
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  addPicture: function () {
    wx.navigateTo({
      url: '/pages/ocr/ocr',
    })
  },
  //一键转发
  onShareAppMessage: function (res) {

    var _this = this;
    var path = "/pages/index/index";
    return {
      title: '传图识字',
      path: path,
      success: function (res) {
        // 转发成功
        console.log(path);
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  previewImage: function () {

    wx.previewImage({
      urls: ['http://p8c57y31f.bkt.clouddn.com/shang.jpeg']
      // 需要预览的图片http链接  使用split把字符串转数组。不然会报错  
    })

  }
})
