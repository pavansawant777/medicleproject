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
    var ttl = await exe(`select count(*) as ttlcount from customer`)
    var ttp = await exe(`select count(*) as ttlparty from vendor`)

    var obj={"img":img[0],"ttl":ttl[0],"ttp":ttp[0]}

  

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



route.get("/addcustomer",checkAdmin,async function(req,res){
    var img = await exe(`select * from userlogin `)

    var obj={"img":img[0]}
    res.render("admin/addcustomer.ejs",obj)
})


route.post("/save-customer", async function(req,res){
    var d= req.body

    var sql = `insert into customer(cname,cemail,ccontact,cadd)values('${d.cname}','${d.cemail}','${d.ccontact}','${d.cadd}')`

    var data = await exe(sql);

    res.redirect("/addcustomer")
})

route.get("/allcustomer",checkAdmin,async function(req,res){
    var img = await exe(`select * from userlogin `)
    var clist = await exe(`select * from customer`)

    var obj={"img":img[0],"clist":clist}
    res.render("admin/customer_list.ejs",obj)
})


route.get("/delete-customer/:id",async function(req,res){
    // var sql = `delete from customer where cid = '${req.params.id}'`
    var data = await exe(`delete from customer where cid='${req.params.id}'`)

    res.redirect("/allcustomer")

})

route.get("/show-customer/:id", checkAdmin ,async function(req,res){

    var data = await exe(`select * from customer where cid ='${req.params.id}'`)

    var img = await exe(`select * from userlogin`)

    var obj = {"img":img[0],"data":data[0]}

    res.render("admin/viewcustomer.ejs",obj)


})

route.post("/update-customer/:id",async function(req,res){
var d = req.body
    var data = await exe(`update customer set cname = '${d.cname}',cemail = '${d.cemail}',ccontact = '${d.ccontact}',cadd = '${d.cadd}' where cid ='${req.params.id}'`)
    res.redirect("/allcustomer")
})
route.get("/addpurchase",checkAdmin,async(req,res)=>{
    var img = await exe(`select * from userlogin`)
    let ven=await exe(`select*from vendor`);
    var obj = {"img":img[0],"v":ven}
res.render("admin/purchase.ejs",obj);
})
route.post("/save-purchase",async(req,res)=>{
  
    let x=req.body;
    for(let i=0;i<x.pname.length;i++){
        let d=await exe(`insert into product(pname,packing,batchid,exp,qty,mrp,rate,amt,adddate,isexpired) values('${x.pname[i]}','${x.packing[i]}','${x.bid[i]}','${x.exp[i]}','${x.qty[i]}','${x.mrp[i]}','${x.rate[i]}','${x.amt[i]}','${new Date().toISOString().slice(0,10)}','${false}')`);
    }
    res.send(true);


})
route.get("/all-purchases",checkAdmin,async(req,res)=>{
    var img = await exe(`select * from userlogin`)
    let p=await exe(`select*from product`);
    var obj = {"img":img[0],"p":p};
    res.render("admin/purchaselist.ejs",obj);
})
route.get("/delete-product/:id",checkAdmin,async(req,res)=>{
let d=await exe(`delete from product where id='${req.params.id}'`)
res.redirect("/all-purchases");
})






module.exports=route;