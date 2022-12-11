var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser')
const { authenticate } = require('ldap-authentication')
const path = require('path');

var app = express();

app.use(cookieParser());
app.use(bodyParser.urlencoded());
app.use(session({ secret: "Shh, its a secret!" }));

app.get('/auth', function (req, res) {
    if (req.session.uid) {
        res.status(200).send("OKE")
    } else {

        res.status(401).send("GA OKE?")
    }
});
app.get('/auth/401', function (req, res) {
    res.sendFile(path.join(__dirname, '/page/401.html'));
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
    var uid = "uid=" + req.body.username + ",cn=users,cn=accounts,dc=dignas,dc=space"
    authenticate({
        ldapOpts: { url: 'ldap://freeipa.dignas.space:389' },
        userDn: uid,
        userPassword: req.body.password,
    }).then((res) => {

        req.session.uid = uid
        res.redirect("/")
    }).catch(() => {

        res.redirect("/auth/login")
    })
    // res.send("OKE LOGIN")
});
app.listen(3000);