const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs")
const jwt = require("jsonwebtoken");
const { User, Product } = require("./database");
require("dotenv").config();

const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000"
}));

app.post("/signup", async (req,res) => {
    const { name, phone, email, password } = req.body;
    const admin = false
    const saveData = new User({name, phone, email, password, admin});
    const data = await saveData.save();

    if(data) {
        res.status(200).json({msg: "Data sent"})
    }
})

app.post("/login", async (req,res) => {
    const { email,password } = req.body;

    const checkUser = await User.findOne({email})
    if(!checkUser) {
        res.status(500).json({msg: "Not registered"})
    }
    else if(password != checkUser.password){
        res.status(500).json({msg: "Invalid Password"})
    }
    else{
        const token = jwt.sign(
            {name: checkUser.name, phone: checkUser.phone ,email: checkUser.email, password: checkUser.password, admin: checkUser.admin},
            "secret123")
        res.status(500).json({msg: checkUser, token: token})
    }
})

app.get("/home", async (req,res) => {
    const token = req.headers.authorization;
    // console.log(token)
    if(token) {
        const verifyToken = jwt.verify(token, "secret123", (err,user) => {
            if(user) {

                res.status(200).json({user})
            }
        });
    }
})

app.get("/products", async (req,res) => {
    const getData = await Product.find().sort({_id: -1});
    if(getData) {
        res.status(200).json({data: getData})
    }
    else{
        res.json("error")
    }
})

// app.get("/view/:id", async (req,res) => {
//     const id = req.params.id;
//     const getData = await Product.find({_id: id});
//     if(getData) {
//         res.status(200).json({data: getData})
//     }
// })

app.post("/admin", async (req,res) => {
    const { name, description, costprice, sellingprice, category, gender, img1, img2, img3, img4 } = req.body;

    const newData = new Product({name, description, costprice, sellingprice, category, gender, img1, img2, img3, img4});
    const saveData = await newData.save();

    if(saveData) {
        res.status(200).json({msg: "inserted!"})
    }
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})