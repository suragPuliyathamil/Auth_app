const express = require("express")
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { cleanUpandValidate } = require('./utils/authUtils');
const {formSchema} = require('./formModel');
const {uri} = require('./privateConstants');
const PORT =3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.set('view engine','ejs');

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then((res)=>{
    console.log("Connected to database")
}).catch((error)=>{
    console.log("Something went wrong")
})

app.listen(PORT,()=>{
    console.log(`Running server on ${PORT}`)
})

app.get('/',(req,res)=>{
    return res.send("Homepage ")
})

app.get('/login',async (req,res)=>{
    return res.render('login')
})

app.get('/register',async (req,res)=>{
    return res.render('register')
})

app.post('/login',async (req,res)=>{
    try {
        const {username, uassword} = req.body;
        const obj = {};
        obj["username"]=username;
        const data = await formSchema.find(obj);
        
        // Add Login verification 
        
        return res.send({
            status:200,
            message : "Login Successfull",
            data : data
        })

    } catch (error) {
        return res.send({
            status:400,
            message : "login Failed",
            data : error
        })
    }
});

app.post('/register',async (req,res)=>{
    try {
        const {name, username, password, email} = req.body;
        
        cleanUpandValidate({name, username, password, email}).catch(
            (err)=>{
                return res.send({
                    status:400,
                    message: "Invalid Data",
                    error: err
                })}
        );

        // try {
        //     await cleanUpandValidate({name, username, password, email});
        // } catch (err) {
        //     return res.send({
        //         status:400,
        //         message: "Invalid Datas",
        //         error: err
        //     })
        // };

        const hashedPassword = await bcrypt.hash(password,23);
        console.log(hashedPassword);

        let formData = new formSchema({name, username, password, email});

        let formdb = await formData.save();

        return res.send({
            status:200,
            message : "Registration Successfull",
            data : formdb
        })

    } catch (error) {
        return res.send({
            status:400,
            message : "Registration Failed",
            data : error
        })
    }
})
