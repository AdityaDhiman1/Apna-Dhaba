const express = require('express')
const app = express()
const path = require('path')
const hbs = require('hbs')
const mongoose = require('mongoose')
const session = require("express-session")
const mongosession = require("connect-mongodb-session")(session)
const bcrypt = require("bcryptjs")
const dotenv = require("dotenv")
dotenv.config()



mongoose.set('strictQuery', false)

mongoose.connect(process.env.MONOGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Database connect...',)).catch((err) => console.log(err.message))

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
    deleter_name: {
       type: String,
   },
    delete_product: [{
        productname: { type: String },
        productprice: { type: String },
        productplate: { type: String },
    }]
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
    uri: process.env.MONOGO_URI,
    collection: 'mysession'
});

app.use(session({
    secret: "This is Key",
    resave: false,
    saveUninitialized: false,
    store: store
}))

const isAurth = (req, res, next) => {
    if (req.session.isAurth) {
        next()
    }
    else {
        res.redirect(302, 'Adminlogin')
    }
}



app.get("/", async (req, res) => {
    try {
        let data = await Product.find({})
        let j = 1;
        for (let obj of data) {
            obj.__v = j;
            j = j + 1;
        }
        res.render("index", { product: true, item: data });

    } catch (error) {
        console.log("error in Product", error.message)

    }
})
app.get("/login", (req, res) => {
    res.render("index", { login: true })
})
app.post("/login", (req, res) => {
    res.redirect(302, "index", { login: true })
})
app.get("/signup", (req, res) => {
    res.render('index', { signup: true });
})
app.post("/signup", async (req, res) => {
    try {
        let password = req.body.password;
        let confirm_password = req.body.confirmpassword;
        if (password === confirm_password) {
            let msg = "";
            let signup = await new Signup({
                fist_name: req.body.fist_name,
                e_mail: req.body.e_mail,
                password: password,
                confirm_password: confirm_password
            })
            let registerd = await signup.save();
            msg = "Signup Successful"
            res.redirect(302, "/Login?msg=" + msg)
        } else {
            res.redirect(404, "pas not match?msg=" + msg)
            msg = "Password does not matched"
        }
    } catch (error) {
        console.log(error.message);
    }
})
app.get("/Adminlogin", (req, res) => {
    res.render("index", { Adminlogin: true })
})
app.post("/Adminlogin", async (req, res) => {
    try {
        let email_id = req.body.email_id;
        let password = req.body.password;
        await Signup.find({ e_mail: email_id }, (err, data) => {
            if (err) {
                console.log(err);
            } else {
                if (password === data[0].password) {
                    req.session.isAurth = true;
                    res.redirect(302, "Adminpanel");
                } else {
                    res.redirect(302, "Adminlogin")
                }
            }
        })
    } catch (error) {
        console.log(error.message)
    }
})
app.get("/Adminpanel", isAurth, (req, res) => {
    res.render("index", { Adminpanel: true })
})

app.post("/logout", (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) throw err;
            return res.redirect(302, "Adminlogin")
        })
    } catch (error) {
        console.log(error.message)
    }

})
app.get("/Productadd", isAurth, (req, res) => {
    res.render("index", { Productadd: true })
})
app.post("/Productadd", async (req, res) => {
    try {
        let { productname, productprice, productplate, productid } = req.body;
        let product = new Product({
            productname: productname,
            productprice: productprice,
            productplate: productplate,
            productid: productid
        })
        await Product.insertMany([product])
        res.redirect(302, "/Productadd?msg=product add successfully")
    } catch (error) {
        console.log(error.message)
    }
})
app.get("/Productedit", isAurth, async (req, res) => {
    try {
        let data = await Product.find({})
        let j = 1;
        for (let obj of data) {
            obj.__v = j;
            j = j + 1;
        }
        res.render("index", { item: data, Productedit: true });
    } catch (error) {
        console.log(error.message)

    }
})
app.get("/Productmodyfy/:id", isAurth, async (req, res) => {

    try {
        let data = await Product.findById(req.params.id)
        res.render("index", { Productmodyfy: true, item: data });

    } catch (error) {
        console.log(error.message);
    }

})


app.post("/Productmodyfy", async (req, res) => {
    try {
        await Product.findByIdAndUpdate(
            { "_id": req.body.product_id },
            {
                $set: {
                    productname: req.body.product_name,
                    productplate: req.body.product_plate,
                    productprice: req.body.product_price
                }
            })
            res.redirect(302,"Productedit?Update Success")
    } catch (error) {
        console.log(error.message);

    }

})
app.get("/Receptionlogin", (req, res) => {
    res.render("index", { Receptionlogin: true });
})
app.post("/Receptionlogin", (req, res) => {
    res.redirect(302, "Receptionist")
})
app.get("/Receptionist", async (req, res) => {
    try {
        await Product.find({}, (err, data) => {
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
    } catch (error) {
        console.log(error.message)
    }
})
app.post("/Receptionist", (req, res) => {
    res.redirect(302, "BillGenerate")
})
app.get("/Receptionist/BillGenerate", (req, res) => {
    res.render("index", { BillGenerate: true })
})
app.post("/BillGenerate", async (req, res) => {
    try {
        let msg = "";
        let bil = await new Bill({
            customore_name: req.body.customore_name,
            mobail_no: req.body.mobail_no,
            dishes: req.body.dishes,
            amount: req.body.amount

        })
        await bil.save();
        msg = "Bill Generated Successfully"
        res.redirect(302, 'Receptionist')
    } catch (error) {
        console.log(error.message)

    }

})
app.get("/CustomerList", async (req, res) => {
    try {
        await Bill.find({}, (err, data) => {
            if (err) {
                console.log("err")
            } else {
                res.render("index", { items: data, CustomerList: true });
            }
        })
    } catch (error) {
        console.log(error.message)

    }
})
app.post("/CustomerList", async (req, res) => {

    try {
        await Bill.find({ customore_name: req.body.Customor, mobail_no: req.body.Customor_mobile }, (err, data) => {

            if (customore_name = req.body.Customor, mobail_no = req.body.Customor_mobile) {

                res.redirect(302, "olduser")
            }
            else {
                res.redirect(302, "/Receptionist/BillGenerate")
            }
        })

    } catch (error) {
        console.log(error.message)

    }

})
app.get("/olduser", (req, res) => {
    res.render("index", { olduser: true });
})
app.get('/delete/:id', isAurth, async (req, res) => {

    try {
        let data  = await Product.findById(req.params.id);
        res.render("index", { item: data, delete: true })
    } catch (error) {
        console.log(error.message)

    }
})


app.post("/delete", async (req, res) => {
try {
    await Product.findByIdAndDelete(req.body.product_id)
    res.redirect(302,"Productedit?success")
    
} catch (error) {
    console.log(error.message)
    
}

})


app.get("*", (req, res) => {
    res.render('index', { _404: true })
})



app.listen(3000, () => {
    console.log("Server has been started port 3000",)
})