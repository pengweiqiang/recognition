var access_token = ""

Page({
  data: {
      src:'',
      image: "",
      width:300,//宽度
      height: 320,//高度
      maxWidth:1000,
      maxHeight:1000,
      isHand:false,
  },
  onLoad: function (options) {
    var that = this;
    wx.getStorage({
      key: 'pic',
      success: function(res) {
          console.log("拉取图片地址："+res.data)
          that.setData({
            src: res.data,
          })
      },
    })
    var isHand = wx.getStorageSync('isHand');
    if(isHand !=undefined) {
        that.setData({
            isHand:isHand
        })
    }
//获取到image-cropper实例
      this.cropper = this.selectComponent("#image-cropper");
      // wx.showLoading({
      //     title: '加载中'
      // })
  },
  cropperload(e){
      console.log("cropper初始化完成");
  },
  loadimage(e){
    var that = this;
      console.log("图片加载完成",e.detail);
      var IMG_REAL_W = e.detail.width
      var IMG_REAL_H = e.detail.height
      var IMG_RATIO = IMG_REAL_W / IMG_REAL_H
      that.setData({
        maxHeight: IMG_REAL_H,
        maxWidth: IMG_REAL_W
      })
      //重置图片角度、缩放、位置
      this.cropper.imgReset();
  },
  // clickcut(e) {
    
  // },

  baidu_accu: function() {
    console.log("进入baidu_accu()");
    var url
    var strWithN = ""
    var strWithoutN = ""
    var base64
    var that = this
    //   console.log(that.data.picUrl);
    var a = wx.getFileSystemManager()
    if (that.data.isHand == false) {
        url = "https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic?access_token="
    } else {
        url = "https://aip.baidubce.com/rest/2.0/ocr/v1/handwriting?access_token="
    }
    a.readFile({
        filePath: that.data.image,
        encoding: "base64",
        success: (res) => {
            // console.log(res);
            base64 = res.data

            //   console.log("a:" + base64);

            var q = base64
            wx.showLoading({
                title: '识别中...',
                mask: true
            })
            wx.request({
                url: 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=nwcBkKtZpezo8bMb1ex5wkiZ&client_secret=GHfFw3AHFUuqK5s2eDLWEAkFpoiyijDG',
                success: (res) => {
                    //   console.log(res.data.access_token);
                    access_token = res.data.access_token
                    // console.log(access_token);

                    url = url + access_token
                    console.log("模式:精度模式");
                    console.log("手写开关:" + that.data.isHand);
                    console.log("请求的URL:" + url);
                    wx.request({
                        url: url,
                        method: "POST",
                        header: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        data: {
                            image: encodeURI(q)
                        },
                        success: (res) => {
                            console.log(res);
                            var errorCode = res.data.error_code;
                            if(errorCode != null) {
                                wx.showModal({
                                    title: '识别错误',
                                    content: res.data.error_msg,
                                    showCancel: false
                                })
                                return;
                            }
                            

                            that.setData({
                                content: res.data.words_result
                            })
                            for (var index = 0; index < that.data.content.length; index++) {
                                strWithN = strWithN + that.data.content[index].words + " \n "
                                strWithoutN = strWithoutN + that.data.content[index].words
                            }
                            console.log("有换行:" + strWithN);
                            console.log("无换行:" + strWithoutN);
                            if ((strWithN && strWithoutN == "") || res.data.words_result_num == 0) {
                                wx.showModal({
                                    title: 'Ooops 有问题',
                                    content: '识别内容为空, 请再次尝试。如果多次尝试均有此提示, 请联系开发者',
                                    showCancel: false
                                })
                                return
                            }
                            wx.setStorage({
                                key: 'strWithN',
                                data: strWithN,
                                success: (res) => {
                                    // console.log(res);
                                },
                                fail: (res) => {
                                    console.log(res);
                                },
                                complete: (res) => {}
                            })
                            wx.setStorage({
                                key: 'strWithoutN',
                                data: strWithoutN,
                                success: (res) => {
                                    // console.log(res);
                                },
                                fail: (res) => {
                                    console.log(res);
                                },
                                complete: (res) => {}
                            })
                            wx.navigateTo({
                                url: '/pages/ocrresult/ocr',
                            })
                        },
                        fail: (res) => {
                            console.log(res);
                            fundebug.notifyError(res);
                        },
                        complete: (res) => {
                            wx.hideLoading()
                        }
                    })

                },
                fail: (res) => {
                    console.log(res);
                    fundebug.notifyError(res);
                },
                complete: (res) => {}
            })
        },
        fail: (res) => {
            console.log(res);
        },
        complete: (res) => {}
    })


},

baidu: function() {
    console.log("进入baidu");
    var url
    var strWithN = ""
    var strWithoutN = ""
    var base64
    var that = this
    if (that.data.isHand == true) {
        console.log("跳转手写");
        that.baidu_accu()
        return
    } else {
        var language_type = ""
        wx.getStorage({
            key: 'engine',
            success: function(res) {
                language_type = res.data
                console.log("语言:" + language_type);
            },
        })
        //   console.log(that.data.picUrl);
        var a = wx.getFileSystemManager()
        url = "https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token="
        a.readFile({
            filePath: that.data.image,
            encoding: "base64",
            success: (res) => {
                // console.log(res);
                base64 = res.data

                //   console.log("a:" + base64);

                var q = base64
                wx.request({
                    url: 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=nwcBkKtZpezo8bMb1ex5wkiZ&client_secret=GHfFw3AHFUuqK5s2eDLWEAkFpoiyijDG',
                    success: (res) => {
                        //   console.log(res.data.access_token);
                        access_token = res.data.access_token
                        // console.log(access_token);
                        wx.showLoading({
                          title: '识别中...',
                          mask: true
                        })
                        url = url + access_token
                        console.log("模式:通用模式");
                        console.log("手写开关:" + that.data.isHand)
                        console.log("请求的URL:" + url);
                        wx.request({
                            url: url,
                            method: "POST",
                            header: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            },
                            data: {
                                image: encodeURI(q),
                                language_type: language_type,
                                // detect_direction:'true',
                                detect_language: 'true'
                            },
                            success: (res) => {
                                console.log(res);
                                
                                that.setData({
                                    content: res.data.words_result
                                })
                                for (var index = 0; index < that.data.content.length; index++) {
                                    strWithN = strWithN + that.data.content[index].words + " \n "
                                    var s1 = that.data.content[index].words[that.data.content[index].words.length-1]  
                                    console.log(s1);
                                    if((s1>='a'&&s1<='z')||s1==','||s1=='.'||s1=='?'||s1=="!") {
                                        // console.log("s!");
                                        strWithoutN = strWithoutN + that.data.content[index].words+" "
                                    } else{
                                    strWithoutN = strWithoutN + that.data.content[index].words
                                    }
                                }
                                console.log("有换行:" + strWithN);
                                console.log("无换行:" + strWithoutN);
                                if ((strWithN && strWithoutN == "") || res.data.words_result_num == 0) {
                                    wx.showModal({
                                        title: 'Ooops 有问题',
                                        content: '识别内容为空, 请再次尝试。如果多次尝试均有此提示, 请联系开发者',
                                        showCancel: false
                                    })
                                    return
                                }

                                wx.setStorage({
                                    key: 'strWithN',
                                    data: strWithN,
                                    success: (res) => {
                                        // console.log(res);
                                    },
                                    fail: (res) => {
                                        console.log(res);
                                    },
                                    complete: (res) => {}
                                })
                                wx.setStorage({
                                    key: 'strWithoutN',
                                    data: strWithoutN,
                                    success: (res) => {
                                        // console.log(res);
                                    },
                                    fail: (res) => {
                                        console.log(res);
                                    },
                                    complete: (res) => {}
                                })
                                wx.navigateTo({
                                    url: '/pages/ocrresult/ocr',
                                })
                            },
                            fail: (res) => {
                                console.log(res);
                            },
                            complete: (res) => {
                              wx.hideLoading()
                            }
                        })

                    },
                    fail: (res) => {
                        console.log(res);
                    },
                    complete: (res) => {}
                })
            },
            fail: (res) => {
                console.log(res);
            },
            complete: (res) => {
                // wx.hideLoading()
            }
        })

    }
},

  submit() {
    this.cropper.getImg((obj) => {
      var that = this;
      // wx.showLoading({
      //   title: '识别中...',
      //   mask: true
      // })
      console.log(obj.url);
      //点击裁剪框阅览图片
      // wx.previewImage({
      //     current: e.detail.url, // 当前显示图片的http链接
      //     urls: [e.detail.url] // 需要预览的图片http链接列表
      // })
      that.setData({
        src:obj.url,
        image:obj.url
      })
      wx.setStorageSync('pic', obj.url);
      wx.getStorage({
        key: 'isAccu',
        success: function (res) {
            console.log("D6");
            console.log("getStorage(isAccu):" + res.data);
            if (res.data == false) {
                console.log("是否精度模式?:" + res.data);
                console.log("调用that.baidu()");
                that.baidu()
            } else if (res.data == true) {
                console.log("是否精度模式?:" + res.data);
                console.log("调用that.baidu_accu()");
                that.baidu_accu()
            }
        }
    })
    });
  },

})