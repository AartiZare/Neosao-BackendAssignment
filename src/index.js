const express = require('express');
const mongoose = require('mongoose');
const route = require("./routes/routes");
const bodyParser = require('body-parser');
const multer = require('multer');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer().any())

mongoose.connect("mongodb+srv://AartiZare:aartizare@cluster0.l0uzu.mongodb.net/Neosao?retryWrites=true&w=majority", {useNewUrlParser: true})
.then(() => console.log('MongoDB running on 27017'))
.catch(err => console.log((err)))

app.use('/', route);

app.listen(process.env.PORT || 3000, function(){
    console.log('Express app running on port '+ (process.env.PORT || 3000))
});
