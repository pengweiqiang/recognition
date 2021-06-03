// 云函数入口文件
const cloud = require('wx-server-sdk')
const request = require('request')
const util = require('util')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  // const config = await cloud.callFunction({
  //   name: 'getExtConf'
  // })

  return new Promise((resolve, reject) => {
    var name = encodeURI(encodeURI(event.name));
    console.log();
    var minId = event.page;
    if(minId == undefined || minId == null) {
      minId = 1;
    }
    let urlTpl = 'http://v2.api.haodanku.com/pdd_goods_search?apikey=D1E54665F5CC&min_id='+minId+'&keyword='+name;
    console.log(urlTpl);
    request(urlTpl,function (error, response, body) {
        if (!error && response.statusCode == 200) {
          let responseBody = JSON.parse(body)
          let result = []
            responseBody.data.forEach(function (v, i, a) {
              if(v.goodsnameshort.indexOf("会员") == -1){
              result.push({
                itemId: v.goods_id,
                title: v.goodsname,
                shortTitle: v.goodsnameshort,
                picUrl: v.itempic,
                longPicUrl: v.pdd_image==''?v.itempic:v.pdd_image,
                introduction: v.goodsdesc,
                originalPrice: v.itemprice,
                presentPrice: parseFloat(v.itemendprice).toFixed(1),
                saleCount: v.itemsale,
                couponId: v.coupon_id,
                couponsurplus: v.couponsurplus,
                couponPrice: v.couponmoney,
                couponStartTime: v.couponstarttime,
                couponEndTime: v.couponendtime,
                isPdd: '拼多多'
              })
            }
            })
            resolve(result)
        } else {
          console.log(error);
          reject()
        }
      })
  })
}