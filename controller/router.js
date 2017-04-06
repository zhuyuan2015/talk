/**
 * Describe: 路由控制
 * Created by ZhuYuan on 2017-03-17 23:27
 */
var formidable = require("formidable");
var sd = require("silly-datetime");
var fs = require("fs");
var path = require("path");
var gm = require("gm");
var db = require("../models/db.js");
var md5 = require("../models/nodeMD5.js");
var l = function (n) {
    console.log(n);
}

/**
 * 主页
 * @param req
 * @param res
 */
exports.showIndex = function(req,res){
    if (req.session.login == "1") {
        var username = req.session.username;
        var login = true;
    } else {
        var username = "";
        var login = false;
    }
    db.find({
        name: "user",
        json:{
            username: username
        },
        callback:function(err,result){
            if (result.length == 0) {
                var head = "default.jpg";
            } else {
                var head = result[0].head;
            }
            res.render("index",{
                login: login,
                username: username,
                head: head
            });
        }
    });
}

/**
 * 注册页
 * @param req
 * @param res
 */
exports.showRegist = function(req,res){
    res.render("regist",{
        login: req.session.login == 1 ? true : false,
        username: req.session.login == 1 ? req.session.username : "",
        head:""
    });
}

/**
 * 登陆页
 * @param req
 * @param res
 */
exports.showLogin = function(req,res){
    res.render("login",{
        login: req.session.login == 1 ? true : false,
        username: req.session.login == 1 ? req.session.username : "",
        head:""
    });

}

/**
 * 获取某个用户的说说
 * @param req
 * @param res
 */
exports.showUser = function(req,res){
    var user = req.params["user"];
    if (req.session.login == "1") {
        var username = req.session.username;
        var login = true;
    } else {
        var username = "";
        var login = false;
    }
    // 导航栏个人头像
    db.find({
        name: "user",
        json:{
            username: username
        },
        callback:function(err,result){
            if (result.length == 0) {
                var head = "default.jpg";
            } else {
                var head = result[0].head;
            }
            // 查找个人头像
            db.find({
                name: "user",
                json:{
                    username: user
                },
                callback:function(err,result){
                    if (result.length == 0) {
                        var userHead = "default.jpg";
                    } else {
                        var userHead = result[0].head;
                    }
                    // 查找个人说说
                    db.find({
                        name: "talk",
                        json:{
                            username: user
                        },
                        callback:function(err,result){
                            // 查找个用户头像
                            res.render("showUser",{
                                login: login,
                                username: username,
                                head: head,
                                user: user,
                                userHead: userHead,
                                content:result
                            });
                        }
                    });
                }
            });
        }
    });
}



/**
 * 获取全部用户
 * @param req
 * @param res
 */
exports.showUserList = function(req,res){
    if (req.session.login == "1") {
        var username = req.session.username;
        var login = true;
    } else {
        var username = "";
        var login = false;
    }
    // 导航栏个人头像
    db.find({
        name: "user",
        json:{
            username: username
        },
        callback:function(err,result){
            if (result.length == 0) {
                var head = "default.jpg";
            } else {
                var head = result[0].head;
            }
            //查找全部用户
            db.find({
                name: "user",
                json: {},
                callback:function(err,result2){
                    res.render("userList",{
                        login: login,
                        username: username,
                        head: head,
                        user: result2
                    });
                }
            });
        }
    });
}

/**
 * 注册
 * @param req
 * @param res
 */
exports.doRegist = function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(req,function(err,fields,files){
        if(err){
            res.json({"result":false,"info":"表单接收失败"});
            return;
        }
        var username = fields.username;
        db.find({
            name:"user",
            json:{
                username:username
            },
            callback:function(err,result){
                if(result.length){
                    res.json({"result":false,"info":"注册失败,用户名已经被注册"});
                }else{
                    var datetime = sd.format(new Date(),"YYYY-MM-DD HH:mm:ss");
                    db.insertOne({
                        name: "user",
                        json:{
                            username: username,
                            password: md5(md5(fields.passrod).substr(1,5) + md5(fields.passrod)),
                            head: "default.jpg",
                            datetime: datetime
                        },
                        callback:function(err,result){
                            if(err){
                                res.json({"result":false,"info":"注册失败,服务器错误"});
                            }
                            req.session.login = 1;
                            req.session.username = username;
                            res.json({"result":true,"info":"注册成功"});
                        }
                    });
                }
            }
        });
    });
}

/**
 * 登陆
 * @param req
 * @param res
 */
