var mongoose = require("mongoose");
var Campground = require("./models/campgrounds");
var Comment = require("./models/comment");
//array of pre defined campgrounds

var data=[
        {
            name:"Mountain Forage",
            image:"https://farm5.staticflickr.com/4044/4175370953_5488caf554.jpg",
            description:"Safe Haven"
        },
        
        {
            name:"Country Road",
            image:"https://farm4.staticflickr.com/3533/3819363105_24b56afbbc.jpg",
            description:"Trip Down Memory Lane"
        },
        
        {
            name:"Pine Trees",
            image:"https://farm9.staticflickr.com/8306/7968778860_47d2a2f513.jpg",
            description:"Tall Grass"
        }
     ]

//remove everything from the database
function seedDB(){
    Campground.remove({}, function(err){
    //   if(err){
    //       console.log("error");
    //   } 
    //   else{
    //         //add some data
    //         //NOTE: the creation needs to be inside the callback function so that these are created only after previous ones have been removed; 
    //         //without the call back 
    //       //console.log('removed')
    //         data.forEach(function(seed){
    //             Campground.create(seed,function(err,data){
    //                 if(err){
    //                     console.log("error");
    //                 }
    //                 else{
    //                     console.log("done");
    //                     Comment.create(
                            
    //                         //this is the comment
    //                         {
    //                             text: "This looks like an awesome place; wish there was internet though!",
    //                             author: "Bill"
    //                         }, function(err,comment){
    //                             if(err){
    //                                 console.log("error");
    //                                 }
    //                                 else{
    //                                     //created comment being pushed into the campground's(here being referred to as data) comments array
    //                                      data.comments.push(comment);
    //                                      data.save();
    //                                 }
    //                     });
    //                 }
    //             });
    //         });
    //     }
    });
    
}

module.exports=seedDB;