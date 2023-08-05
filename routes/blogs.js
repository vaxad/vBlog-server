const express=require('express');
const router=express.Router();
const fetchuser=require('../middleware/fetchuser');
const Blog=require('../models/Blog');
const { body, validationResult } = require('express-validator');
const { findById } = require('../models/User');
const User = require('../models/User');

//ROUTE 2: fetch all blogs using: GET '/api/fetchblogs'
router.get('/fetchsome', fetchuser,async(req,res)=>{
    try {
        const blogs=await Blog.find().limit(10).sort({likes:-1})
    res.json(blogs);
    } catch (error) {
        console.log(error.message);
    res.status(500).send("Internal server error");
    }
    
})

router.get('/all', fetchuser,async(req,res)=>{
    try {
        const blogs=await Blog.find().sort({likes:-1})
    res.json(blogs);
    } catch (error) {
        console.log(error.message);
    res.status(500).send("Internal server error");
    }
    
})

router.get('/', fetchuser,async(req,res)=>{
    try {
        const user = await User.findById(req.user.id)
        const blogs=await Blog.find({creator:{$in:user.following}})
        if(user.following.length<3){
            const extra=await Blog.find({creator:{$not:{$in:user.following.concat([req.user.id])}}}).limit(10).sort({likes:-1})
            console.log(extra)
            const fblogs=blogs.concat(extra)
            res.json(fblogs);
        }else{
             res.json(blogs);
        }
    } catch (error) {
        console.log(error.message);
    res.status(500).send("Internal server error");
    }
    
})


router.get('/by/:id', fetchuser,async(req,res)=>{
    try {
        const user = await User.findById(req.user.id)
        const blogs=await Blog.find({creator:req.params.id}).sort({likes:-1})
        
        res.json(blogs);
    
    } catch (error) {
        console.log(error.message);
    res.status(500).send("Internal server error");
    }
    
})




//ROUTE 3: add new blog using: POST '/api/addblog'

router.post('/', fetchuser,[
    body('title','enter a valid title').isLength({min:1}),
    body('content','enter a valid content').isLength({min:1})
],async(req,res)=>{
    try {
        let user=await User.findById(req.user.id)
        if(!user){
            return res.status(400).json({errors: "Please login with correct credentials"});
        }
    const {title,content,public,tags}=req.body;

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    const blog=new Blog({
        title,content,public:public==="true"?true:false,creator:req.user.id,tags
    })
    const savedBlog= await blog.save();
    user.blogs.push(savedBlog._id)
    user.save()
    res.json(savedBlog);
} catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error");
}
})

//ROUTE 3: update a blog using: PUT '/api/updateblog'
router.put('/:id', fetchuser,async(req,res)=>{
    try {
        
    const {title,content,public,tags}=req.body;
    //store what creator wants to update
    const newBlog={};
        if(title){newBlog.title=title}
        if(content){newBlog.content=content};
        if(public){
            if(public==="false")
            newBlog.public=false
            else if(public==="true")
            newBlog.public=true
        };
        if(tags){newBlog.tags=tags}
    
        //VERIFY USER
        let blog= await Blog.findById(req.params.id);
        if(!blog){ return res.status(404).send("Not found")}
        if(blog.creator.toString()!=req.user.id){
            return res.status(401).send("Not Allowed")
        }

        //update blog
        blog=await Blog.findByIdAndUpdate(req.params.id,{$set:newBlog},{new:true})
        res.json(blog);
} catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error");
}
})

//ROUTE 4: update a blog using: DELETE '/api/updateblog'
router.delete('/:id', fetchuser,async(req,res)=>{
    try {
    
        //VERIFY USER
        let blog= await Blog.findById(req.params.id);
        if(!blog){ return res.status(404).send("Not found")}
        if(blog.creator.toString()!=req.user.id){
            return res.status(401).send("Not Allowed")
        }

        //delete blog
        blog=await Blog.findByIdAndDelete(req.params.id);
        res.json("Blog was deleted"+blog);
} catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error");
}
})

router.get('/:id', fetchuser,async(req,res)=>{
    try {
    
        //VERIFY USER
        let blog= await Blog.findById(req.params.id);
        if(!blog){ return res.status(404).send("Not found")}
       
        //delete blog
        res.json(blog);
} catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error");
}
})

router.post('/like/:id', fetchuser,async (req,res)=>{

    try {
        let blog= await Blog.findById(req.params.id)
        if(!blog){
            return res.status(400).json({errors: "Please login with correct credentials"});
        }
        if(!blog.likes.includes(req.user.id)){
        blog.likes.push(req.user.id)
        blog.save()
        }
    
        res.json("liked successfully") ;

    } catch (error) {
        console.log(error.message);
    res.status(500).send("Internal server error");
    }

})

router.post('/unlike/:id', fetchuser,async (req,res)=>{

    try {
        let blog= await Blog.findById(req.params.id)
        if(!blog){
            return res.status(400).json({errors: "Please login with correct credentials"});
        }
        
        blog.likes.pop(req.user.id)
        blog.save()
    
        res.json("unliked successfully") ;

    } catch (error) {
        console.log(error.message);
    res.status(500).send("Internal server error");
    }

})


module.exports=router;