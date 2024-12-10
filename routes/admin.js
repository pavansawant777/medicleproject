let express=require('express');
let route=express.Router();

route.get("/",async(req,res)=>{
    res.render('admin/index.ejs');
})
module.exports=route;