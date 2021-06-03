let app = getApp()
Page({
  data: {
    sortByList: [],
    categoryList: [],
    couponList: [],
    selectedSortIndex: 1,
    selectedCatIndex: 0,
    swiperCurrent:0,
    pageIndex: 1,
    imgUrls:[]
  },

  onLoad: function (options) {
    this.setSortByList()
    this.setCategoryList()
    // this.getBannerList();
  },

  onShow: function () {
    if (wx.getStorageSync('isDetailBack')) {
      wx.removeStorageSync('isDetailBack')
    }
    if(this.data.couponList == undefined || this.data.couponList.length == 0) {
      this.getMoreCouponList()
    }
  },

  // 设置排序列表
  setSortByList: function () {
    this.setData({
      sortByList: [
        { value: 1, text: "默认" },
        { value: 2, text: "最新" },
        { value: 3, text: "销量高到低" },
        { value: 4, text: "价格低到高" },
        { value: 5, text: "价格高到低" },
        { value: 6, text: "优惠力度" },
      ],
      selectedSortIndex: 4
    })
  },

  // 获取商品分类
  setCategoryList: function () {
    let categoryList = [
      { id: "0", name: "综合" },
      { id: "1", name: "女装" },
      { id: "2", name: "男装" },
      { id: "3", name: "内衣" },
      { id: "4", name: "美妆" },
      { id: "5", name: "配饰" },
      { id: "6", name: "鞋品" },
      { id: "7", name: "箱包" },
      { id: "8", name: "儿童" },
      { id: "9", name: "母婴" },
      { id: "10", name: "居家" },
      { id: "11", name: "美食" },
      { id: "12", name: "数码" },
      { id: "13", name: "家电" },
      { id: "14", name: "其他" },
      { id: "15", name: "车品" },
      { id: "16", name: "文体" },
      { id: "17", name: "宠物" }
    ]

    this.setData({
      categoryList: categoryList,
      selectedCatIndex: 0
    })
  },

  getMoreCouponList: function () {
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    var category = that.data.selectedCatIndex;
    var sort = that.data.selectedSortIndex;
    var pageIndex = that.data.pageIndex;
    console.log("c="+category+" sort="+sort+"  pageIndex="+pageIndex);
    wx.cloud.callFunction({
      name: 'getGoodsList',
      data: {
        'category': category,
        'sort': sort,
        'page': that.data.pageIndex
      },
      success: response => {
        if(response.result == null) {
          that.getMoreCouponList();
        }else {
          that.setData({
            couponList: that.data.couponList.concat(response.result)
          })
        }
        wx.hideLoading()
      }
    })
  },

  getBannerList: function () {
    var that = this
    wx.cloud.callFunction({
      name: 'getBannerList',
      data: {
      },
      success: response => {
        console.log("banner  "+response.result)
        that.setData({
          imgUrls: response.result
        }, () => {
          wx.hideLoading()
        })
      }
    })
  },

  categoryChanged: function (e) {
    this.setData({
      couponList: [],
      pageIndex: 1,
      selectedCatIndex: e.detail.index,
    })
    this.getMoreCouponList()
    wx.setStorageSync('selectedCatIndex', e.detail.index)
  },

  sortByChanged: function (e) {
    console.log(e.detail);
    var sort = e.detail;
    this.setData({
      couponList: [],
      pageIndex: 1,
      selectedSortIndex: sort,
    })
    this.getMoreCouponList()
    wx.setStorageSync('selectedSortIndex', sort)
  },

  jumpToSearch: function (e) {
    wx.navigateTo({
      url: '../search/search',
    })
  },

  jumpToDetail: function (e) {
    console.log(this.data.couponList[e.currentTarget.dataset.index]);
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

  onPullDownRefresh: function () {
    this.setData({
      couponList: [],
      pageIndex: 1
    })
    wx.stopPullDownRefresh()
    this.getMoreCouponList()
  },

  onReachBottom: function () {
    this.setData({
      pageIndex: this.data.pageIndex + 1
    })
    this.getMoreCouponList()
  },
  //轮播图的切换事件
  swiperChange: function (e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
  },

  //点击指示点切换事件
  chuangEvent: function (e) {
    this.setData({
      swiperCurrent: e.currentTarget.id
    })
  },

  //点击图片触发事件
  swipclick: function (e) {
    console.log(this.data.imgUrls[this.data.swiperCurrent].itemId);
    wx.navigateTo({
      url: '../articledetail/detail?itemId='+this.data.imgUrls[this.data.swiperCurrent].itemId,
    })
  },
})
