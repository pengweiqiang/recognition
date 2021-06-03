// 获取优惠券列表
const cloud = require('wx-server-sdk')
const request = require('request')
const util = require('util')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {

  return new Promise((resolve, reject) => {
    let urlTpl = 'http://v2.api.haodanku.com/get_pdd_itemlist/apikey/%s/cat_id/%s/order/%s/back/20/min_id/%s'
    request(util.format(
      urlTpl,
      "D1E54665F5CC",
      event.category,
      event.sort,
      event.page), function (error, response, body) {
        console.log("min_id="+event.page)
      if (!error && response.statusCode == 200) {
        let responseBody = JSON.parse(body)
        let result = []

        responseBody.data.forEach(function (v, i, a) {
          if(v.itempic != '' && v.itempic != undefined) {
            result.push({
              itemId: v.goods_id,
              title: v.goodsname,
              shortTitle: v.goodsnameshort,
              picUrl: v.itempic,
              longPicUrl: v.pdd_image,
              introduction: v.goodsdesc,
              originalPrice: v.itemprice,
              presentPrice: parseFloat(v.itemendprice).toFixed(1),
              saleCount: parseInt(v.itemsale),
              couponId: v.coupon_id,
              couponsurplus: parseFloat(v.couponsurplus),
              couponPrice: v.couponmoney,
              couponStartTime: v.start_time.slice(0, 10),
              couponEndTime: v.end_time.slice(0, 10),
              isPdd: '拼多多'
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