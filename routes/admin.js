let express=require('express');
let route=express.Router();

var exe = require("./connection.js")

function checkAdmin(req,res,next){
   console.log(req.session.uid);
if(req.session.uid){
next();
}
else{
    res.redirect("/login");
}
}



route.get("/login",(req,res)=>{
    let obj={
        "warn":''
    }
    res.render("admin/l.ejs",obj);
})

route.post("/user-login",async(req,res)=>{
    let d=await exe(`select*from userlogin where username='${req.body.username}' and password='${req.body.password}' `);


    if(d.length==0){
        let obj={
"warn":'Wrong username or password'
        }
        res.render('admin/l.ejs',obj)
    }
    else{
        req.session.uid=d[0].id;
        res.redirect("/");
    }
})


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
    req.session.uid=undefined;
    res.redirect("/login");
})
    


module.exports=route;