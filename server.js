'use strict';

let express = require('express');
let app = express();
let superagent = require('superagent');
require('dotenv').config();
let PORT = process.env.PORT;


app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
// app.use('/public/styles',express.static(__dirname+'public/styles'));
app.set('view engine', 'ejs');

//index page
app.get('/', (request, response) => {
    response.render('pages/index');
});

//search form page
app.get('/searches/new', (request, response) => {
    response.render('searches/new');
});
//
app.post('/searches', (request, response) => {
    let result = request.body;

    let url = `https://www.googleapis.com/books/v1/volumes?q=${result.userInput}+${result.searchBy}`;
    superagent.get(url).then(bookResult => {
        let booksItems = bookResult.body.items;
        let selctedBooksArr = booksItems.map(info => {
            return new Book(info);
        });
        console.log(selctedBooksArr);
        response.render('searches/show', { key: selctedBooksArr });
    }).catch(error => { 
        console.log('Sorry .. an error Occured in Google API ', error); 
        response.send('error');
    });

    // response.send(result); //test
});

//
function Book(bookObj) {
    this.title = bookObj.volumeInfo.title ?bookObj.volumeInfo.title : 'No title Found' ;
    this.author = bookObj.volumeInfo.authors ?bookObj.volumeInfo.authors :'No title authors' ;
    this.description = bookObj.volumeInfo.description?bookObj.volumeInfo.description:'No title description' ;
    this.image = bookObj.volumeInfo.imageLinks? bookObj.volumeInfo.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';

}

//port
app.listen(PORT, () => {
    console.log(`Listening to port ... ${PORT}`);
});