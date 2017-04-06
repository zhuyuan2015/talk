/**
 * Describe: 项目入口
 * Created by ZhuYuan on 2017-03-17 23:23
 */

var express=require("express");
var session = require("express-session");
var app=express();
var router=require("./controller");

var l = function (n){
    console.log(n);
}

//session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

//静态路径
app.use(express.static("./public"));
app.use("/head",express.static("./head"));

//模版
app.set("view engine","ejs");

//路由表
app.get("/",router.showIndex);
app.get("/showRegist",router.showRegist);
app.get("/showLogin",router.showLogin);
app.get("/showUser/:user",router.showUser);
app.post("/doRegist",router.doRegist);
app.post("/doLogin",router.doLogin);
app.post("/doHead",router.doHead);
app.post("/doTalk",router.doTalk);
app.get("/getTalk",router.getTalk);
app.get("/getUser",router.getUser);
app.get("/talkPage",router.talkPage);
app.get("/userList",router.showUserList);
app.listen(3000);

l(new Date());
