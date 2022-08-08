const userModel = require("../models/userModel");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRound = 10;

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false; 
    return true;
};

//-------------------------------------------------Register User----------------------------------------------------------//

const userRegister = async function(req, res){
    try{
        if(Object.keys(req.body).length == 0){
            return res.status(400).send({status: false, msg: "Enter valid data in req body"});
        }

        let data = req.body;

        let {fname, lname, email, phone, password, address} = data;

        if(!isValid(fname)){
            return res.status(400).send({ status: false, msg: "first Name is required" });
        }
        if(!isValid(lname)){
            return res.status(400).send({status: false, msg: "Last name is required"});
        }
        data.email = data.email.trim()
        if (!/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(data.email)){
          return res.status(400).send({ status: false, msg: "email ID is not valid" });
        }
        let dupEmail = await userModel.findOne({ email: email });
        if (dupEmail){ 
            return res.status(400).send({ status: false, msg: "email is already registered" });
        }
        if (!/^[6-9]\d{9}$/.test(phone)) {
            return res.status(400).send({status: false,message: "phone number is required",});
        }
        let dupPhone = await userModel.findOne({ phone: phone });
        if (dupPhone) {
            return res.status(400).send({ status: false, msg: "phone is already registered" });
        }
        if(!/^(?=.*?[A-Z].*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s].*?[^\w\s])(?=.*?[^\w\s]).{8,}$/.test(password)){
            return res.status(400).send({status: false, msg: "Password should contain atleast 2 capital letter, 2 special character, 1 number"})
        }
        data.password = await bcrypt.hash(password, saltRound);
        if(!address){
        return res.status(400).send({status:false,msg:'enter the address'})
        }
        if(!isValid(address.city)) 
            return res.status(400).send({status:false,msg:'enter the shipping address city'})

        if(!isValid(address.street)){
            return res.status(400).send({status:false,msg:'enter the shipping address street'})
        }
        if(!address.pincode) {
            return res.status(400).send({status:false,msg:'enter the shipping address pincode'})
        }
        if (!/^[1-9][0-9]{5}$/.test(address.pincode)){
        return res.status(400).send({status: false,message: "Please enter valid Pincode for shipping",}); 
        }

       const createUser = await userModel.create(data)
       return res.status(201).send({ status: true, msg: "Created succesfully", data: createUser });
    }
    catch(error){
        return res.status(500).send({status: false, msg: error.message})
    }
}
module.exports.userRegister = userRegister




//-----------------------------------------------User Login---------------------------------------------------------------//

const userLogin = async function(req, res) {
    try {
        const data = req.body;
        if (Object.keys(data) == 0) {
            return res.status(400).send({ status: false, message: "Please enter your login credentials" })
        }
        
        const { email, password } = data;

        if (!isValid(data.email)) {
            return res.status(400).send({ status: false, message: 'Email Id is required' })
        }

        if (!isValid(data.password)) {
            return res.status(400).send({ status: false, message: 'Password is required' })
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).send({ status: false, message: `Login failed! email id is incorrect.` });
        }

        let Password = user.password
        const encryption = await bcrypt.compare(password, Password) //Comparing normal password to the hashed password.

        if (!encryption) {
        return res.status(401).send({ status: false, message: `Login failed! password is incorrect.` });
        }
        const userId = user._id
        const token = jwt.sign({
            userId: userId,
            iat: Math.floor(Date.now() / 1000), 
            exp: Math.floor(Date.now() / 1000) + 3600 * 6 * 7 
        }, 'Secrete-key')

        return res.status(200).send({status: true, message: "User Login Successfull ", data: { userId, token}});
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}
module.exports.userLogin = userLogin

