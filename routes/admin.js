let express=require('express');
let route=express.Router();

var exe = require("./connection.js")
function checkAdmin(req,res,next){
    req.session.uid=1;
if(req.session.uid!=0){
next();
}
else{
    res.redirect("/");
}
}




route.get("/",checkAdmin,async(req,res)=>{
    var img = await exe(`select * from userlogin `)

    var obj={"img":img[0]}

  

    res.render('admin/index.ejs',obj);
})


route.get("/profile",checkAdmin,async(req,res)=>{
    let d=await exe('select * from userlogin');
    var img = await exe(`select * from userlogin `)

   

    let obj={
        "data":d[0],
        "img":img[0]
    }
    res.render("admin/addaccount.ejs",obj);
})

route.post("/update-user",async(req,res)=>{

    if(req.files != null){
        req.body.image=new Date().getTime()+req.files.img.name;
        req.files.img.mv("public/userimage/"+req.body.image);

        let d=await exe(`update userlogin set image='${req.body.image}' where id='1' `);

    }

    let d=await exe(`update userlogin set username='${req.body.username}',password='${req.body.password}' where id='1' `);
    res.redirect("/profile");



  
    
})


route.get("/logout",(req,res)=>{
    req.session.uid=0;
    res.redirect("/login");
})
    


module.exports=route;