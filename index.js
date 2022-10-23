const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs")
const jwt = require("jsonwebtoken");
const { User, Product, Order } = require("./database");
const path = require("path")
require("dotenv").config({path: "./config.env"});

const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors(
    // origin: "http://localhost:3000"
));

app.post("/signup", async (req,res) => {
    const { name, phone, email, password } = req.body;
    const findUser = await User.findOne({email})
    if(findUser){
        res.status(500).json({msg: "You are already registered"})
    }
    else{
        const saveData = new User({name, phone, email, password});
        const data = await saveData.save();
        
        if(data) {
            res.status(200).json({msg: "Data sent"})
        }
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
            {_id: checkUser._id, name: checkUser.name, phone: checkUser.phone ,email: checkUser.email, password: checkUser.password, admin: checkUser.admin, cart: checkUser.cart, orders: checkUser.orders},
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

app.get("/getusers", async (req,res) => {
    const getData = await User.find({});
    if(getData) {
        res.status(200).json(getData)
    }
})

app.post("/admin", async (req,res) => {
    const { name, description, costprice, sellingprice, mrp, category, gender, img1, img2, img3, img4, img5, img6, img7, img8, linkToProduct } = req.body;

    const newData = new Product({name, description, costprice, sellingprice, mrp, category, gender, img1, img2, img3, img4, img5, img6, img7, img8, linkToProduct});
    const saveData = await newData.save();

    if(saveData) {
        res.status(200).json({msg: "inserted!"})
    }
})

app.post("/edit/:id", async (req,res) => {
    const id = req.params.id;
    const { name, costprice, sellingprice, img1, img2, img3, img4 } = req.body;
    const update = await Product.updateOne({_id: id}, {$set: {name, costprice, sellingprice, img1, img2, img3, img4}})

    if(update){
        res.json({msg: "Updated"})
    }
})

app.get("/allproducts/:category/:gender/:filter", async(req,res) => {
    const category = req.params.category;
    const gender = req.params.gender;
    const filter = req.params.filter;
    
    let findProduct;
    if(gender === "male" || gender === "female"){
        findProduct = await Product.find({category, gender}).sort({_id: -1});
    } else if(gender === "both" || gender === "unisex"){
        findProduct = await Product.find({category}).sort({_id: -1});
        // console.log(findProduct.name)
    }
    if(filter === "lowtohigh"){
        findProduct = findProduct.sort((a, b) => (a.sellingprice > b.sellingprice) ? 1 : -1)
    } else if(filter === "hightolow"){
        findProduct = findProduct.sort((a, b) => (a.sellingprice < b.sellingprice) ? 1 : -1)
    } else if(filter === "all"){
        findProduct;
    } 
    if(findProduct){
        res.json(findProduct)
        // console.log(findProduct.length)
    }
})

app.post("/addToCart/:id", async (req,res) => {
    const token = req.headers.authorization;
    // console.log(token)
    if(token) {
        const verifyToken = jwt.verify(token, "secret123");
        const user = await User.findOne({email: verifyToken.email})
        // res.json(user.cart.includes("632804c80ef85394e09e679c"));
        if(!user.cart.includes(req.params.id)){
            const updateCart = await user.updateOne({$push: {cart: req.params.id}})
            if(updateCart){
                res.json("added");
            } else {
                res.json("nhi hua")
            }
        } else {
            res.json("Already added")
        }
    } else {
        res.status(500).json("Login first!")
    }
})

app.get("/cartItems/:id", async (req,res) => {
    const user = await User.findById(req.params.id);
    // res.json(user.cart);
    let items = [];
    for(let i=0; i<user.cart.length; i++){
        let product = await Product.findById(user.cart[i]);
        items.push(product);
    }
    res.json(items);
})

app.get("/clearCart/:id", async (req,res) => {
    const userId = req.params.id;
    const fetchUser = await User.findById(userId);
    const deleteCart = await fetchUser.updateOne({$set: { cart : []}});
    if(deleteCart) {
        res.json("cart cleared")
    } else{
        res.json("error")
    }
})

app.get("/removeProduct/:productId/:userId", async (req,res) => {
    const user = await User.findById(req.params.userId);
    // res.json(user.cart);
    if(user.cart.includes(req.params.productId)){
        await user.updateOne({$pull: {cart: req.params.productId}});
        res.json("removed");
    } else {
        res.json("Product doesn't exist")
    }
    
})

app.post("/placeOrder/:userId", async (req,res) => {
    const user = await User.findById(req.params.userId);
    let itemArr = [];
    for(let i=0; i<user.cart.length; i++){
        itemArr.push(user.cart[i]);
    }
    // res.json(itemArr);
    const order = new Order({name: user.name, email: user.email, items: itemArr, totalAmt: req.body.total});
    const saveOrder = await order.save();
    if(saveOrder){
        res.json(saveOrder._id)
    } else{
        res.json("error")
    }
})

app.get("/pendingOrders", async (req,res) => {
    const orders = await Order.find({});
    res.json(orders);
})

app.get("/orders/:userId", async (req,res) => {
    const user = await User.findById(req.params.userId);
    const orders = await Order.find({email: user.email}).sort({_id: -1});
    let ordersArr = [];
    for(let i=0; i<orders.length; i++){
        for(let j=0; j<orders[i].items.length; j++){
            const orderDetails = await Product.findById(orders[i].items[j]);
            ordersArr.push(orderDetails);
        }
    }
    res.json(ordersArr);
})

app.get("orderDelivered/:orderId", async (req,res) => {
    const order = await Order.findById(req.params.orderId);
    res.json(order)
    // const update = await order.updateOne({$set: {delivered: true}});
    // if(update){
    //     res.json(order)
    // } else{
    //     res.json("error")
    // }
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})