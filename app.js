// Importing Frameworks
const express = require("express")
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

// Importing Utilities
const { cleanUpandValidate } = require('./utils/authUtils');

// Importing Models
const {formSchema} = require('./models/formModel');
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
        const {loginId, password} = req.body;
        let data ={};
        if(validator.isEmail(loginId)){
             data = await formSchema.findOne({email:loginId});
        }
        else{
             data = await formSchema.findOne({username:loginId});
        }

        if(data=={}){
            return res.send({
                status:400,
                message:"User Not Found",
                error : {}
            })
        }
        console.log(data)

        const isMatch = await bcrypt.compare(password,data.password);
        if(!isMatch){
                return res.send({
                    status:200,
                    message : "Login Successfull",
                    data : data
                })
        }
        else{
                return res.send({
                    status:400,
                    message : "Login Failed",
                    error : err
                })
            }

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
        
        // cleanUpandValidate({name, username, password, email}).catch(
        //     (error)=>{
        //         return res.send({
        //                     status:400,
        //                     message: "Invalid Data",
        //                     error: error
        //                 })
        //     }
        // );

        try {
            await cleanUpandValidate({name, username, password, email});
        } 
        catch(err) {
            return res.send({
                status:400,
                message: "Invalid Data",
                error: err
            })
        };

        const hashedPassword = await bcrypt.hash(password,5);
        let formData = new formSchema({name, username, password:hashedPassword, email});
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
