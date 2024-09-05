const User = require("../models/User")
const passport = require("passport")


module.exports.signup = async (req, res, next) => {
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
}

module.exports.renderSignupForm = (req, res) => {
    res.render("user/signup.ejs");
}

module.exports.renderLoginForm = (req, res) => {
    res.render("user/login.ejs");
}

module.exports.loginUser = (req, res, next) => {
    passport.authenticate('local', {
      failureRedirect: '/login',
      failureFlash: true // Ensure it shows failure flash message
    })(req, res, () => {
      req.flash('success', 'Welcome back!');
      res.redirect('/listings');
    });
  };
  

module.exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            // Handle the error if any
            return next(err);
        }
        req.flash('success', 'You have been logged out');
        res.redirect('/listings'); // Redirect to home page or any other page
    });
}

