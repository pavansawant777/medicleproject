let express=require('express');
let app=express();
let admin=require('./routes/admin');
app.use(express.static("public/"));
app.use("/",admin);
app.listen(1001);