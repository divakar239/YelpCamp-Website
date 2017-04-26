var express = require('express');
var router = express.Router({mergeParams:true});
var Comment = require('../models/comment');
var Campground = require('../models/campgrounds');

router.get("/campinggrounds/:id/comments/new",isLoggedIn,function(req,res){
    //find campground by id
    Campground.findById(req.params.id,function(err, campground){
        if(err){
            console.log("error");
        }
        else{
            res.render("./comments/new",{campground:campground});
        }
    });
   // res.send('new_1');
});

router.post("/campinggrounds/:id/comments",isLoggedIn,function(req,res){
   Campground.findById(req.params.id, function(err,campground){
       if(err){
           console.log("error");
       }
       else{
           Comment.create(req.body.comment, function(err,comment){
               if(err){
                   console.log("error");
               }
               else{
                   //add username of user 
                   comment.author.id = req.user._id;
                   comment.author.username = req.user._username;
                   // save comment
                   campground.comments.push(comment);
                   campground.save();
                   res.redirect('/campinggrounds/'+ campground._id);
               }
           });
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