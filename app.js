
const express = require('express');
const upload = require('express-fileupload');
const fs = require('fs');
const mongoose = require('mongoose');

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
    let promises = [
        Person.findById(mongoose.Types.ObjectId(req.body.personone.toString())).exec(),
        Person.findById(mongoose.Types.ObjectId(req.body.persontwo.toString())).exec(),
    ];
 
    Promise.all(promises).then((data)=>{
        
        let personone = data[0]._id;
        let persontwo = data[1]._id;
        console.log(personone[0]);
        
       
        if (req.files) {
            const title = req.body.postTitle;
            const content = req.body.postContent;
            const summary = req.body.postSummary;
            const file = req.files.postPicture;
            const tip = req.body.postTip;
            const category = req.body.category;
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
                category: category
    
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


const PORT = 3169;
app.listen(3169, () => {
    console.log('Server up and running on Port: ' + PORT.toLocaleString());
})