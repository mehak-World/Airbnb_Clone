const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/Listing.js");
const ejsMate = require("ejs-mate");
const ExpressError = require("./errors/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const session = require("express-session");
const flash = require("connect-flash");
const User = require("./models/User.js");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
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

passport.use(new FacebookStrategy({
    clientID: '828698929196550',
    clientSecret: 'd2870b77e0918ec2a3bdd74e6a4fd66d',
    callbackURL: "https://web-major-project.onrender.com/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'email']
},
async function (accessToken, refreshToken, profile, done) {
    try {
        const user = await User.findOrCreate(
            { facebookId: profile.id },
            {
                username: profile.displayName,
                email: profile.emails ? profile.emails[0].value : 'No Email',
                facebookId: profile.id
            }
        );
        done(null, user);
    } catch (err) {
        done(err, null);
    }
}
));

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter );

app.get("/getSessInfo", (req, res, next) => {
    console.log(req.session);
    next();
    })

    app.get('/auth/facebook',
        passport.authenticate('facebook'));
      
      app.get('/auth/facebook/callback',
        passport.authenticate('facebook', { failureRedirect: '/listings', failureFlash: "Could not find user" }),
        function(req, res) {
          // Successful authentication, redirect home.
          console.log(req.session);
            req.flash("success", "The user has successfully logged in using facebook.")
          res.redirect('/listings', );
        });

app.get("/signup", (req, res) => {
    res.render("user/signup.ejs");
})

app.post('/signup', async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = await User.findOne({email});
        console.log(user);
        if(user){
            req.flash('error', 'The user with this email already exists. Please login.');
            res.redirect("/login");
        }
        else{
        const newUser = new User({ username, email, password });
        await newUser.save();
        req.login(newUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to WonderWithUs!');
            res.redirect('/listings');
        });
    }
    } catch (err) {
        req.flash('error', 'Could not create user.');
        console.log(err);
        console.log("Could not create user");
        res.redirect('/signup');
    }
});

app.get("/login", (req, res) => {
    res.render("user/login.ejs");
})

app.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Invalid username or password.'
}), (req, res) => {
    req.flash('success', 'Welcome back!');
    res.redirect('/listings');
});

// Route to handle logging out
app.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            // Handle the error if any
            return next(err);
        }
        req.flash('success', 'You have been logged out');
        res.redirect('/listings'); // Redirect to home page or any other page
    });
});


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

app.listen(3000, () => {
    console.log("Server is listening");
})