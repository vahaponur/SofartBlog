
const express = require('express');
const upload = require('express-fileupload');
const fs = require('fs');
const _ = require('lodash');
const mongoose = require('mongoose');
String.prototype.turkishtoEnglish = function () {
    return this.replace('Ğ', "G")
    .replace('Ü','U')
    .replace('Ş','S')
    .replace('I','I')
    .replace('İ','I')
    .replace('Ö','O')
    .replace('Ç','C')
    .replace('ğ','g')
     .replace('ü','u')
    .replace('ş','s')
    .replace('ı','i')
    .replace('ö','o')
    .replace('ç','c');
};
function Cevir(text)
 {
    var trMap = {
        'çÇ':'c',
        'ğĞ':'g',
        'şŞ':'s',
        'üÜ':'u',
        'ıİ':'i',
        'öÖ':'o'
    };
    for(var key in trMap) {
        text = text.replace(new RegExp('['+key+']','g'), trMap[key]);
    }
    return  text.replace(/[^-a-zA-Z0-9\s]+/ig, '') 
                .replace(/\s/gi, "-") 
                .replace(/[-]+/gi, "-") 
                .toLowerCase();

}
const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(upload());
let categories = ["Edebiyat",
"Ekoloji",
"Eleştiri",
"Farklı Sanat Dalları",
"Felsefe",
"Gezi Yazıları",
"Güncel",
"İç Mimari",
"İlginç Tasarımlar",
"Malzeme",
"Mimari",
"Mitoloji/Tarih",
"Özel Günler",
"Psikoloji/Sosyoloji",
"Röportaj",
"Yapı",];
let categoripagenames =[];
categories.forEach(element => {
    let trversion = Cevir(element);
    categoripagenames.push(trversion);
});

mongoose.connect('mongodb://localhost:27017/sofartDB');
const personSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    rutbe: {
        type: String,
        required: true
    },
    picture: {
        type: String,
        required: true
    },
    linkedin: {
        type: String
    },
    email: {
        type: String
    },
    behance: {
        type: String
    },
    pinterest: {
        type: String
    },
    personalWebsite: {
        type: String
    }

});
const Person = mongoose.model('person', personSchema);

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },

    person1: [{type:mongoose.Schema.Types.ObjectId, ref:'Person'}],
    person2: [{type:mongoose.Schema.Types.ObjectId, ref:'Person'}],
    imageName: {
        type: String,
        required: true
    },
    tip: {
        type: String
    },
    category:{
        type:String,
        required:true
    },
    girditipi:{
        type:String
    }

});
const Post = mongoose.model('Post', postSchema);

//Anasayfa Girişi
app.route('/').get((req, res) => {
    Post.find({}).sort({ '_id': -1 }).limit(3).then(results => {
        res.render('index', { pageTitle: 'SofART Sanat ve Kültür Dergisi', featuredPosts: results });
    })

})

//Yeni Post Girişi
app.route('/newentry').get((req, res) => {

    Person.find({}, (err, results) => {
        if (err) {
            res.send(err);
        }
        else {
            if (results) {
                res.render('newentry', { pageTitle: 'Sofart - Post Girişi', personlist: results, categories:categories });
            }
        }

    })

}).post((req, res) => {
    const promises = [
        Person.findById(mongoose.Types.ObjectId(req.body.personone.toString())).exec(),
        Person.findById(mongoose.Types.ObjectId(req.body.persontwo.toString())).exec(),
    ];
 
    Promise.all(promises).then((data)=>{
        
        let personone = data[0]._id;
        let persontwo = data[1]._id;
        
        
       
        if (req.files) {
            const title = req.body.postTitle;
            const content = req.body.postContent;
            const summary = req.body.postSummary;
            const file = req.files.postPicture;
            const tip = req.body.postTip;
            const category = Cevir(req.body.category);
            const girditipi = req.body.girditipi;
            let filename = file.name;
            let path = __dirname + '/public/img/' + filename;
            let filenumber = 0;
            while (fs.existsSync(path)) {
                filename = filenumber.toString() + filename;
                filenumber++;
                path = __dirname + '/public/img/' + filename;
            };
            const post = new Post({
                title: title,
                content: content,
                summary: summary,
                imageName: '/img/' + filename,
                person1: personone,
                person2: persontwo,
                tip: tip,
                category: category,
                girditipi:girditipi
    
            });
            
            file.mv('./public/img/' + filename);
            post.save().then(()=>{
                res.redirect('/newentry');
            })
    
            
        }
        else {
            res.send('resim olmadan yollanmaz');
        }
    });

  

});

