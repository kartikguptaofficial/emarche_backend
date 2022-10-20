const mongoose = require("mongoose");
const path = require("path")
require("dotenv").config({path: "./config.env"});

mongoose.connect(process.env.DATABASE || "mongodb+srv://emarche:kartik4002@cluster0.1jsvxys.mongodb.net/?retryWrites=true&w=majority")
.then(() => console.log("Database connected"))
.catch((err) => console.log(err))

const userSchema = new mongoose.Schema({
    name: { type: String },
    phone: { type: Number },
    email: { type: String },
    password: { type: String },
    admin: { type: Boolean, default: false },
    cart: { type: Array, default: [] },
    pendingOrders: { type: Array, default: [] },
    prevOrders: { type: Array, default: [] }
}, { timestamps: true })

const productSchema = new mongoose.Schema({
    name: { type: String },
    description: { type: String },
    costprice: { type: String },
    sellingprice: { type: String },
    mrp: { type: String },
    category: { type: String },
    gender: { type: String },
    img1: { type: String },
    img2: { type: String },
    img3: { type: String },
    img4: { type: String },
    img5: { type: String },
    img6: { type: String },
    img7: { type: String },
    img8: { type: String },
    linkToProduct: { type: String }
}, { timestamps: true })

const orderSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String },
    items: { type: Array },
    totalAmt: { type: Number },
    paymentMode: { type: String, default: "COD" },
    delivered: { type: Boolean, default: false }
}, { timestamps: true })

const User = mongoose.model("user", userSchema);
const Product = mongoose.model("product", productSchema);
const Order = mongoose.model("order", orderSchema);

module.exports = {
    User: User,
    Product: Product,
    Order: Order
}