var express     = require("express");
var app         = express();
var bodyParser  = require("body-parser");
var mongoose    = require("mongoose");
var Campgrounds = require("./models/campground");
var seedDB      = require("./seeds");  
var Comment     = require("./models/comment");
var passport    = require("passport");
var LocalStrategy = require("passport-local");
var User          =require("./models/user");


//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret:"secreeet!!",
    resave: false,
    saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("./public"));
seedDB();

mongoose.connect('mongodb://localhost:27017/yelp_camp', {useNewUrlParser: true});


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
            res.render("campgrounds/index", { campgrounds: campgrounds, currentUser:req.user });
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
    res.render("campgrounds/new");
});

// PRIKAZIVANJE VISE INFORMACIJA O JEDNOM CAMPGROUNDU

app.get("/campgrounds/:id", function(req,res){
    Campgrounds.findById(req.params.id).populate("comments").exec(function (err, campground){
        if (err) {
            console.log(err)
        } else {
            
            res.render("campgrounds/show", { campground: campground });
        }
    });
});


// PRIKAZIVANJE FORME ZA KOMENTAR

app.get("/campgrounds/:id/comments/new", function(req,res){
    Campgrounds.findById(req.params.id, function (err, campground){
        if (err) {
            console.log(err)
        } else {
            res.render("comments/new", { campground: campground });
        }
    });
});

// KREIRANJE KOMENTARA

app.post("/campgrounds/:id/comments",  function(req,res){
    Campgrounds.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err)
        } else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    console.log(err)
                } else {
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect("/campgrounds/" + campground._id);
                }
            })
        }
    })
});

// REGISTRACIJA USERA

app.get("/register", function(req,res){
    res.render("register");
});

app.post("/register", function(req,res){
    var newUser = new User ({ username : req.body.username});
    User.register(newUser, req.body.password, function (err, user){
        if (err) {
            console.log(err);
            return res.render("/register");
        } else {
                passport.authenticate("local")(req,res, function(){
                res.redirect("/campgrounds");
            })
        }
    });
});

//LOGIN USER

app.get("/login", function(req,res){
    res.render("login");
});

app.post("/login", passport.authenticate("local",   
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req,res){
});

//LOGOUT USER

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/campgrounds");
});

//MIDDLEWARE

function isLoggedIn(req,res,next)
{
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

app.listen(8080, function(){
    console.log("Yeplcamp has started");
});