// Yeni Üye Girişi
app.route('/addperson').get((req, res) => {
    res.render('addperson', { pageTitle: 'Kişi Ekle' });
}).post((req, res) => {
    if (req.files) {
        
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
        let path = __dirname + '/public/img/personimg/' + filename;
        let filenumber = 0;
        while (fs.existsSync(path)) {
            filename = filenumber.toString() + filename;
            filenumber++;
            path = __dirname + '/public/img/personimg/' + filename;
        };
        if (!fs.existsSync(path)) {

            const person = new Person({
                firstName: fname,
                lastName: lname,
                rutbe: rutbe,
                picture: '/img/personimg/' + filename,
                linkedin: linkedin,
                email: email,
                behance: behance,
                pinterest: pinterest,
                personalWebsite: personalWebsite

            });
            file.mv('./public/img/personimg/' + filename);
            person.save().then(()=>{
                res.redirect('/addperson');
            });


            
        }

    }
    else {
        res.send('resim olmadan yollanmaz');
    }
});

//Post Routing
app.route('/post/:postID').get((req,res)=>{

    Post.findById(mongoose.Types.ObjectId(req.params.postID.toString())).exec().then((post)=>{
            
            const postyolla = post;
            
            const otherPost=[
                Post.findOne({_id:{$lt:post._id}}).sort({_id:-1}).exec(),
                Post.findOne({_id:{$gt:post._id}}).sort({_id:1}).exec(),
            ];

            let previous="bos",next = "bos";

            Promise.all(otherPost).then(data=>{
                if(data[0]){
                    previous = data[0];
                }
                if(data[1]){
                    next = data[1];
                }


                if(postyolla.tip !=="tek"){
                    const promises =[
                        Person.findById(mongoose.Types.ObjectId(post.person1[0].toString())).exec(),
                        Person.findById(mongoose.Types.ObjectId(post.person2[0].toString())).exec(),
                    ]
                    
                    
                    Promise.all(promises).then((data)=>{
                        let yazar = data[0];
                        let grafiker = data[1];
                        res.render('post',{pageTitle:post.title + " - SofART Dergi",post:post, yazar:yazar, grafiker:grafiker,previous:previous,next:next});
                    });
                    
                }
    
                else{
                    Person.findById(mongoose.Types.ObjectId(post.person1[0].toString())).exec().then((data)=>{
                        let yazar = data;
                        res.render('post',{pageTitle:post.title,post:post, yazar:yazar, grafiker:yazar,previous:previous,next:next});
                    })
                }
             
            });
    });

});
app.route('/yazilar/:page').get((req,res)=>{

    let perPage = 9;
    const page = req.params.page||1; 
  
    Post.countDocuments({girditipi:"yazidir"}).exec().then(count=>{
        let previous= page-1||1;
        let next = 0;
        if(count>page*perPage){
            next = Number(Number(page)+1);
        }
        else{
            next = 0;
        }
        
        Post.find({girditipi:"yazidir"}).sort({_id:-1}).skip((perPage*page)-perPage).limit(perPage).exec().then(data=>{
           console.log(data.length);
            res.render('yaziler',{pageTitle:"Yazilar",categories:categories,yazilar:data,previous:previous,next:next,asilyazilar:count})
        });
    })
   
});

app.route('/yazilar/:category/:page').get((req,res)=>{
    let catindex = 0;
    for (catindex; catindex < categoripagenames.length; catindex++) {
        if(categoripagenames[catindex] == req.params.category){
            break;
        }
    }
    let searchfrom =req.params.category
    let perPage = 9;
    const page = req.params.page||1; 
    
    Post.countDocuments({category:searchfrom.toString()}).exec().then(count=>{
        let previous= page-1||1;
        let next = 0;
        if(count>page*perPage){
            next = Number(Number(page)+1);
        }
        else{
            next = 0;
        }
        
        Post.find({category:searchfrom.toString()}).sort({_id:-1}).skip((perPage*page)-perPage).limit(perPage).exec().then(data=>{
           
            res.render('yaziler',{pageTitle:categories[catindex].toString(),categories:categories,yazilar:data,previous:previous,next:next,asilyazilar:count})
        });
    })
});



const PORT = 3000;
app.listen(PORT, () => {
    console.log('Server up and running on Port: ' + PORT.toLocaleString());
})