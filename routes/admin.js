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
let expireMed=async()=>{
let med=await exe(`select*from product`);
for(let i of med){


let e=new Date(i.exp).getTime();
let n=new Date().getTime();
let es=e/1000;
let em=es/60;
let eh=em/60;
let ed=eh/24;

let ns=n/1000;
let nm=ns/60;
let nh=nm/60;
let nd=nh/24;
if(Math.floor(ed-nd)==0){
    let update=await exe(`update product set isExpired='${1}' where id='${i.id}'`);
    }
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
    expireMed();
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

    res.redirect("/allcustomer")
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
    let ven=await exe(`select*from vendor where contract_status='active'`);
    var obj = {"img":img[0],"v":ven}
res.render("admin/purchase.ejs",obj);
})
route.post("/save-purchase",async(req,res)=>{
  
    let x=req.body;
    let par=await exe(`select*from vendor where id='${x.vid}'`);
    let pcount=await exe(`update vendor set ttl_purchases=${par[0].ttl_purchases+1} where id='${x.vid}'`);
    for(let i=0;i<x.pname.length;i++){
        let d=await exe(`insert into product(pname,packing,batchid,exp,qty,mrp,rate,amt,adddate,isexpired,party) values('${x.pname[i]}','${x.packing[i]}','${x.bid[i]}','${x.exp[i]}','${x.qty[i]}','${x.mrp[i]}','${x.rate[i]}','${x.amt[i]}','${new Date().toISOString().slice(0,10)}','${false}','${req.body.vid}')`);
    }
    res.send(true);


})
route.get("/all-purchases",checkAdmin,async(req,res)=>{
    var img = await exe(`select * from userlogin`)
    let p=await exe(`select*,(select name from vendor where vendor.id=product.party) as party_name from product `);

    var obj = {"img":img[0],"p":p};
    res.render("admin/purchaselist.ejs",obj);
})
route.get("/delete-product/:id",checkAdmin,async(req,res)=>{
let d=await exe(`delete from product where id='${req.params.id}'`)
res.redirect("/all-purchases");
})

route.get("/sale-product",checkAdmin,async(req,res)=>{
    var img = await exe(`select * from userlogin`)
    let cust=await exe('select*from customer');
    let med=await exe(`select*from product where isExpired=${0}`)
    var obj = {"img":img[0],'c':cust,"med":med};
    res.render('admin/saleproduct.ejs',obj);
})
route.post("/save-bill",async(req,res)=>{
    let d=req.body;
    let b=await exe(`insert into bill(pdate,cid) values('${new Date().toISOString().slice(0,10)}','${d.cid}')`);


    for(let i=0;i<d.product.length;i++){
       let s=await exe(`insert into order_list(product,bid,mrp,qty,total,bill_id,up) values('${d.product[i]}','${d.bid[i]}','${d.mrp[i]}','${d.qty[i]}','${d.total[i]}','${b.insertId}','${d.up[i]}')`);
         let qt=await exe(`select * from product where id='${d.product[i]}' `);
         if(d.isPack[i]=='false'){         
         let uqty=await exe(`update product set qty='${((qt[0].packing.split(" ")[0]*qt[0].qty)-d.qty[i])/qt[0].packing.split(" ")[0]}' where id='${d.product[i]}'`);
        }
        else{
            let uqty=await exe(`update product set qty='${qt[0].qty-d.qty[i]}' where id='${d.product[i]}'`);
        }
    }
    let bd=await exe(`insert into bill_det(disc,ttl,net_ttl,pmtd,psts,pmny,rmny,bill_id) values('${d.discount}','${d.ttl_amt}','${d.net_ttl}','${d.pmtd}','${d.psts}','${d.pmny}','${d.rmny}','${b.insertId}')`);

    res.send(b.insertId+"");

})
route.get("/invoice/:id",checkAdmin,async(req,res)=>{

    let bill= await exe(`select* from bill where id='${req.params.id}'`);
    let cus=await exe(`select*from customer where cid='${bill[0].cid}'`)
    let med=await exe(`select*,(select pname from product where order_list.product=product.id)as pname,(select packing from product where order_list.product=product.id)as pack from order_list where bill_id='${req.params.id}'`);
    let det=await exe(`select*from bill_det where bill_id='${req.params.id}'`);
    var img = await exe(`select * from userlogin`)
    var obj = {"img":img[0],"cus":cus[0],'bill':bill[0],"med":med,'det':det[0]};
    res.render("admin/invoice.ejs",obj);

})
route.get('/bill-list',checkAdmin,async(req,res)=>{
let bill=await exe('select*,(select cname from customer where customer.cid=bill.cid) as cname,(select net_ttl from bill_det where bill_det.bill_id=bill.id) as ttl from bill');
var img = await exe(`select * from userlogin`)
var obj = {"img":img[0],'bill':bill};
res.render("admin/billlist.ejs",obj);
})
route.get("/delete-bill/:id",checkAdmin,async(req,res)=>{
    let b=await exe(`delete from bill where id='${req.params.id}'`);
    res.redirect("/bill-list");
})


route.get("/total-exp",checkAdmin,async(req,res)=>{

    let bill=await exe(`select *,(select net_ttl from bill_det where bill_det.bill_id=bill.id) as exp,(select cname from customer where customer.cid=bill.cid) as cname from bill`);

    let bar=[];
    let lastExp=0;
    let lastm=new Date().getMonth()-1;
    if(lastm<0){
        lastm=11;
    }
    let curExp=0;
for(let b of bill){
    if((new Date(b.pdate).getMonth())==(new Date().getMonth())){
        bar.push(b);
        curExp=Number(curExp)+b.exp;
    }
    else if(lastm==new Date(b.pdate).getMonth()){
        lastExp=Number(lastExp)+b.exp;
    }
 
 
}

var img = await exe(`select * from userlogin`)
let obj={
    'bill':bar,
    "img":img[0],
    "lastexp":lastExp,
    "curExp":curExp
}
res.render('admin/exptable.ejs',obj);
})
route.get("/total-purchase",checkAdmin,async(req,res)=>{
    let list=await exe(`select*,(select name from vendor where product.party=vendor.id) as vendor from product `);
    let bar=[];
    let lastExp=0;
    let lastm=new Date().getMonth()-1;
    if(lastm<0){
        lastm=11;
    }
    let curExp=0;
    for(let b of list){
        if((new Date(b.adddate).getMonth())==(new Date().getMonth())){
            bar.push(b);
            curExp=Number(curExp)+b.amt;
        }
        else if(lastm==new Date(b.adddate).getMonth()){
            lastExp=Number(lastExp)+b.amt;
        }
     
     
    }
    var img = await exe(`select * from userlogin`)
    let obj={
        'list':bar,
        "img":img[0],
        "lastexp":lastExp,
        "curExp":curExp
    }
    res.render('admin/purtable.ejs',obj);
})


module.exports=route;