// 获取优惠券列表
const cloud = require('wx-server-sdk')
const request = require('request')
const util = require('util')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const config = await cloud.callFunction({
    name: 'getExtConf'
  })

  return new Promise((resolve, reject) => {
    let urlTpl = 'https://api.taokezhushou.com/api/v1/search?app_key=%s&q=%s&sort=%s&page=%s'
    var query = event.query;
    if(query.indexOf("淘宝") != -1) {
        query = "精选";
    }
    request(encodeURI(util.format(
      urlTpl,
      config.result.TKZS_APP_KEY,
      query,
      event.sortValue,
      event.page)), function (error, response, body) {
        if (!error && response.statusCode == 200) {
          let responseBody = JSON.parse(body)
          let result = []

          responseBody.data.forEach(function (v, i, a) {
            if(v.goods_short_title.indexOf("会员") == -1 && v.goods_title.indexOf("会员") == -1){
              result.push({
                itemId: v.goods_id,
                title: v.goods_title,
                shortTitle: v.goods_short_title,
                picUrl: v.goods_pic.indexOf("img.alicdn.com") > 0 ? (v.goods_pic+"_300x300.jpg") : v.goods_pic,
                longPicUrl: v.goods_long_pic,
                introduction: v.goods_intro,
                originalPrice: parseFloat(v.goods_price).toFixed(1),
                presentPrice: (parseFloat(v.goods_price) - parseFloat(v.coupon_amount)).toFixed(1),
                saleCount: parseInt(v.goods_sale_num),
                couponId: v.coupon_id,
                couponApplyPrice: parseFloat(v.coupon_apply_amount).toFixed(1),
                couponPrice: parseInt(v.coupon_amount),
                couponStartTime: v.coupon_start_time.slice(0, 10),
                couponEndTime: v.coupon_end_time.slice(0, 10),
                isTmall: v.is_tmall,
                isJHS: v.juhuasuan,
                isTQG: v.taoqianggou
              })
            }
            
          })

          resolve(result)
        } else {
          reject()
        }
      })
  })
}