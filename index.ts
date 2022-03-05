import express from 'express';
var http = require('http');
var app = express();
var server = http.createServer(app);
const bodyParser = require('body-parser');
import { MongoClient, Db } from "mongodb";

var url = "mongodb://localhost:27017/";

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json())


//Add Phone Number
app.post('/phone-number/', async function (req, res) {
    try {
        var validPhone = validatePhone(req.body.phone);

        if (validPhone) {
            var formatedphone = formatPhone(req.body.phone);

            var db = await MongoClient.connect(url);
            var dbo = db.db("phone");
            var myobj = { phone: formatedphone };

            await dbo.collection("phones").insertOne(myobj);
            db.close();
            res.send("insert done.");
        }
        else {
            res.statusCode = 422;
            res.send({ "message": "Phone number must be a valid format" });
        }
    }
    catch (error) {
        res.statusCode = 404;
        res.send(error);
    }
});

//Get Phone Numbers
app.get('/phone-numbers/', async function (req, res) {
    try {
        var db = await MongoClient.connect(url);
        var dbo = db.db("phone");

        var query = {};
        var result = await dbo.collection("phones").find(query).toArray();
        db.close();
        res.send(result);
    }
    catch (error) {
        res.statusCode = 404;
        res.send(error);
    }
});

//Delete Phone Number
app.delete('/phone-number/:itemId', async function (req, res) {
    try {
        var db = await MongoClient.connect(url);
        var dbo = db.db("phone");

        var query = { phone: req.params.itemId };
        await dbo.collection("phones").deleteMany(query);
        db.close();
        res.send("delete done.");
    }
    catch (error) {
        res.statusCode = 404;
        res.send(error);
    }
});

//Update Phone Number
app.put('/phone-number/:itemId', async function (req, res) {
    try {
        var validPhone = validatePhone(req.body.phone);

        if (validPhone) {
            var formatedphone = formatPhone(req.body.phone);

            var db = await MongoClient.connect(url);
            var dbo = db.db("phone");
            var query = { phone: req.params.itemId };
            var newvalues = { $set: { phone: formatedphone } };

            await dbo.collection("phones").updateMany(query, newvalues);
            db.close();
            res.send("update done.");
        }
        else {
            res.statusCode = 422;
            res.send({ "message": "Phone number must be a valid format" });
        }
    }
    catch (error) {
        res.statusCode = 404;
        res.send(error);
    }
});

//format Phone
function formatPhone(inputPhone: string) {
    if (inputPhone.substring(0, 2) == "63") {
        inputPhone = "+" + inputPhone;
    }

    inputPhone = inputPhone.replace("+63", "0");
    return inputPhone;
}

//validate function
function validatePhone(inputPhone: string) {
    var pattern = new RegExp(/((^(\+)(\d){12}$)|(^\d{11}$))/);

    if (inputPhone.substring(0, 2) == "63") {
        inputPhone = "+" + inputPhone;
    }

    if (pattern.test(inputPhone)) {
        return true;
    } else {
        return false;
    }
}


server.listen(3000, function () {
    console.log("Server listening on port: 3000");
});

