var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser')
const { authenticate } = require('ldap-authentication')
var rauth
const path = require('path');

var app = express();

app.use(cookieParser());
app.use(express.urlencoded());
app.use(session({ secret: "Shh, its a secret!" }));

app.get('/auth', function (req, res) {
    if (req.session.uid) {
        res.status(200).send("OKE")
    } else {

        res.status(401).send("GA OKE?")
    }
});
app.get('/auth/401', function (req, res) {
    res.send("WADUH")
});


app.get('/auth/login', function (req, res) {
    if (!req.session.uid) {

        res.sendFile(path.join(__dirname, '/page/login.html'));
    } else {
        res.redirect("/")
    }
});

app.post('/auth/login', async function  (req, res) {
    var uid =  "uid=" + req.body.username + ",cn=users,cn=accounts,dc=dignas,dc=space"
    let authenticated = await authenticate({
        ldapOpts: { url: 'ldap://freeipa.dignas.space:389' },
        userDn: uid,
        userPassword: req.body.password,
    })
    if(authenticated) {
        req.session.uid = uid
        res.redirect("/")
    }else {
        res.redirect("/auth/login")
    }
    // res.send("OKE LOGIN")
});
app.listen(3000);