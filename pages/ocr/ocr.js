// pages/addcard/bank/bank.js
const util = require('../../utils/util.js');
var MD5 = require('../../utils/md5.js');
var Bmob = require("../../utils/bmob.js");
var user = require("../../utils/user.js");
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


Page({

  /**
   * 页面的初始数据
   */
  data: {
    //相册或者拍照获取路径
    chooseImageSrc: '',
    //卡类型
    cardTypeIndex: '',
    imageUrl: '',
    //是否展示图片
    showView: false,
    //读取数据
    showInfo: '',
    showInfoStr: '',
    objectId: '',//主键id
    bankNo: ''//卡号
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log("卡类型:" + getApp().globalData.cardType[options.cardTypeIndex]);
    this.setData({
      cardTypeIndex: options.cardTypeIndex,
      chooseImageSrc: options.imageUrl,
    })
    wx.setNavigationBarTitle({
      title: "传图识字",
      success: function (e) {
        console.log(e);
      }, fail: function (e) {
        console.log(e);
      }
    }
    )

    var openId = wx.getStorageSync('openId')
    if (openId == '') {
      user.getUserInfo()
    }


  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.addPicture()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  addPicture: function () {
    var _this = this;
    wx: wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        console.log(res.tempFilePaths + "  \n" + res.tempFiles[0]);
        var tempFilePaths = res.tempFilePaths;
        var filePath = res.tempFilePaths[0];

        _this.setData({
          chooseImageSrc: tempFilePaths,
          showView: true
        })
        var starttime = new Date().getTime();
        var openid = wx.getStorageSync('openid')
        var name = openid + "_" + util.common.getTimestamp() + ".jpg";
        //var file = new Bmob.File(name, tempFilePaths);
        wx.showLoading({
          title: '解析中,请稍后...',
        })

        cos.postObject({
          Bucket: config.Bucket,
          Region: config.Region,
          Key: name,
          FilePath: filePath,
          onProgress: function (info) {
            console.log(JSON.stringify(info));
          },

        }, function (err, data) {
          console.log(err || data);
          if (err && err.error) {
            wx.showModal({ title: '返回错误', content: '请求失败：' + err.error.Message + '；状态码：' + err.statusCode, showCancel: false });
          } else if (err) {
            wx.showModal({ title: '请求出错', content: '请求出错：' + err + '；状态码：' + err.statusCode, showCancel: false });
          } else {
            console.log("上传图片花费：" + (new Date().getTime() - starttime))
            starttime = new Date().getTime()
            var imageUrl = "https://wenzi-1252859906.cos.ap-chengdu.myqcloud.com/" + name;
            console.log(imageUrl);
            _this.setData({
              imageUrl: imageUrl,
            });
            wx.request({
              url: "https://weixin.shopin.net/wechatshop/ocr?imgUrl=" + imageUrl + "&ocrType=2",
              method: 'GET',
              success: function (res) {
                console.log("获取base64：" + (new Date().getTime() - starttime))
                var errorcode = res.data.errorcode;
                if (errorcode == 0) {
                  var itemlist = res.data.items;
                  var showInfo = [];
                  var showInfoStr = "";
                  for (var item in itemlist) {
                    showInfoStr += itemlist[item].itemstring + "\n";
                    showInfo.push(itemlist[item].itemstring);
                  }
                
                  _this.setData({
                    showInfo: showInfo,
                    showInfoStr: showInfoStr
                  })
                  wx.hideLoading();
                  console.log(showInfo);
                } else {
                  wx.showToast({
                    title: '识别失败，检查图片是否完整 ' + errorcode,
                  })
                }

              }, error: function (res) {
                wx.hideLoading();
              }, complete: function (res) {

              }
            });
          }
        });





      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  //一键复制
  copy: function (res) {
    var _this = this;
    var showInfo = _this.data.showInfoStr;
    
    console.log(showInfo);
    wx.setClipboardData({
      data: showInfo,
      success: function (res) {
        wx.showModal({
          title: '复制成功',
          content: "长按进行粘贴，点击右上角分享好友",
          success: function (res) {
            if (res.confirm) {
              _this.onShareAppMessage()
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      
      }
    })
  },

  //获取卡信息
  getBankInfoByAi: function (base64) {
    var starttime = new Date().getTime();
    var _this = this;
    wx.showLoading({
      title: '解析中...',
    })
    var appId = getApp().globalData.aiAppId;
    var appKey = getApp().globalData.aiAppKey;
    var timestamp = util.common.getTimestamp();
    var noncestr = util.common.createNonceStr();
    var params = {
      app_id: appId,
      time_stamp: timestamp,
      nonce_str: noncestr,
      image: base64
    }


    var sortParam = util.common.sortAscii(params) + "app_key=" + appKey;
    //console.log("sortParam:   "+sortParam);
    var signstr = MD5.md5(sortParam);
    //console.log("signStr: "+ signstr)
    wx.request({
      url: 'https://api.ai.qq.com/fcgi-bin/ocr/ocr_creditcardocr',
      data: {
        app_id: appId,
        time_stamp: timestamp,
        nonce_str: noncestr,
        sign: signstr,
        image: base64
      },
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        console.log("识别：" + (new Date().getTime() - starttime))
        starttime = new Date().getTime()
        console.log(res.data);
        var resultJson = res.data;
        var ret = res.data.ret;
        if (ret == 0) {
          var item_list = res.data.data.item_list;
          console.log(item_list)
          _this.setData({
            bank: item_list,
            cardNo: item_list[0].itemstring,
            ocrJson: resultJson,
          })
          _this.addCardInfo();
        } else {
          _this.setData({
            bank: '',
            ocrJson: '',
          })
          var msg = res.data.msg;
          wx.showToast({
            title: ret + '识别失败，请上传正确的卡',
            icon: 'none',
            duration: 2500
          })
        }

      }, fail: function (res) {
        wx.hideLoading();
        wx.showToast({
          title: res.msg,
          icon: 'none'
        })
        console.log("fail " + res);
      }, complete: function (res) {

      }
    })
  },
  //添加卡信息
  addCardInfo: function () {
    var _this = this;
    wx.showLoading({
      title: '解析中...',
    })
    //创建类和实例
    var CardInfo = Bmob.Object.extend("card");
    var card = new CardInfo();
    try {
      var openid = wx.getStorageSync('openid')
      console.log(openid);
      if (openid != '') {
        card.set("openId", openid);
        // Do something with return value
      } else {
        user.getUserInfo();
      }
    } catch (e) {
      // Do something when catch error
    }

    card.set("cardUrl", _this.data.imageUrl);
    try {
      var banks = _this.data.bank;
      card.set("ocrInfo", JSON.stringify(banks));
      card.set("cardTypeIndex", 1);
      card.set("flag", 1);

      var showInfo = [];
      for (var item in banks) {
        showInfo.push({ "item": banks[item].item, "itemstring": banks[item].itemstring });
      }

      card.set("cardNo", _this.data.bank[0].itemstring);
      card.set("cardType", _this.data.bank[1].itemstring);
      card.set("cardName", _this.data.bank[2].itemstring);
      card.set("cardInfo", _this.data.bank[3].itemstring);
      card.set("showInfo", JSON.stringify(showInfo));
      card.set("validityDate", _this.data.bank[4].itemstring);

    } catch (e) {

    }
    //添加数据，第一个入口参数为null
    card.save(null, {
      success: function (result) {
        // 添加成功，返回成功之后的objectId（注意：返回的属性名字是id，不是objectId），你还可以在Bmob的Web管理后台看到对应的数据
        console.log("银行卡创建成功, objectId:" + result.id);
        _this.setData({
          objectId: result.id
        })
        wx.hideLoading();
      },
      error: function (result, error) {
        console.log(result + " " + error);
        var msg = '';
        if (error.code == 401) {
          msg = '您已经添加过该银行卡'
        }
        // 添加失败
        wx.hideLoading();
        wx.showToast({
          title: msg,
          icon: 'none',
          duration: 2000
        })
      }
    });
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
  bindChooseImg: function (e) {
    console.log("1111111");
    this.bindChooseImg()
  },
  bindConfirm: function (e) {
    this.bindConfirm();
  }

})