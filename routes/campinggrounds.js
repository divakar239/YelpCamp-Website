var express = require('express');
var router = express.Router();
var Campground = require("../models/campgrounds");

//REST ROUTE: Index
router.get("/",function(req,res){
   
    Campground.find({}, function(err,allCampgrounds){
        if(err){
            console.log("Error");
        }
        else{
            res.render("./campinggrounds/index.ejs",{campgrounds:allCampgrounds});  
        }
    });
    
});

//REST ROUTE: Create
router.post("/", function(req,res){
   // console.log(req.body);
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var author={
        id: req.user._id,
        username: req.user._username
    }
    var newCampground = {name:name, image:image,author:author, description:description};
    //Create a new campground and add it to the database
    Campground.create(newCampground,function(err){
        if(err){
            console.log("Error");
        }
        else{
             res.redirect("/");
        }
    });
    
});

//REST ROUTE: New
router.get("/new",isLoggedIn, function(req,res){
    res.render("./campinggrounds/new.ejs");
});

//REST ROUTE: Show
router.get("/:id",isLoggedIn, function(req,res){
   
    //Finding the campground by id using a method provided by mongoose i.e. findById
    
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
       if(err){
           console.log("Error");
       }
       else{
           res.render("./campinggrounds/show",{campground: foundCampground});
       }
    });
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};
module.exports = router;