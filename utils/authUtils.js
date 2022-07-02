const validator = require('validator');
const cleanUpandValidate = async ({name, username, password, email})=>{
    console.log({name, username, password, email});
    return new Promise((resolve,reject)=>{
        if(typeof(name) != 'string')
            reject('Invalid name');
        if(typeof(username) != 'string')
            reject('Invalid username');
        if(typeof(password) != 'string')
            reject('Invalid password');
        if(typeof(email) != 'string')
            reject('Invalid email');

        if(!name || !username || !password || !email)
            reject("Missing Data");

        if(!validator.isemail(email))
            reject("Invalid email");

        if(username.length < 3)
            reject("username too short");

        if(username.length > 25)
            reject("username too long ");

        if(password.length <3)
            reject('password too short');

        if(password.length > 25)
            reject("password too long");

        resolve();
        
    })
};

module.exports = {cleanUpandValidate};