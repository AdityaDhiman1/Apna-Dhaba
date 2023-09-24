const express = require('express')
const app = express()
const path = require('path')
const hbs = require('hbs')
const mongoose = require('mongoose')
const session = require("express-session")
const mongosession = require("connect-mongodb-session")(session)
const bcrypt = require("bcryptjs")

// upload today
const mongoURI = "mongodb://127.0.0.1:27017/MINOR_PROJECT";

mongoose.set('strictQuery', false)

mongoose.connect("mongodb://127.0.0.1:27017/MINOR_PROJECT",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    (err) => {


        if (err) {

            console.error('Database is not connected')
        }
        else {
            console.error('Database is connected ')

        }

    })

let signupSchema = new mongoose.Schema({
    fist_name: { type: String },
    last_name: { type: String },
    e_mail: { type: String, unique: true },
    password: { type: String }
})
let Signup = new mongoose.model("Signup", signupSchema, "Signup");

let ProductSchema = new mongoose.Schema({
    productname: { type: String },
    productprice: { type: String },
    productplate: { type: String },
    productid: { type: String }
})
let Product = new mongoose.model("Product", ProductSchema, "Product")

let BillSchema = new mongoose.Schema({
    customore_name: { type: String },
    mobail_no: { type: String },
    dishes: { type: String },
    amount: { type: String }
})

let Bill = new mongoose.model("Bill", BillSchema, "Customore Details")

let DeletSchema = new mongoose.Schema({
    product_id: {
        type: String
    },
    product_name: {
        type: String
    },
    deleter_name: {
        type:String
    }
})
let Delete = new mongoose.model("Delete", DeletSchema, "Deleted Produtct")

app.use(express.urlencoded({
    extended: true
}))
app.set('view engine', 'hbs')
app.use(express.json());
app.set('views', path.join(__dirname, "../templates/views"))
app.use(express.static(path.join(__dirname, "../public/css")))
hbs.registerPartials(path.join(__dirname, "../templates/partitals"))

const store = new mongosession({
    uri: mongoURI,
    collection: 'mysession'
});

app.use(session({
    secret: "This is Key",
    resave: false,
    saveUninitialized: false,
    store:store
}))

const isAurth = (req, res, next) => {
    if (req.session.isAurth) {
        next()
    }
    else {
        res.redirect(302,'Adminlogin')
    }
}


app.get("/Product", (req, res) => {
    Product.find({}, (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            let j = 1;
            for (let obj of data) {
                obj.__v = j;
                j = j + 1;
            }
            res.render("index", { product: true, item: data });

        }
    })
})
app.get("/login", (req, res) => {
    res.render("index", { login: true })
})
app.post("/login", (req, res) => {
    res.redirect(302,"index", { login: true })
})
app.get("/signup", (req, res) => {
    res.render('index', { signup: true });
})
app.post("/signup", (req, res) => {
    let password = req.body.password;
    let confirm_password = req.body.confirmpassword;
    if (password === confirm_password) {
        let msg = "";
        let signup = new Signup({
            fist_name: req.body.fist_name,
            e_mail: req.body.e_mail,
            password: password,
            confirm_password: confirm_password
        })
        let registerd = signup.save();
        msg = "Signup Sccessful"
        res.redirect(302,"/Login?msg=" + msg)

    } else {
        res.redirect(404,"pas not match?msg=" + msg)
        msg = "Password does not matched"
    }
})
app.get("/Adminlogin", (req, res) => {
    res.render("index", { Adminlogin: true })
})
app.post("/Adminlogin", (req, res) => {

    let email_id = req.body.email_id;
    let password = req.body.password;
    Signup.find({ e_mail: email_id }, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            if (password === data[0].password) {
                req.session.isAurth = true;
                res.redirect(302,"Adminpanel");
            } else {
                res.redirect(302,"Adminlogin")
            }
        }
    })
})
app.get("/Adminpanel", isAurth,  (req, res) => {
    res.render("index", { Adminpanel: true })
})

app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        return res.redirect(302,"Adminlogin")
    })
})
app.get("/Productadd", isAurth, (req, res) => {
    res.render("index", { Productadd: true })
})
app.post("/Productadd", (req, res) => {
    let product = new Product({
        productname: req.body.productname,
        productprice: req.body.productprice,
        productplate: req.body.productplate,
        productid: req.body.productid
    })
    
    product.save();
    res.redirect(302,"/Productadd?msg=product add successfully")
})
app.get("/Productedit", isAurth,(req, res) => {
    Product.find({}, (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            let j = 1;
            for (let obj of data) {
                obj.__v = j;
                j = j + 1;
            }
            res.render("index", { item: data, Productedit: true });

        }
    })
})
app.get("/Productmodyfy", isAurth,(req, res) => {
    res.render("index", { Productmodyfy: true });
})
app.post("/Productmodyfy", (req, res) => {


    Product.update({ productid: req.body.product_id }, {
        $set: {
            productname: req.body.product_name,
            productplate: req.body.product_plate,
            productprice: req.body.product_price
        }
    }, res.redirect(302,"Productmodyfy"),
    );

})
app.get("/Receptionlogin", (req, res) => {
    res.render("index", { Receptionlogin: true });
})
app.post("/Receptionlogin", (req, res) => {
    res.redirect(302,"Receptionist")
})
app.get("/Receptionist", (req, res) => {
    Product.find({}, (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            let j = 1;
            for (let obj of data) {
                obj.__v = j;
                j = j + 1;
            }
            res.render("index", { item: data, Receptionist: true });

        }
    })
})
app.post("/Receptionist", (req, res) => {
    res.redirect(302,"BillGenerate")
})
app.get("/Receptionist/BillGenerate", (req, res) => {
    res.render("index", { BillGenerate: true })
})
app.post("/BillGenerate", (req, res) => {
    let msg = "";
    let bil = new Bill({
        customore_name: req.body.customore_name,
        mobail_no: req.body.mobail_no,
        dishes: req.body.dishes,
        amount: req.body.amount

    })
    bil.save();
    msg = "Bill Generated Successfully"
    res.redirect(302,'Receptionist')



})
app.get("/CustomerList", (req, res) => {
    Bill.find({}, (err, data) => {
        if (err) {
            console.log("err")
        } else {
            res.render("index", { items: data, CustomerList: true });
        }
    })
})
app.post("/CustomerList", (req, res) => {

    Bill.find({ customore_name: req.body.Customor, mobail_no: req.body.Customor_mobile }, (err, data) => {

        if (customore_name = req.body.Customor, mobail_no = req.body.Customor_mobile) {

            res.redirect(302,"olduser")
        }
        else {
            res.redirect(302,"/Receptionist/BillGenerate")
        }
    })

})
app.get("/olduser", (req, res) => {
    res.render("index", { olduser: true });
})
app.get('/delete',  isAurth, (req, res) => {
    Product.find({}, (err, data) => {
        if (err) {
            console.log(err)
        }
        else {


            res.render("index", { item: data, delete: true })

        }
    })
})
app.post("/delete", (req, res) => {
    let deletdata = new Delete ({
        product_name: req.body.product_name,
        product_id: req.body.product_id,
        deleter_name:req.body.deleter_name
    })
    deletdata.save()
    
    Product.deleteOne({ productid: req.body.delete_id }, (err, data) => {
    })
    res.redirect(302,"Productedit?msg=deleted Succeefully")
})
app.get("*", (req, res) => {
    res.render('index', { _404: true })
})
app.listen(3000, () => {
    console.log("Server has been started port 3000")
})