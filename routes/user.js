const express = require("express")
const router = express.Router()
const {signup, renderSignupForm, loginUser, logout, renderLoginForm} = require("../controllers/users")

router.route("/signup")
.get(renderSignupForm)
.post(signup)


router.route("/login")
.get(renderLoginForm)
.post(loginUser)


// Route to handle logging out
router.post('/logout', logout);

module.exports = router

