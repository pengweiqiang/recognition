// pages/cardDetail.js
var Bmob = require("../../utils/bmob.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    objectId:'',
    cardNo:'',
    cardTypeIndex:'',
    imageUrl:'',
    bank:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this = this;
    
    var share = options.share;
    if (share == undefined){
      share = false;
    }
    console.log(options.objectId + " " + share);
    _this.setData({
      objectId:options.objectId,
      cardTypeIndex: options.cardTypeIndex,
      imageUrl: options.imageUrl,
      cardNo:options.cardNo,
      share:share
    })
    _this.getCardInfoById(options.objectId, options.cardNo);
      
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
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
    var _this = this;
    return {
      title: '许多卡，一键扫描管理你的卡片',
      path: 'pages/cardDetail/cardDetail?cardTypeIndex=' + _this.data.cardTypeIndex + '&imageUrl=' + _this.data.imageUrl + '&objectId=' + _this.data.objectId +"&cardNo="+_this.data.cardNo+"&share=true",
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  //通过id获取卡信息
  getCardInfoById:function(objectId,cardNo){
    wx.showLoading({
      title: '加载中...',
    })
    var _this = this;
    var card = Bmob.Object.extend("card");
    var query = new Bmob.Query(card);
    if(objectId != ''){
      query.get(objectId, {
        success: function (result) {
          wx.hideLoading();
          console.log(result.get("showInfo"));
          var bank = JSON.parse(result.get("showInfo"));
          _this.setData({
            bank: bank
          })
        }, error: function (result, error) {
          console.log(error.msg)
          wx.hideLoading()
          wx.showToast({
            title: '卡信息不存在',
          })
        }
      })
    }else{
      query.equalTo("cardNo",cardNo);
      query.find({
        success:function(results){
          wx.hideLoading();
          console.log(results[0].get("ocrInfo"));
          var bank = JSON.parse(results[0].get("ocrInfo"));
          _this.setData({
            bank: bank
          })
        }, error: function (result, error) {
          console.log(error.msg)
          wx.hideLoading()
          wx.showToast({
            title: '卡信息不存在',
          })
        }
      });
    }
    
  },
  //打开图片
  openBankImage:function(res){
    var _this = this;
    var urls = [_this.data.imageUrl];
    wx.previewImage({
      current: '', // 当前显示图片的http链接
      urls: urls// 需要预览的图片http链接列表
    })
  },
//一键复制
  copy:function(res){
    var _this = this;
    var value = res.target.dataset.value;
    var banks = _this.data.bank;
    var copyvalue = '';
    for (var item in banks) {
      if(banks[item].item==''){
        copyvalue +=  banks[item].itemstring + "\n"
      }else{
        copyvalue += banks[item].item + ":\t" + banks[item].itemstring + "\n"
      }
      
    }
    console.log(copyvalue);
    wx.setClipboardData({
      data: copyvalue,
      success:function(res){
        // wx.showModal({
        //   title: '复制成功',
        //   content: copyvalue,
        //   success: function (res) {
        //     if (res.confirm) {
        //       _this.onShareAppMessage()
        //     } else if (res.cancel) {
        //       console.log('用户点击取消')
        //     }
        //   }
        // })
        wx.showToast({
          title: '复制成功',
        })
      }
    })
  },
  //回到首页
  backHome:function(res){
    wx.reLaunch({
      url: '../../pages/index/index'
    })
  },
  //拨打电话
  callPhone:function(res){
    var name = res.target.dataset.name;
    if(name == '手机'||name== '电话'){
      wx.makePhoneCall({
        phoneNumber: res.target.dataset.value
      })
    }
    
  }

})