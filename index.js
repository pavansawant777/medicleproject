let express=require('express');
let app=express();
let admin=require('./routes/admin');
app.use("/",admin);
app.listen(1001);