exports.doLogin = function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(req,function(err,fields,files){
        if(err){
            res.json({"result":false,"info":"表单接收失败"});
            return;
        }
        var username = fields.username;
        var password = md5(md5(fields.passrod).substr(1,5) + md5(fields.passrod));
        db.find({
            name:"user",
            json:{
                username: username,
                password: password
            },
            callback:function(err,result){
                if(result.length > 0){
                    req.session.login = 1;
                    req.session.username = username;
                    res.json({"result":true,"info":"登陆成功"});
                }else{
                    res.json({"result":false,"info":"登陆失败,账号或者密码错误"});
                }
            }
        });
    });
}

/**
 * 头像编辑
 * @param req
 * @param res
 */
exports.doHead = function(req,res){
    var username = req.session.username;
    if(username == undefined){
        res.json({"result":false,"info":"请登陆后上传"});
        return;
    }
    var form = new formidable.IncomingForm();
    form.uploadDir = path.normalize(__dirname + "/../temp_uploads");
    form.parse(req,function(err,fields,files,next){
        if(err){
            next();
            return;
        }
        var extname = path.extname(files.avatar_file.name);
        // 临时存放的文件路径
        var alterPath = files.avatar_file.path;
        var newPath =  path.normalize(__dirname + "/../head/" + req.session.username + extname);
        fs.rename(alterPath,newPath,function(err){
            if(err){
                res.json({"result":false,"info":"上传改名失败"});
                return;
            }
            var head = req.session.username + extname;
            var headParam = JSON.parse(fields.avatar_data);
            var width = parseInt(headParam.width);
            var height = parseInt(headParam.height);
            var x = parseInt(headParam.x);
            var y = parseInt(headParam.y);
            // 裁剪 坐标: 宽 高 X Y
            gm("./head/" + head).crop(width,height, x, y).resize(100,100, "!").write("./head/" + head, function(err) {
                if (err) {
                    res.json({ "result": "/head/default.jpg", "info": "头像修改失败" });
                    return;
                }
                db.updateOne({
                    name:"user",
                    oldData:{
                        username: username,
                    },
                    newData:{
                        $set:{
                            head: head
                        }
                    },
                    callback:function(err,result){
                        if(err){
                            res.json({ "result": "/head/default.jpg", "info": "头像修改失败" });
                            return;
                        }
                        res.json({"result":"/head/" + head,"info":"头像修改成功"});
                    }
                });
            });
        });
    });
}

/**
 * 提交说说
 * @param req
 * @param res
 */
exports.doTalk = function(req,res){
    var username = req.session.username;
    if(username == undefined){
        res.json({"result":false,"info":"请登陆后发表说说"});
        return;
    }
    var form = new formidable.IncomingForm();
    form.parse(req,function(err,fields,files){
        if(err){
            res.json({"result":false,"info":"表单接收失败"});
            return;
        }
        var datetime = sd.format(new Date(),"YYYY-MM-DD HH:mm:ss");
        db.insertOne({
            name: "talk",
            json:{
                username: username,
                datetime: datetime,
                content: fields.content,
            },
            callback:function(err,result){
                if(err){
                    res.json({"result":false,"info":"说说发表失败"});
                    return;
                }
                res.json({
                    "result":true,
                    "datetime":datetime,
                    "info":"说说发表成功"
                });
            }
        });
    });
}

/**
 * 获取说说 默认10条 最新时间排序
 * @param req
 * @param res
 */
exports.getTalk = function (req, res) {
    var page = parseInt(req.query.page);
    db.find({
        name: "talk",
        json: {},
        pageAmount: 10,
        page: page,
        sort:{
            datetime: -1
        },
        callback:function(err,result){
            if(err){
                res.json({"result":false,"info":"说说获取失败"});
                return;
            }
            res.json({"result":result,"info":"说说获取成功"});
        }
    });
}

/**
 * 得到用户资料
 * @param req
 * @param res
 */
exports.getUser = function (req, res) {
    var username = req.query.username;
    db.find({
        name: "user",
        json: {
            username: username
        },
        callback:function(err,result){
            if(err){
                res.json({"result":false,"info":"用户资料获取失败"});
                return;
            }
            var obj = {
                _id: result[0]._id,
                username: result[0].username,
                head: result[0].head
            }
            res.json({"result":obj,"info":"用户资料获取成功"});
        }
    });
}

/**
 * 获取数量
 * @param req
 * @param res
 */
exports.talkPage = function(req,res){
    db.getAllCount({
        name: "talk",
        callback:function(result){
            res.json({"result":result,"info":"说说数量"});
        }
    });
}
