var util = require("../../utils/util.js");
var app = getApp()
Page({
  data: {
    couponInfo: {},
    picWidth: wx.getSystemInfoSync().windowWidth,
    showTpwdDialog: false,
    tpwd: "",
    hasTpwd: true,
    showtbk:false,
    btntext:'领券购买',
    guessLikeList: [],
    imageList:[],
    showCoupon:false,
    pushStyle:'',
    pushIcon:'like-o',
  },

  onShow: function () {
    wx.setStorageSync('isDetailBack', true)
  },

  onLoad: function (options) {
    let id = options.id;
    let couponInfo = {};
    if(id != undefined){
      console.log(id);
      couponInfo = JSON.parse(id);
    }else {
      couponInfo = wx.getStorageSync('couponInfo'); 
      couponInfo.couponStartTime = util.js_date_time(couponInfo.couponStartTime*1000).slice(0, 10);
      couponInfo.couponEndTime = util.js_date_time(couponInfo.couponEndTime*1000).slice(0, 10);
    }
    console.log(couponInfo)
    this.setData({
      couponInfo: couponInfo
    })
    let imageList = couponInfo.longPicUrl.split(",");
    let showCoupon = false;
    if(Date.now()>1618045912000) {
      showCoupon = true;
    }
    this.setData({
      imageList: imageList,
      showCoupon: showCoupon
    })

    // this.setTpwd();
    this.guessLike();
  },

  showTpwd: function () {
    var that = this;
    var itemId = that.data.couponInfo.itemId;
    let pagePath = "package_a/welfare_coupon/welfare_coupon?goods_id="+itemId+"&pid=16057428_197355332"
    wx.navigateToMiniProgram({
      appId: 'wx32540bd863b27570',
      path: pagePath,
      success(res) {
      },
      fail(res){
        console.log(res)
      }                     
    })
  },
  pushEvent:function(){
    var that = this;
      wx.aldPushSubscribeMessage({
        eventId: '60713fd20367045c2eb3d74d',
        success(res) {
          that.setData({
            pushStyle:'red',
            pushIcon:'like'
          })
        // 成功后的回调函数
        console.log(res)
      },
        fail(res, e) {
        // 失败后的回调函数
        console.log(res)
        console.log(e)
      }
    });
  },

  setTpwd: function () {
    if (this.data.tpwd == '') {
      let that = this
      wx.cloud.callFunction({
        name: 'getTpwd2',
        data: {
          'title': that.data.couponInfo.title,
          'picUrl': that.data.couponInfo.picUrl,
          'couponId': that.data.couponInfo.couponId,
          'itemId': that.data.couponInfo.itemId
        },
        success: (response) => {
          console.log(response.result)
          that.setData({
            // tpwd: response.result.data.model,
            tpwd: response.result.tkl,
            showtbk: response.result.showtbk,
            hasTpwd: true,
            btntext:response.result.btntext
          })
        }
      })
    }
  },

  copyTpwd: function () {
    wx.setClipboardData({
      data: this.data.tpwd,
      success: (res) => {
        wx.showToast({
          title: '复制成功',
        })
      }
    })
  },
  // 用户点击按钮分享
  onShareAppMessage: function (res) {
    let that = this;
    if (res.from === 'button') {
        // 来自页面内转发按钮
    }
    var finalPrice = that.data.couponInfo.presentPrice;
    return {
        title: finalPrice+"元就能买到【"+that.data.couponInfo.title,
        path: 'pages/pdddetail/detail?id='+JSON.stringify(that.data.couponInfo),
        imageUrl: that.data.couponInfo.picUrl,
        success: function(res) {},
        fail: function() {}
    }
  },
  //猜你喜欢
  guessLike: function() {
    let that = this
    var searchKey = that.data.couponInfo.shortTitle;
    console.log(searchKey);
      wx.cloud.callFunction({
        name: 'getGuessList',
        data: {
          'name': searchKey
        },
        success: (response) => {
          let guessLike = response.result;
          that.setData({
            guessLikeList: guessLike,
          })
        }
      })
  },
  diffTwoTime: function (faultDate, completeTime) {
 
    var stime = Date.parse(new Date(faultDate));
     
    var etime = Date.parse(new Date(completeTime));
     
    var usedTime = etime - stime; //两个时间戳相差的毫秒数
     
    var days = Math.floor(usedTime / (24 * 3600 * 1000));
     
    //计算出小时数
     
    var leave1 = usedTime % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
     
    var hours = Math.floor(leave1 / (3600 * 1000));
     
    //计算相差分钟数
     
    var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
     
    var minutes = Math.floor(leave2 / (60 * 1000));
     
     
     
    var dayStr = days == 0 ? "" : days + "天";
     
    var hoursStr = hours == 0 ? "" : hours + "时";
    var time = dayStr + hoursStr + minutes + "分";
    },

  jumpToDetail: function (e) {
    wx.setStorage({
      key: 'couponInfo',
      data: this.data.guessLikeList[e.currentTarget.dataset.index],
      success: () => {
        wx.navigateTo({
          url: '../pdddetail/detail',
        })
      }
    })
  },

})
