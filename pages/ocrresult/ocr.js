var fundebug = require('../../libs/fundebug.0.8.2.min.js')
var sha256 = require('../../utils/sha256');
var plugin = requirePlugin("WechatSI")
const util = require('../../utils/util.js');
var COS = require("../../utils/cos-wx-sdk-v5.js")
var config = require("../../utils/tencent-cloud-config.js")
const db = wx.cloud.database()

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
// 在页面中定义激励视频广告
let videoAd = null
// var uuid = require('../../utils/uuid')
fundebug.init(
    {
        apikey: "925c07a5e51fe8b4cdcbae8ad9a09c29ed2e327fe330a3fa183f62e6fb0cfcdf",
        silentInject: true
    })

var utilMd5 = require('../../utils/md5utf-8.js')
var lang = ""
Page({

    /**
     * 页面的初始数据
     */
    data: {
        Text: "123123",
        int: 0,
        autoHeight: true,
        src: "",
        array: ['中文', '英文', '日文', '韩文', '法文', '俄文', '葡萄牙文', '西班牙文', '越南文'],
        index: 0,
        tapIndex: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this
        var usedCount = wx.getStorageSync('usedCount');
        if(usedCount!=undefined) {
            usedCount = parseInt(usedCount) - 1
        }
        wx.setStorageSync('usedCount', usedCount)
        
        // 在页面onLoad回调事件中创建激励视频广告实例
        if (wx.createRewardedVideoAd) {
            videoAd = wx.createRewardedVideoAd({
            adUnitId: 'adunit-4e4534a97d5c6e94'
            })
            videoAd.onLoad(() => {})
            videoAd.onError((err) => {})
            videoAd.onClose((res) => {
                if(res &&res.isEnded) {
                    var tapIndex = that.data.tapIndex;
                    if (tapIndex == 0) {
                        that.Translate(that.data.Text,"zh_CN","en_US")
                    }
                    if (tapIndex == 1) {
                        that.Translate(that.data.Text,"en_US","zh_CN")
                    }
                }
            })
        }
        that.upload();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        var that = this;
        wx.getStorage({
            key: 'strWithN',
            success: function(res) {
                console.log(res);
                that.setData({
                    Text: res.data
                })
            },
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {
        wx.navigateBack({
            delta: 2
        })
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },

    Copy: function() {
        var that = this
        wx.setClipboardData({
            data: that.data.Text,
        })
    },

    Erase: function() {
        var that = this
        wx.getStorage({
            key: 'strWithoutN',
            success: function(res) {
                console.log(res);
                that.setData({
                    Text: res.data
                })
            },
        })
    },

    bindTrans: function(e) {
        var that = this;
        
        wx.showActionSheet({
            itemList: ['中文 → 英文', '英文 → 中文'],
            success: (e)=> {
            var tapIndex = e.tapIndex;
            that.setData({
                tapIndex:tapIndex
            })
            console.log(Date.now()%2)
            if(Date.now()%2==0) {
                wx.showModal({
                    title: '提示',
                    content: '观看视频，奖励全文进行翻译',
                    success (res) {
                      if (res.confirm) {
                          // 用户触发广告后，显示激励视频广告
                        if (videoAd) {
                          videoAd.show().catch(() => {
                            // 失败重试
                            videoAd.load()
                              .then(() => videoAd.show())
                              .catch(err => {
                                if (tapIndex == 0) {
                                    that.Translate(that.data.Text,"zh_CN","en_US")
                                }
                                if (tapIndex == 1) {
                                    that.Translate(that.data.Text,"en_US","zh_CN")
                                }
                                console.log('激励视频 广告显示失败')
                              })
                          })
                        }
                      } else if (res.cancel) {
                      }
                    }
                  })
            } else {
                if (tapIndex == 0) {
                    that.Translate(that.data.Text,"zh_CN","en_US")
                }
                if (tapIndex == 1) {
                    that.Translate(that.data.Text,"en_US","zh_CN")
                }
            }
                
                
            }
        })
    },

    Check: function() {
        var that = this
        if (that.data.autoHeight == true) {
            that.setData({
                autoHeight: false
            })
            wx.getStorage({
                key: 'pic',
                success: function(res) {
                    that.setData({
                        src: res.data,
                    })
                },
            })
        } else {
            that.setData({
                autoHeight: true
            })
        }
    },

    Undo: function() {
        var that = this
        wx.getStorage({
            key: 'strWithN',
            success: function(res) {
                console.log(res);
                that.setData({
                    Text: res.data
                })
            },
        })
    },

    OK: function(event) {
        console.log(event);
        var mod = event.detail.value
        console.log("OK");
        this.setData({
            Text: mod
        })
        console.log(this.data.Text);
    },

    Translate: function(trans,from_lang ,to_lang) {
        wx.showLoading({
            title: '翻译中...',
            mask:true
        })
        plugin.translate({
            lfrom:from_lang,
            lto:to_lang,
            content:trans,
            success: (res)=> {
                if(res.retcode == 0) {
                    console.log("result", res.result)
                    this.setData({
                        Text: res.result
                    })
                } else {
                    console.warn("翻译失败", res)
                }
                wx.hideLoading()
            },
            fail:(res) =>{
                console.log("网络失败",res)
                wx.showToast({
                    title: "无网络连接",
                    icon: 'success',
                    image: '/images/icons8-fail.png',
                    duration: 1000,
                    success: function(res) {

                    },
                    fail: function(res) {
                        console.log(res);
                    }
                });
                wx.hideLoading()
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
  upload:function() {
    var filePath = wx.getStorageSync('pic');
    var that = this;
    var starttime = new Date().getTime();
    var openid = wx.getStorageSync('openid')
    var name = openid + "_" + util.common.getTimestamp() + ".jpg";

    cos.postObject({
      Bucket: config.Bucket,
      Region: config.Region,
      Key: name,
      FilePath: filePath,
      onProgress: function (info) {
      },

    }, function (err, data) {
      console.log(err || data);
      if (err && err.error) {
       
      } else if (err) {
        
      } else {
        console.log("上传图片花费：" + (new Date().getTime() - starttime))
        starttime = new Date().getTime()
        var imageUrl = "https://wenzi-1252859906.cos.ap-chengdu.myqcloud.com/" + name;
        that.saveResult(imageUrl);
      }
    });
  },
  saveResult:function(imageUrl) {
      var that = this;
      var resultText = that.data.Text;
    var openId = wx.getStorageSync('openid');
    db.collection('result').add({
        // data 字段表示需新增的 JSON 数据
        data: {
          // _id: 'todo-identifiant-aleatoire', // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
          openId: openId,
          createDate: new Date(),
          url:imageUrl,
          result: resultText
        },
        success: function(res) {
          // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
          console.log(res)
        }
      })
  }

})