'use strict';

let express = require('express');
let app = express();

require('dotenv').config();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.set('view engine' , 'ejs');

app.get('/hello', (request, response) => {
    response.render('pages/index');
});

//port
app.listen(3001 , () => {
    console.log(`Listening to port 3001`);
});