let express=require('express');
let route=express.Router();

var exe = require("./connection.js")

function checkAdmin(req,res,next){
req.session.uid=1;
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
    
route.get("/add-party",checkAdmin,async(req,res)=>{
    var img = await exe(`select * from userlogin `)

    var obj={"img":img[0]}
    res.render("admin/addparty.ejs",obj);
})
route.post("/save-party",async(req,res)=>{
    

    let d=await exe(`insert into vendor(name,email,contact,ttl_purchases,website,contract_start,contract_end,contract_status) values('${req.body.name}','${req.body.email}','${req.body.contact}','${0}',
        '${req.body.website}','${new Date().toISOString().slice(0,10)}','${"null"}','${"active"}')`);
        res.redirect("/parties");
})
route.get("/parties",checkAdmin,async(req,res)=>{
    var img = await exe(`select * from userlogin `)
let d=await exe('select*from vendor');
let obj={
    "data":d,
    "img":img[0]
}
res.render("admin/vendorlist.ejs",obj);
})
route.get("/show-party/:id",checkAdmin,async(req,res)=>{
let d=await exe(`select*from vendor where id='${req.params.id}'`);
var img = await exe(`select * from userlogin `)
let obj={
    "data":d[0],
    "img":img[0]
}
res.render("admin/viewparty.ejs",obj);
})
route.post("/update-party/:id",async(req,res)=>{
  
   if(req.body.contract_status=='expire'){
    let d=await exe(`update vendor set name='${req.body.name}',email='${req.body.email}',contact='${req.body.contact}',website='${req.body.website}',contract_status='${req.body.contract_status}',contract_end='${new Date().toISOString().slice(0,10)}' where id='${req.params.id}'`);
   }
   else{
    let d=await exe(`update vendor set name='${req.body.name}',email='${req.body.email}',contact='${req.body.contact}',website='${req.body.website}' where id='${req.params.id}'`);

   }
   res.redirect("/show-party/"+req.params.id);
})
route.get("/delete-party/:id",checkAdmin,async(req,res)=>{
    let d=await exe(`delete from vendor where id='${req.params.id}'`);
    res.redirect("/parties");
})
module.exports=route;