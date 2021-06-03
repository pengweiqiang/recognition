// pages/live/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    live_url: '',
    name: '',
    danmuList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that = this;
    this.setData({
      live_url: options.live_url,
      name: options.name
    })
    wx.setNavigationBarTitle({
      title: that.data.name,
    })
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

// 用户点击按钮分享
onShareAppMessage: function (res) {
  let that = this;
  if (res.from === 'button') {
      // 来自页面内转发按钮
  }
  var name = that.data.name;
  var live_url = that.data.live_url;
  return {
      title: name,
      path: 'pages/live/detail?name='+name+"&live_url="+live_url,
      success: function(res) {},
      fail: function() {}
  }
},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  statechange(e) {
    console.log('live-player code:', e.detail.code)
  },
  error(e) {
    console.error('live-player error:', e.detail.errMsg)
  },
  videoErrorCallback(e) {
    console.log('视频错误信息:')
    console.log(e.detail.errMsg)
  }
})