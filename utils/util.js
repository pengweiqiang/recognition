const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function js_date_time(unixtime) {
  if(unixtime == 0) {
    return "";
  }
  var date = new Date(unixtime);
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  var d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  var h = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  var minute = date.getMinutes();
  var second = date.getSeconds();
  minute = minute < 10 ? ('0' + minute) : minute;
  second = second < 10 ? ('0' + second) : second;
  return y + '-' + m + '-' + d + ' ' + h + ':' + minute;

}


const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

var common = {
  //生成随机字符串
  createNonceStr: function(){
    return Math.random().toString(36).substr(2, 15);
  },
  //生成时间戳
  getTimestamp: function(){
    return parseInt(new Date().getTime() / 1000) + ''
  },
  //字典升序排序
  sortAscii:function(dic){
    var sdic = Object.keys(dic).sort();
    var sortParam ='';
    for (var ki in sdic) {
      sortParam += sdic[ki] + "=" + encodeURIComponent(dic[sdic[ki]]) + "&";
    }
    //console.log(sortParam);
    return sortParam;
  },
  //获取ai.qq参数签名
  getAiqqSign:function(obj){
    return "123";
  }
}

module.exports = {
  formatTime: formatTime,
  js_date_time:js_date_time,
  common: common
}
