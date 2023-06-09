//jshint esversion:6
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const bcrypt = require('bcrypt');
const saltRounds = 10;

mongoose.Promise = global.Promise;

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.URL);
}

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = new mongoose.model("User", userSchema);

const app = express();

app.set("view engine", "ejs");

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.route("/")
  .get(function (req, res) {
    res.render("home")
});

app.route("/login")
  .get(function (req, res) {
    res.render("login")
  })
  .post(async function (req, res) {
    const user = req.body.username;
    const password = req.body.password;

    User.findOne({ email: user })
    .then((result) => {
      if (result) {
        bcrypt.compare(password, result.password, function (err, results) {
          if (results) {
            res.send("secret");
        }
      });
      }
    }).catch((err) => {
      res.send(err);
    });
});
app.route("/register")
  .get(function (req, res) {
    res.render("register")
  })
  .post(async function (req, res) {
    bcrypt.hash(req.body.password, saltRounds, async function(err, hash) {
      const user = await new User({
        email : req.body.username,
        password : hash
      });
  
      await user.save()
        .then((result) => {
          res.render("secrets");
        }).catch((err) => {
          res.send(err);
        });
    });
    
});


app.listen(80 || process.env.PORT, function() {
  console.log("Server running at http://localhost:80/");
});