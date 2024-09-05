const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/Listing.js");
const ejsMate = require("ejs-mate");
const ExpressError = require("./errors/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js")
const session = require("express-session");
const flash = require("connect-flash");
const User = require("./models/User.js");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
// const FacebookStrategy = require('passport-facebook').Strategy;
const dotenv = require('dotenv').config();
const db_URL = process.env.ATLASDB_URL;
const MongoStore = require('connect-mongo');

const store =  MongoStore.create({ mongoUrl: db_URL,
    crypto:{
        secret: process.env.SECRET,
        touchAfter: 24*3600
    }
 });

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { expires: new Date(Date.now() + 3600000), maxAge: 3600000 }
};


app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));
app.engine('ejs', ejsMate);
app.use(session(sessionOptions));

store.on("error", () => {
    console.log("ERROR in MONGO Session store");
})
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.user = req.user;
   
    next();
})


main().then((res) => console.log("Connection with Mongo DB established")).catch(err => console.log(err));


console.log("URL: " ,db_URL);
async function main() {
  await mongoose.connect(db_URL);
}


passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return done(null, false, { message: 'Incorrect email.' });
            }
            const isValid = await user.validatePassword(password);
            if (!isValid) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));


app.use("/", userRouter)
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter );



app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});


// Error handling middleware:
app.use((err, req, res, next) => {
    const {status = 500, message = "Something went wrong"} = err;
    console.log(typeof(status));
    console.log(status.toString().split(''));
    res.render("errors/error", {status: status.toString().split(''), message});
})

app.listen(8080, () => {
    console.log("Server is listening");
})