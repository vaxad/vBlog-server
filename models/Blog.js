const mongoose = require('mongoose');

const { Schema } = mongoose;
const blogSchema = new Schema({
    creator:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    public:{
        type:Boolean,
        required:true
    },
    tags: [{
        type:String
    }],
    likes: [{
        type:String
    }],
    comments: [{
        type:String
    }],
    date:{
        type:Date,
        default:Date.now,
        required:true
    },
  });

  const Blog=mongoose.model('blog',blogSchema);
  module.exports=Blog;