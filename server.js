'use strict';

let express = require('express');
let app = express();
let superagent = require('superagent');
let pg = require('pg'); //postgresql
let methodOverride = require('method-override');

require('dotenv').config();
let PORT = process.env.PORT;
let DATABASE_URL = process.env.DATABASE_URL;
let client = new pg.Client(DATABASE_URL); //client is a middle between postgresql and server.js

app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
// app.use('/public/styles',express.static(__dirname+'public/styles'));
app.set('view engine', 'ejs');

app.use(methodOverride('_method'));

//index
app.get('/',homepage);

function homepage(request,response){
    let DB = `SELECT * FROM books;`;
    client.query(DB).then((data)=>{
        //to read the data
        // console.log(data); 
        // response.send(data); 
        //variable to save the rows from the data object
        let DBrow = data.rows;
        // response.send(DBrow); //test
        
        response.render('pages/index',{x:DBrow,
        y:data.rowCount});
    })
    .catch(error =>{
        console.log('error');
    })
}
//
app.get('/books/:id',handleBooks);

function handleBooks(request,response){
    let URLid = request.params.id;
    let DB = `SELECT * FROM books WHERE id = ${URLid};`;
    client.query(DB).then((data) => {
        response.render('pages/books/show',{x:data.rows[0]});
    });
}

//search form page
app.get('/searches/new', (request, response) => {
    response.render('searches/new');
});

//
app.put ('/books/:id', bookUpdate);

function bookUpdate(req,res){
    let recievedUpdate = req.body;
    let statement = `UPDATE books SET title =$1, Author=$2, isbn=$3, image_url=$4, descr=$5  WHERE id=$6;`;
    let values = [recievedUpdate.title, recievedUpdate.author, recievedUpdate.isbn, recievedUpdate.image_url, recievedUpdate.descr, recievedUpdate.id];
    client.query(statement, values).then( data =>{
      res.redirect(`/books/${recievedUpdate.id}`);
      console.log('item updated ' + recievedUpdate.id);
    }).catch((error) => {
      console.log('error happend in the updated data...',error);
    });
  }
  
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
app.post ('/books', HandellBooks);

function HandellBooks(req, res){
  let newBookAdded = req.body;
  let statement = `INSERT INTO books (title, Author, isbn, image_url, descr) VALUES ($1,$2,$3,$4,$5) RETURNING id ;`;
  let values = [newBookAdded.title,newBookAdded.author,newBookAdded.isbn,newBookAdded.image_url,newBookAdded.descr];
  client.query(statement,values).then( data =>{
    console.log(data.rows[0].id,'insid the book/is');
    res.redirect(`/books/${data.rows[0].id}`);

  }).catch((error) => {
    console.log('error happend in the HandellBookID SQL',error);
  });
}

//
function Book(bookObj) {
    this.title = bookObj.volumeInfo.title ?bookObj.volumeInfo.title : 'No title Found' ;
    this.author = bookObj.volumeInfo.authors ?bookObj.volumeInfo.authors :'No title authors' ;
    this.description = bookObj.volumeInfo.description?bookObj.volumeInfo.description:'No title description' ;
    this.image = bookObj.volumeInfo.imageLinks? bookObj.volumeInfo.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
}

//port
client.connect().then( () => {
    app.listen(PORT, () => {

        console.log(`Listening to port ... ${PORT}`);
    
    });

}).catch(error =>{
    console.log('error connect to DB' , error);
});

