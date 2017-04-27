var express               = require("express"),
    mongoose              = require("mongoose"),
    flash                 = require("connect-flash"),
    geocoder              = require('geocoder'),
    passport              = require("passport"),
    bodyParser            = require("body-parser"),
    User                  = require("./models/user"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    methodOverride        = require("method-override");

//routes
var commmentRoutes        = require("./routes/comments"),
    campinggroundRoutes   = require("./routes/campinggrounds"),
    indexRoutes           = require("./routes/index");

var app=express();
var Campground=require("./models/campgrounds");
var Comment=require("./models/comment")
var seedDB=require("./seed");


app.set("view engine","ejs");
app.use(methodOverride("_method"));
app.use(express.static(__dirname + '/public'));
app.use(express.static('/partials'));
app.use(bodyParser.urlencoded({extended : true}));
app.use(flash());

app.locals.moment = require("moment");
//PASSPORT CONFIG
app.use(require('express-session')({
    secret: "secret_message",
    resave: false,
    saveUninitialised: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//END OF PASSPORT CONFIG

////req.user contains the information of the user that is logged in. Have to add req.user to all the routes
app.use(function(req,res,next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");             //the flash message with key=error is available for all routes to use.
   res.locals.success = req.flash("success");
   next();
});

// //using the above imported routes
//app.use(indexRoutes);
//app.use("/campinggrounds",campinggroundRoutes); //this tells us that all urls start with campinggrounds in the campingground route file
//app.use("/campinggrounds/:id/comments",commmentRoutes);

//seedDB(); //exporting the function from seed.js
//mongoose.connect("mongodb://localhost/yelp_camp_v5");
mongoose.connect("mongodb://divakar239:visage239@ds123351.mlab.com:23351/yelp_camp_239");


//Listening for requests
app.listen(process.env.PORT,process.env.IP,function(){
    console.log("starting work");
});

//////////////////////////////////
//ROUTES
/////////////////////////////////

//Gettinng Home Page
app.get("/",function(req,res){
    res.render("landing");
});

//REST ROUTE: Index
app.get("/campinggrounds", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
            res.render("./campinggrounds/index",{campgrounds:allCampgrounds});
        }
    });
});

//REST ROUTE: Create
app.post("/campinggrounds",isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user.id,
      username: req.user.username
  }
  var price = req.body.price;
  geocoder.geocode(req.body.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newCampground = {name: name, image: image, description: desc, price:price, author:author, location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campinggrounds");
        }
    });
  });
});
// app.post("/campinggrounds", function(req,res){
//     console.log(req.user);
//     console.log(req.user.username);
//     var name = req.body.name;
//     var price = req.body.price;
//     var image = req.body.image;
//     var description = req.body.description;
//     var author={
//         id: req.user.id,
//         username: req.user.username
//     }
//      console.log(author);
    
//     var newCampground = {name:name,price:price, image:image,author:author, description:description};
//     //Create a new campground and add it to the database
//     Campground.create(newCampground,function(err){
//         if(err){
//             console.log("Error");
//         }
//         else{
//              res.redirect("/campinggrounds");
//         }
//     });
    
// });

//REST ROUTE: New
app.get("/campinggrounds/new",isLoggedIn, function(req,res){
    res.render("./campinggrounds/new.ejs");
});

