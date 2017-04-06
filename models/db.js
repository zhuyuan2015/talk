/**
 * mongoDB 增删改查方法
 * Created by nows on 2017/3/14.
 */

var mongoClient = require('mongodb').MongoClient;
var setting = require("../setting.js");

var l = function (n){
    console.log(n);
}

/**
 * 连接 mongoDB
 * @param callback
 * @private
 */
function _connectMd(callback){
    var url = setting.dbUrl;
    mongoClient.connect(url,function(err,db){
        if(err){
            l("mongoDB 连接失败");
            return;
        }
        l("mongoDB 连接成功");
        callback(err,db);
    });
}

/**
 * 建立索引
 */
init();
function init(){
    _connectMd(function(err,db){
        db.collection("user").createIndex({"username":1}, null,function(err,result){
            if(err){
                l("索引建立失败");
                return;
            }
            l("索引建立成功");
        });
    });
}

/**
 * 增加数据
 * @param obj
 */
exports.insertOne = function (obj){
    _connectMd(function(err,db){
        db.collection(obj.name).insertOne(obj.json,function(err,result){
            if(err){
                obj.callback(true,null);
                db.close();
                return;
            }
            obj.callback(null,result);
            db.close();
        });
    });
}

/**
 * 删除多个匹配
 * @param obj
 */
exports.deleteMany = function (obj){
    _connectMd(function(err,db){
        var collection = db.collection(obj.name);
        collection.deleteMany(obj.json, function(err, result) {
            if(err){
                obj.callback(true,null);
                db.close();
                return;
            }
            obj.callback(null,result);
            db.close();
        });
    });
}

/**
 * 删除一个
 * @param obj
 */
exports.deleteOne = function (obj){
    _connectMd(function(err,db){
        var collection = db.collection(obj.name);
        collection.deleteOne(obj.json, function(err, result) {
            if(err){
                obj.callback(true,null);
                db.close();
                return;
            }
            obj.callback(null,result);
            db.close();
        });
    });
}

/**
 * 修改多个匹配
 * @param obj
 */
exports.updateMany = function (obj){
    _connectMd(function(err,db){
        var collection = db.collection(obj.name);
        collection.updateMany(obj.oldData,obj.newData,function(err,result){
            if(err){
                obj.callback(true,null);
                db.close();
                return;
            }
            obj.callback(null,result);
            db.close();
        });
    });
};

/**
 * 修改一个
 * @param obj
 */
exports.updateOne = function (obj){
    _connectMd(function(err,db){
        var collection = db.collection(obj.name);
        collection.updateOne(obj.oldData,obj.newData,function(err,result){
            if(err){
                obj.callback(true,null);
                db.close();
                return;
            }
            obj.callback(null,result);
            db.close();
        });
    });
};

/**
 * 查找
 * @param obj
 */
exports.find = function (obj){
    _connectMd(function(err,db){
        // 限制数量
        var pageAmount = obj.pageAmount == undefined ? 0 : obj.pageAmount;
        // 第几页
        var page = obj.page == undefined ? 0 : obj.page;
        // 省略数量
        var skip =  pageAmount * page;
        // 排序 1是正序,从小到大, -1为倒序 从大到小
        var sort = obj.sort == undefined ? {} : obj.sort;
        var collection = db.collection(obj.name).find(obj.json).limit(pageAmount).skip(skip).sort(sort);
        collection.toArray(function(err,result){
            if(err){
                obj.callback(true,null);
                db.close();
                return;
            }
            obj.callback(null,result);
            db.close();
        });
    });
}

/**
 * 得到数量
 * @param obj
 */
exports.getAllCount = function(obj){
    var condition = obj.condition == undefined ? {} : obj.condition;
    _connectMd(function(err,db){
        db.collection(obj.name).count(condition).then(function(result){
            obj.callback(result);
            db.close();
        });
    });
}

