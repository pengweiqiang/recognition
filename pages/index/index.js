//index.js
const Bmob = require('../../utils/bmob.js')
var utilMd5 = require('../../utils/md5utf-8.js');
const util = require('../../utils/util.js');
const user = require('../../utils/user.js')
var COS = require("../../utils/cos-wx-sdk-v5.js")
var config = require("../../utils/tencent-cloud-config.js")
//const qiniuUploader = require("../../../utils/qiniuUploader.js");
//var uploadFn = require("../../../utils/upload.js");
let interstitialAd = null;
// 在页面中定义激励视频广告
let videoAd = null
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
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    usedCount:0,
    show: false,
    recommendText:'',
    showLive:false,//展示直播入口
    bgImage:"https://wenzi-1252859906.cos.ap-chengdu.myqcloud.com/bg.jpg",
    actions: [
      {
        id:0,
        name: '拍照',
      },
      {
        id:1,
        name: '从手机相册中选择',
      },
      {
        id:2,
        name: '从聊天记录中选择',
        subname: '从群或者好友聊天记录选择图片'
      },
    ],
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    var that = this;
    //i的取值范围为[0,1)的小数,[]是包含等于 (不好含等于
    var index = Math.floor(Math.random() * 10 )
    this.getconfig();
    var usedCount = wx.getStorageSync("usedCount");
    that.setData({
      usedCount:usedCount,
      bgImage:"https://wenzi-1252859906.cos.ap-chengdu.myqcloud.com/bg"+index+".jpg"
    })
        // 在页面onLoad回调事件中创建激励视频广告实例
    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-789b559c2e7822a0'
      })
      videoAd.onLoad(() => {})
      videoAd.onError((err) => {})
      videoAd.onClose((res) => {
        if(res &&res.isEnded) {
          wx.showToast({
            icon:"none",
            title: '恭喜获得一次传图识字',
          })
          var usedCount = that.data.usedCount + 1;
          wx.setStorageSync('usedCount', usedCount)
          that.a();
        }
      })
    }

    // 在页面onLoad回调事件中创建插屏广告实例
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-60bdb56cada1171e'
      })
      interstitialAd.onLoad(() => {})
      interstitialAd.onError((err) => {})
      interstitialAd.onClose(() => {})
    }

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
    wx.showTabBarRedDot({
      index: 1,
    })
  },
  onShow:function() {
    setTimeout(() => {
      // 在适合的场景显示插屏广告
    if (interstitialAd) {
      interstitialAd.show().catch((err) => {
        console.error(err)
      })
    }
    }, 2000);
    this.getRecommend();
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  reward:function() {
    wx.showModal({
      title: '提示',
      content: '观看视频，即可获取传图识字一次机会',
      success (res) {
        if (res.confirm) {
            // 用户触发广告后，显示激励视频广告
          if (videoAd) {
            videoAd.show().catch(() => {
              // 失败重试
              videoAd.load()
                .then(() => videoAd.show())
                .catch(err => {
                  console.log('激励视频 广告显示失败')
                })
            })
          }
        } else if (res.cancel) {
        }
      }
    })
    
  },
  showSelectPicture:function() {
    var that = this;
    var usedCount = wx.getStorageSync("usedCount");
    if(usedCount == undefined || usedCount <=0) {
      that.reward();
    } else {
      that.setData({ show: true });
    }
  },
  addPicture: function () {
    wx.setStorageSync('isHand', false);
    this.showSelectPicture();
  },
  addPictureHand:function() {
      wx.setStorageSync('isHand', true);
      this.showSelectPicture();
  },
    a: function () {
      var that = this;
      wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album'],
          success: (res) => {
              //   console.log(res);
              var exitedFilePaths = that.data.picUrl;
              var tempFilePaths = res.tempFilePaths;
              console.log("tempFilePaths:" + tempFilePaths);
              that.setData({
                  picUrl: tempFilePaths,
                  image: tempFilePaths
              })
              wx.setStorage({
                  key: 'pic',
                  data: that.data.image,
              })
              wx.navigateTo({
                  url: '/pages/cropper2/cropper',
              })
          },
      })
  },
  takePhoto: function () {
    var that = this;
    wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera'],
        success: (res) => {
            //   console.log(res);
            var exitedFilePaths = that.data.picUrl;
            var tempFilePaths = res.tempFilePaths;
            console.log("tempFilePaths:" + tempFilePaths);
            that.setData({
                picUrl: tempFilePaths,
                image: tempFilePaths
            })
            wx.setStorage({
                key: 'pic',
                data: that.data.image,
            })
            wx.navigateTo({
                url: '/pages/cropper2/cropper',
            })
        },
    })
},
  chatPhoto:function() {
    var that = this;
    wx.chooseMessageFile({
      count: 1,
      type: 'image',
      success (res) {
        const tempFilePaths = res.tempFiles
        var tempFilePath = tempFilePaths[0].path;
        console.log("tempFilePaths:" + tempFilePath);
        that.setData({
            picUrl: tempFilePath,
            image: tempFilePath
        })
        wx.setStorage({
            key: 'pic',
            data: tempFilePath,
        })
        wx.navigateTo({
            url: '/pages/cropper2/cropper',
        })
      }
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
      urls: ['https://wenzi-1252859906.cos.ap-chengdu.myqcloud.com/123.jpg']
      // 需要预览的图片http链接  使用split把字符串转数组。不然会报错  
    })

  },
  getconfig:function(){
    var that = this;
    var config = Bmob.Object.extend("config");
    var query = new Bmob.Query(config);
    query.equalTo("category", "live");
    query.equalTo("flag",1);
    // 查询所有数据
    query.find({
      success: function (results) {
        var length = results.length;
        if(length>0){
            that.setData({
              showLive:true
            })
        }

      },
      error: function (error) {
       
      }
    });
  },
  onClose() {
    this.setData({ show: false });
  },

  onSelect(e) {
    var that = this;
    var id = e.detail.id;

    console.log(e.detail.id);
    if(id == 0) {
       that.takePhoto();
    } else if(id == 1){
      that.a();
    } else {
      that.chatPhoto();
    }
  },
  getRecommend:function() {
    var that = this;
    wx.cloud.callFunction({
      name: 'getRecommend',
      data: {
        
      },
      success: response => {
        that.setData({
          recommendText: response.result.content
        })
      }
    })
  },
  live:function(){
    wx.navigateTo({
      url: '/pages/live/index',
    })
  }
})
