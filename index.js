var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser')
const { authenticate } = require('ldap-authentication')
const path = require('path');
require('dotenv').config()

var app = express();

app.use(cookieParser());
app.use(bodyParser.urlencoded());
app.use(session({ secret: "Shh, its a secret!" }));

app.get('/auth', function (req, res) {
    if (req.session.uid) {
        var header = req.headers.requrl.includes("ide-" + req.session.uid)
        if (header) {
            res.status(200).send("OKE")

        } else {

            res.status(401).send("OKE")
        }
    } else {

        res.status(401).send("GA OKE?")
    }
});
app.get('/auth/401', function (req, res) {
    res.redirect("/auth/login")
});


app.get('/auth/login', function (req, res) {
    if (!req.session.uid) {

        res.sendFile(path.join(__dirname, '/page/login.html'));
    } else {
        res.redirect("/")
    }
});

app.get('/auth/logout', function (req, res) {
    req.session.destroy()
    res.redirect("/auth/login")
});

app.post('/auth/login', function (req, res) {
    console.log(req.body.password)
    var uid = "uid=" + req.body.username + process.env.BASEDN
    authenticate({
        ldapOpts: { url: 'ldap://' +process.env.LDAPURL+ ':389' },
        userDn: uid,
        userPassword: req.body.password,
    }).then((res) => {

        req.session.uid = req.body.username
        res.redirect("/")
    }).catch(() => {

        res.redirect("/auth/login")
    })
    // res.send("OKE LOGIN")
});
app.listen(3000);