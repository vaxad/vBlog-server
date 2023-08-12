const express=require('express');
const User = require('../models/User');
const router=express.Router();
require('dotenv').config({path:'../.env.local'})
const fetchuser=require('../middleware/fetchuser');
const Blog = require('../models/Blog');


//ROUTE 2: create a user using: POST '/api/login'
router.post('/follow/:id', fetchuser,async (req,res)=>{

    try {
        let user1= await User.findById(req.params.id)
        let user2=await User.findById(req.user.id)
        if(!user1||!user2){
            return res.status(400).json({errors: "Please login with correct credentials"});
        }
        
        if(!user1.followers.includes(req.user.id)){
        user1.followers.push(req.user.id)
        user2.following.push(req.params.id)
        user1.save()
        user2.save()
        }
    
        res.json("followed successfully") ;

    } catch (error) {
        //(error.message);
    res.status(500).send("Internal server error");
    }

})

router.post('/unfollow/:id', fetchuser,async (req,res)=>{

    try {
        let user1= await User.findById(req.params.id)
        let user2=await User.findById(req.user.id)
        if(!user1||!user2){
            return res.status(400).json({errors: "Please login with correct credentials"});
        }

        user1.followers.pop(req.user.id)
        user2.following.pop(req.params.id)
        user1.save()
        user2.save()
    
        res.json("unfollowed successfully") ;

    } catch (error) {
        //(error.message);
    res.status(500).send("Internal server error");
    }

})



router.get('/:id',fetchuser, async (req,res)=>{
    try {
        const user=await User.findById(req.params.id).select("-password");
        res.send(user);
    } catch (error) {
        //(error.message);
        res.status(500).send("Internal server error");
    }
    })

module.exports=router;