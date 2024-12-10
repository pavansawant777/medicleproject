let express=require('express');
let route=express.Router();

var exe = require("./connection.js")

route.get("/",async(req,res)=>{
    res.render('admin/index.ejs');
})


module.exports=route;