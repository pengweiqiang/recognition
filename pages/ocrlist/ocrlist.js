// pages/ocrlist/ocrlist.js
const Bmob = require('../../utils/bmob.js')
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    datas: [],
    page:0,
    pageSize:20
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData();
  },
  getData:function() {
    var that = this;
    var limit = that.data.pageSize;
    var startIndex = that.data.page * limit;
    wx.showNavigationBarLoading();
    db.collection('result').orderBy('createDate', 'desc').skip(startIndex)
      .limit(limit)
      .get({
        success: res => {
          that.finishRefresh();
          if(startIndex == 0) {
            that.setData({
              datas: res.data
            })
          } else {
            that.setData({
              datas:that.data.datas.concat(res.data)
            })
            
          }
          
        },
        fail: err => {
          that.finishRefresh();
          console.log('[数据库] [查询记录] 失败：');
        }
      })
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
    wx.hideTabBarRedDot({
      index: 1,
    })
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    that.setData({
      page:that.data.page+1
    })
    that.getData();
  },

  //下拉刷新
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    var that = this;
    that.setData({
      page:0
    })
    that.getData();
  },
  //停止刷新
  finishRefresh: function () {
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  cardItem:function(options){
    var that = this;
    var cardUrl = options.currentTarget.dataset.cardurl;
    var cardUrlList = [];
    for(var i=0;i<that.data.datas.length;i++) {
      cardUrlList.push(that.data.datas[i].url);
    }
    console.log(cardUrl);
    wx.previewImage({
      current: cardUrl,
      urls:cardUrlList
    })
  }
})