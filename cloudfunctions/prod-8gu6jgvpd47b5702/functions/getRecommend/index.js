// 云函数入口文件
const cloud = require('wx-server-sdk')
const request = require('request')
const util = require('util')

cloud.init()


// 云函数入口函数
exports.main = async (event, context) => {

  return new Promise((resolve, reject) => {
    let urlTpl = 'https://www.mxnzp.com/api/daily_word/recommend?count=1&app_id=vtpkrsrcrhlkipxk&app_secret=dTRTSHNkVGZsTmFOMFZnVERPSVc0UT09'
    request(util.format(
      urlTpl), function (error, response, body) {
        if (!error && response.statusCode == 200) {
          let responseBody = JSON.parse(body)
          let result;
          if(responseBody.code == 1) {
            let randNum = Math.ceil(Math.random()*10);
            console.log("randNum"+randNum);
            if(randNum >= 6) {
              result = {
                "content":"小程序维护不易，点点广告↓↓↓观看几秒，非常感谢。",
                "author":'demo'
              }
            } else {
              result = responseBody.data[0];
            }
          }else { 
            result = "小程序维护不易，点点广告↓↓↓观看几秒，非常感谢。"
          }
          resolve(result)
        } else {
          reject()
        }
      })
  })
}