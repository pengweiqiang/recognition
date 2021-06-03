let app = getApp()
Page({
  data: {
    couponList: [],
    searchContent: "",
    pageIndex: 1,
    msgList: [
      { title: "朋友圈" },
      { title: "文章" },
      { title: "公共号" },
      { title: "小程序" },
      { title: "音乐" },
      { title: "表情" },
      { title: "订阅号" }]
      ,
    sortTitles:[
      { text: '最新排序', value: 'new' },
      { text: '价格升序', value: 'price_asc' },
      { text: '价格降序', value: 'price_desc' },
      { text: '2小时销量', value: 'two_hour_sale_num' },
      { text: '全天销量', value: 'one_day_sale_num' },
      { text: '总销量', value: 'sale_num' },
    ],
    sortValue:'new'
  },

  onLoad: function (options) {
  },

  sortChange:function(value){
    console.log(value.detail);
    let that = this;
    that.setData({
      sortValue:value.detail,
      couponList:[]
    })
    that.getMoreCouponList();
  },

  onShow: function () {
    if (wx.getStorageSync('isDetailBack')) {
      wx.removeStorageSync('isDetailBack')
      return
    }

    this.setData({
      couponList: [],
      searchContent: "",
      pageIndex: 1
    })
  },

  onSearch: function (e) {
    if (e.detail !== "") {
      this.setData({
        searchContent: e.detail,
        couponList: []
      }, () => {
        this.getMoreCouponList()
      })
    }
  },

  jumpToDetail: function (e) {
    wx.setStorage({
      key: 'couponInfo',
      data: this.data.couponList[e.currentTarget.dataset.index],
      success: () => {
        wx.navigateTo({
          url: '../pdddetail/detail',
        })
      }
    })
  },

  getMoreCouponList: function () {
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    console.log(that.data.sortValue);
    var searchKey = that.data.searchContent;
    console.log(searchKey);
      wx.cloud.callFunction({
        name: 'getGuessList',
        data: {
          'name': searchKey,
          'page': that.data.pageIndex
        },
        success: (response) => {
          if(response.result == null) {
            that.getMoreCouponList();
          }else {
            that.setData({
              couponList: that.data.couponList.concat(response.result)
            })
          }
          wx.hideLoading();
        }
      })
  },

  jumpToDetail: function (e) {
    wx.setStorage({
      key: 'couponInfo',
      data: this.data.couponList[e.currentTarget.dataset.index],
      success: () => {
        wx.navigateTo({
          url: '../pdddetail/detail',
        })
      }
    })
  },

  onReachBottom: function () {
    if (this.data.searchContent !== "") {
      this.setData({
        pageIndex: this.data.pageIndex + 1
      }, () => {
        this.getMoreCouponList()
      })
    }
  }
})