//REST ROUTE: Show
app.get("/campinggrounds/:id",isLoggedIn, function(req,res){
   
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

//EDIT
app.get("/campinggrounds/:id/edit",checkCampgroundOwnership, function(req,res){
    Campground.findById(req.params.id, function(err,foundCampground){
      res.render("./campinggrounds/edit",{campground:foundCampground});
       
    });
});
    

//UPDATE
// app.put("/campinggrounds/:id",checkCampgroundOwnership,function(req, res){
//   geocoder.geocode(req.body.location, function (err, data) {
//     var lat = data.results[0].geometry.location.lat;
//     var lng = data.results[0].geometry.location.lng;
//     var location = data.results[0].formatted_address;
//     var newData = {name: req.body.name , image: req.body.image, description: req.body.description, price: req.body.price, location: location, lat: lat, lng: lng};
//     Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, campground){
//         if(err){
//             req.flash("error", err.message);
//             res.redirect("/campinggrounds");
//         } else {
//             req.flash("success","Successfully Updated!");
//             res.redirect("/campinggrounds/" + req.params.id);
//         }
//     });
//   });
// });
app.put("/campinggrounds/:id",checkCampgroundOwnership, function(req,res){
  Campground.findByIdAndUpdate(req.params.id,req.body.campground, function(err,updatedCampground){
        if(err){
            console.log("error");
            res.redirect("/campinggrounds");
        }
        else{
            res.redirect("/campinggrounds/" + req.params.id);
        }
    });

});

//DELETE
app.delete("/campinggrounds/:id",checkCampgroundOwnership, function(req,res){
  Campground.findByIdAndRemove(req.params.id, function(err){
      if(err){
          console.log("Error");
          res.redirect("/campinggrounds");
      }
      else{
          res.redirect("/campinggrounds");
      }
  }); 
  

});

//===============================================================================================================//
                                        //COMMENTS ROUTES//
//===============================================================================================================//
app.get("/campinggrounds/:id/comments/new",isLoggedIn,function(req,res){
    //find campground by id
    Campground.findById(req.params.id,function(err, campground){
        if(err){
            console.log("error");
        }
        else{
            res.render("./comments/new",{campground:campground});
        }
    });
});

app.post("/campinggrounds/:id/comments/new",isLoggedIn,function(req,res){
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
                   //console.log(req.user._username);
                   //add username of user 
                   comment.author.id = req.user._id;
                   comment.author.username = req.user.username;
                   // save comment
                   comment.save();
                   campground.comments.push(comment);
                   campground.save();
                   req.flash("success","Successfully added comment :)")
                   res.redirect('/campinggrounds/'+ campground._id);
               }
           });
       }
   }); 
});

//EDIT
app.get("/campinggrounds/:id/comments/:comment_id/edit",checkCommentOwnership, function(req,res){
    Comment.findById(req.params.comment_id, function(err,foundComment){
       if(err){
           res.redirect("back");
       } else{
            res.render("./comments/edit", {campground_id: req.params.id, comment: foundComment});
       }
    });
 });




//UPDATE
app.put("/campinggrounds/:id/comments/:comment_id",checkCommentOwnership, function(req,res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
       if(err){
           res.redirect("back");
       }
       else{
           req.flash("success","Comment Updated");
           res.redirect("/campinggrounds/" + req.params.id);     
       }
   });
});

//DELETE
app.delete("/campinggrounds/:id/comments/:comment_id",checkCommentOwnership, function(req,res){
   Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect("back")
       } else{
           req.flash("success","Comment Deleted");
           res.redirect("/campinggrounds/" + req.params.id);
       }
   }) ;
});
//===============================================================================================================//
                                        //AUTHORIZATION ROUTES//
//===============================================================================================================//
//show register form
app.get("/register", function(req,res){
   res.render("register") ;
});

app.post("/register", function(req,res){
   var newUser = new User({username: req.body.username});
   User.register(newUser, req.body.password, function(err,user){
       if(err){
           console.log(err);
           req.flash("error",err.message);
           res.render("register");
       }
       else{
           passport.authenticate("local")(req,res,function(){
               req.flash("success","Welcome to YelpCamp " + user.username);
               res.redirect("/campinggrounds");
           });
       }
   });
});

//Login
app.get("/login", function(req,res){
   res.render("login"); 
});

app.post("/login", passport.authenticate("local",{
    
    successRedirect: "/campinggrounds",
    failureRedirect: "/login"
    
}), function(req,res){
   console.log(req.body.username);
});

//Logout
app.get("/logout", function(req,res){
    req.logout();
    req.flash("success","Logged you out!")
    res.redirect("/campinggrounds");
});


//MIDDLEWARE
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    //req.flsh("key","message")
    req.flash("error","You need to login to do that!");
    res.redirect("/login");
}

function checkCampgroundOwnership(req,res,next){
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err,foundCampground){
        if(err){
            res.redirect("back");
        }
        else{
            if(foundCampground.author.id.equals(req.user._id)){
                next();
            }
            else{
               req.flash("error","You don't have the permission to do that!")
               res.redirect("back");
            }
        }
    });

    }
    else{
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

function checkCommentOwnership(req,res,next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err,foundComment){
        if(err){
            res.redirect("back");
        }
        else{
            if(foundComment.author.id.equals(req.user._id)){
                next();
            }
            else{
               req.flash("error", "You need to be logged in to do that");
               res.redirect("back");
            }
        }
    });

    }
    else{
        req.flash("error","You need to login to do that!");
        res.redirect("back");
    }
}