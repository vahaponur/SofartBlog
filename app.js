const express = require('express');
const upload = require('express-fileupload');
const fs = require('fs');
const mongoose = require('mongoose');
const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(upload());

mongoose.connect('mongodb://localhost:27017/sofartDB');
const personSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    rutbe:{
        type:String,
        required:true
    },
    picture:{
        type:String,
        required:true
    },
    linkedin:{
        type:String
    },
    email:{
        type:String
    },
     behance:{
        type:String
    },
    pinterest:{
        type:String
    },
    personalWebsite:{
        type:String
    }

});
const Person = mongoose.model('person',personSchema);
const postSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    summary:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
   
    person1:personSchema,
    person2:personSchema,
    imageName:{
        type:String,
        required:true
    }
});
const Post = mongoose.model('Post',postSchema);

//Anasayfa Girişi
app.route('/').get((req,res)=>{
    Post.find({}).sort({'_id':-1}).limit(3).then(results=>{
        res.render('index',{pageTitle:'SofART Sanat ve Kültür Dergisi',featuredPosts:results});
    })
    
})

//Yeni Post Girişi
app.route('/newentry').get((req,res)=>{
    res.render('newentry',{pageTitle:'Sofart - Post Girişi'});
}).post((req,res)=>{
    if(req.files){
        const title = req.body.postTitle;
        const content = req.body.postContent;
        const summary = req.body.postSummary;
        const file = req.files.postPicture;
        let filename = file.name;
        let path = __dirname + './public/img/'+filename;
        let filenumber = 0;
        while (fs.existsSync(path)) {
            filename = filenumber.toString() + filename;
            filenumber++;
            path = __dirname + './public/img/'+filename;
        };
        const post = new Post({
            title:title,
            content:content,
            summary:summary,
            imageName:'/img/'+filename
        });
        file.mv('./public/img/'+filename);
        post.save();
        
        
        res.redirect('/');
    }
    else{
        res.send('resim olmadan yollanmaz');
    }
    
})
app.route('/addperson').get((req,res)=>{
    res.render('addperson',{pageTitle:'Kişi Ekle'});
}).post((req,res)=>{
    if(req.files){
        const fname = req.body.fname;
        const lname = req.body.lname;
        const rutbe = req.body.rutbe;
        const file = req.files.picture;
        const email = req.body.email;
        const linkedin = req.body.linkedin;
        const behance = req.body.behance;
        const pinterest = req.body.pinterest;
        const personalWebsite = req.body.personalwebsite;
        let filename = file.name;
        let path = __dirname + './public/img/personimg/'+filename;
        let filenumber = 0;
        while (fs.existsSync(path)) {
            filename = filenumber.toString() + filename;
            filenumber++;
            path = __dirname + './public/img/personimg/'+filename;
        };
        const person = new Person({
            firstName:fname,
            lastName:lname,
            rutbe:rutbe,
            picture:'/img/personimg/'+filename,
            linkedin:linkedin,
            email:email,
            behance:behance,
            pinterest:pinterest,
            personalWebsite:personalWebsite

        });
        file.mv('./public/img/personimg/'+filename);
        person.save();
        
        
        res.redirect('/');
    }
    else{
        res.send('resim olmadan yollanmaz');
    }
})
const PORT = 3169;
app.listen(3169,()=>{
    console.log('Server up and running on Port: '+PORT.toLocaleString());
})