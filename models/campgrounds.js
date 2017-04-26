var mongoose = require("mongoose");


//SCHEMA SETUP (only for one database and less routes in the app)
var campgroundSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    description: String,
    createdAt:{type: Date, default: Date.now},
    author:{
            id:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"User"
            },
            username:String
         },
    comments:[
            {//embedding comment Ids to create associations between the campground and comments
                type:mongoose.Schema.Types.ObjectId,
                ref:"Comment"
            }
        ]
});

// this is basically saying return the model as an output when this file is included in another file
module.exports = mongoose.model("Campground", campgroundSchema);