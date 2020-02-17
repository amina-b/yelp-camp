var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect('mongodb://localhost:27017/yelp_camp', {useNewUrlParser: true});

var campSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String
});

var Campgrounds = mongoose.model("campgrounds", campSchema);

// PRIKAZIVANJE NASLOVNE STRANE

app.get("/", function(req,res){
    res.render("landing");
});

// PRIKAZUJE SVE CAMPGROUNDS IZ BAZE

app.get("/campgrounds", function(req,res) { 
    Campgrounds.find({}, function(err,campgrounds){
        if (err)
        {
            console.log(err)
        } else {
            res.render("campgrounds", { campgrounds: campgrounds});
        }
    });  
});

// KREIRANJE NOVOG CAMPGROUNDA

app.post("/campgrounds", function(req,res){ 
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    Campgrounds.create(
    {
        name: name, image: image, description: desc
    }, function (err, campgrounds){
        if (err) {
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
    });
});

// FORMA ZA DODAVANJE NOVOG CAMPGROUNDA

app.get("/campgrounds/new",function(req,res){  
    res.render("new");
});

// PRIKAZIVANJE VISE INFORMACIJA O JEDNOM CAMPGROUNDU

app.get("/campgrounds/:id", function(req,res){
    Campgrounds.findById(req.params.id, function (err, campground){
        if (err) {
            console.log(err)
        } else {
            res.render("show", { campground: campground });
        }
    });
});


app.listen(8080, function(){
    console.log("Yeplcamp has started");
});