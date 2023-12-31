const express=require('express');
const router=express.Router();
const fetchuser=require('../middleware/fetchuser');
const Comment=require('../models/Comment');
const { body, validationResult } = require('express-validator');
const { findById } = require('../models/User');
const User = require('../models/User');
const Blog = require('../models/Blog');

//ROUTE 2: fetch all comments using: GET '/api/fetchcomments'

router.get('/about/:id', fetchuser,async(req,res)=>{
    try {
        const comments=await Comment.find({about:req.params.id}).limit(10).sort({likes:-1})
    for(let i=0;i<comments.length;i++){
        const commentor=await User.findById(comments[i].by)
        comments[i].commentor=commentor
    }
    res.json(comments)
    } catch (error) {
        //(error.message);
    res.status(500).send("Internal server error");
    }
    
})

router.get('/aboutall/:id', fetchuser,async(req,res)=>{
    try {
        const comments=await Comment.find({about:req.params.id}).sort({likes:-1})
    for(let i=0;i<comments.length;i++){
        const commentor=await User.findById(comments[i].by)
        comments[i].commentor=commentor
    }
    res.json(comments)
    } catch (error) {
        //(error.message);
    res.status(500).send("Internal server error");
    }
    
})

// router.get('/about/:id', fetchuser,async(req,res)=>{
//     try {
//         const comments=await Comment.find({about:req.params.id}).limit(10)
//     for(let i=0;i<comments.length;i++){
//         const commentor=await User.findById(comments[i].by)
//         comments[i].commentor=commentor
//     }
//     } catch (error) {
//         //(error.message);
//     res.status(500).send("Internal server error");
//     }
    
// })

//ROUTE 3: add new comment using: POST '/api/addcomment'

router.post('/:id', fetchuser,[
    body('content','enter a valid content').isLength({min:1})
],async(req,res)=>{
    try {
        //(req.params.id)
        let blog=await Blog.findById(req.params.id)
        if(!blog){
            return res.status(400).json({errors: "Please login with correct credentials"});
        }
    const {content}=req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    const comment=new Comment({
        content,by:req.user.id,about:req.params.id
    })
    const savedComment= await comment.save();
    blog.comments.push(savedComment._id)
    const commentor=await User.findById(req.user.id)
    savedComment.commentor=commentor
    blog.save()
    res.json(savedComment);
} catch (error) {
    //(error.message);
    res.status(500).send("Internal server error");
}
})

//ROUTE 3: update a comment using: PUT '/api/updatecomment'
router.put('/:id', fetchuser,async(req,res)=>{
    try {
        
    const {content}=req.body;
    //store what creator wants to update
    const newComment={};
        if(content){newComment.content=content};
    
        //VERIFY USER
        let comment= await Comment.findById(req.params.id);
        if(!comment){ return res.status(404).send("Not found")}
        if(comment.by.toString()!=req.user.id){
            return res.status(401).send("Not Allowed")
        }

        //update comment
        comment=await Comment.findByIdAndUpdate(req.params.id,{$set:newComment},{new:true})
        res.json(comment);
} catch (error) {
    //(error.message);
    res.status(500).send("Internal server error");
}
})

//ROUTE 4: update a comment using: DELETE '/api/updatecomment'
router.delete('/:id', fetchuser,async(req,res)=>{
    try {
    
        //VERIFY USER
        let comment= await Comment.findById(req.params.id);
        if(!comment){ return res.status(404).send("Not found")}
        if(comment.by.toString()!=req.user.id){
            return res.status(401).send("Not Allowed")
        }

        //delete comment
        comment=await Comment.findByIdAndDelete(req.params.id);
        res.json("Comment was deleted"+comment);
} catch (error) {
    //(error.message);
    res.status(500).send("Internal server error");
}
})

router.get('/:id', fetchuser,async(req,res)=>{
    try {
    
        //VERIFY USER
        let comment= await Comment.findById(req.params.id);
        if(!comment){ return res.status(404).send("Not found")}
        const commentor=await User.findById(comment.by)
        comment.commentor=commentor
        res.json(comment);
} catch (error) {
    //(error.message);
    res.status(500).send("Internal server error");
}
})

router.post('/like/:id', fetchuser,async (req,res)=>{

    try {
        let comment= await Comment.findById(req.params.id)
        if(!comment){
            return res.status(400).json({errors: "Please login with correct credentials"});
        }
        
        if(!comment.likes.includes(req.user.id)){
        comment.likes.push(req.user.id)
        comment.save()
        }
    
        res.json("liked successfully") ;

    } catch (error) {
        //(error.message);
    res.status(500).send("Internal server error");
    }

})

router.post('/unlike/:id', fetchuser,async (req,res)=>{

    try {
        let comment= await Comment.findById(req.params.id)
        if(!comment){
            return res.status(400).json({errors: "Please login with correct credentials"});
        }
        
        comment.likes.pop(req.user.id)
        comment.save()
    
        res.json("unliked successfully") ;

    } catch (error) {
        //(error.message);
    res.status(500).send("Internal server error");
    }

})


module.exports=router;