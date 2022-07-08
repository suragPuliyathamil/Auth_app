// Importing Frameworks
const express = require("express")
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const session = require('express-session'); //Session in client
const MongoDBSession = require('connect-mongodb-session')(session); //Session in server

// Importing Utilities
const { cleanUpandValidate } = require('./utils/authUtils');

// Importing Models
const {formSchema} = require('./models/formModel');
const {uri} = require('./privateConstants');

const PORT =3000;
const app = express();

// middlewares - app.use(), app.get('/path',middleware1,middleware2,(req,res)=>{}) 

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.set('view engine','ejs');

const isAuth = (req,res,next)  => {
    if(req.session.isAuth)
        next(); // calls the next middleware function 
    else
        res.send({
            error : "You are not authorized to access this page"
        })
}

const databaseSession = new MongoDBSession({
    uri: uri,
    collection : 'sessionData'
})

app.use(session({
    secret:"Hello World",
    resave:false,
    saveUninitialized:false,
    store:databaseSession
}))

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
    res.send("Welcome to the App");
})

app.get('/home',isAuth,(req,res)=>{
    console.log(req.session)
    console.log(req.session.id)
    res.send(`
        <html>
            <head>
                <title>Homepage</title>
            </head>
            <body>
                <h1>Welcome to homepage</h1>
                <form action="/logout" method=POST>
                    <button type="submit">Logout</button>
                </form>

                <form action="/dashboard" method=GET>
                    <button type="submit">Dashboard</button>
                </form>

            </body>
        </html> 
    `);
})

app.get('/dashboard',isAuth,(req,res)=>{
    console.log(req.session)
    res.send("Welcome to the dashboard. All your data insights are here");
})

app.get('/login',async (req,res)=>{
    return res.render('login')
})

app.post('/logout', async (req,res)=>{
    
    req.session.destroy((err)=>{
        if(err) throw err;

        res.redirect('/')
    });
   
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
        req.session.isAuth= true;
        req.session.user = {username:data.username,email:data.email};

        if(!isMatch){
                // return res.send({
                //     status:200,
                //     message : "Login Successfull",
                //     data : data
                // })

                return res.redirect('/home');
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

        let dbusername = await formSchema.findOne({username});
        let dbemail = await formSchema.findOne({email});
        if(dbusername){
            return res.send({
                status:400,
                message: "Username already exists",
                error: {}
            })
        }
        if(dbemail){
            return res.send({
                status:400,
                message: "Email already exists",
                error: {}
            })
        }

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
