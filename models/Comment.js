const mongoose = require('mongoose');

const { Schema } = mongoose;
const commentSchema = new Schema({
    by:{
        type:String,
        required:true
    },
    about:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    likes: [{
        type:String
    }],
    date:{
        type:Date,
        default:Date.now,
        required:true
    },
  });

  const Comment=mongoose.model('comment',commentSchema);
  module.exports=Comment;