/**
 * Describe: md5
 * Created by ZhuYuan on 2017-03-23 13:13
 */
var crypto = require("crypto");
module.exports = function(mingma){
    var md5 = crypto.createHash('md5');
    return md5.update(mingma).digest('base64');
}