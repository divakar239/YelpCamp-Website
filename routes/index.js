var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');

//show register form
router.get("/register", function(req,res){
   res.render("register") ;
});

router.post("/register", function(req,res){
   var newUser = new User({username: req.body.username});
   User.register(newUser, req.body.password, function(err,user){
       if(err){
           console.log("error");
           res.render("register");
       }
       passport.authenticate("local")(req,res,function(){
           res.redirect("/campinggrounds");
       });
   });
});

//Login
router.get("/login", function(req,res){
   res.render("login"); 
});

router.post("/login", passport.authenticate("local",{
    
    successRedirect: "/campinggrounds",
    failureRedirect: "/login"
    
}), function(req,res){
    
});

//Logout
router.get("/logout", function(req,res){
    req.logout();
    res.redirect("/campinggrounds");
});


function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router;