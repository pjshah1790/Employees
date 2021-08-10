var sqlite3 = require('sqlite3').verbose();
var express = require('express');
var router = express.Router();
var http = require('http');
var path = require("path");
var bodyParser = require('body-parser');
var helmet = require('helmet');
var rateLimit = require("express-rate-limit");



var app = express();
var server = http.createServer(app);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});


var db = new sqlite3.Database('./database/employees.db');


app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'./public')));
app.use(helmet());
app.use(limiter);

db.run('CREATE TABLE IF NOT EXISTS emp(id Number, name TEXT, gender TEXT, bod TEXT, city TEXT)');

app.get('/', function(req,res){
  res.sendFile(path.join(__dirname,'./public/form.html'));
});


// Add
app.post('/add', function(req,res){
  db.serialize(()=>{
    db.run('INSERT INTO emp(id,name,gender,bod,city) VALUES(?,?,?,?,?)', [req.body.id, req.body.name,req.body.gender,req.body.bod,req.body.city], function(err) {
      if (err) {
        return console.log(err.message);
      }
      console.log("New employee has been added");
      res.send("New employee has been added into the database with ID = "+req.body.id+ " and Name = "+req.body.name);
    });

  });

});


// View
app.post('/view', function(req,res){
  db.serialize(()=>{
    db.each('SELECT id ID, name NAME FROM emp WHERE id =?', [req.body.id], function(err,row){     //db.each() is only one which is funtioning while reading data from the DB
      if(err){
        res.send("Error encountered while displaying");
        return console.error(err.message);
      }
      res.send(` ID: ${row.ID},    Name: ${row.NAME}`);
      console.log("Entry displayed successfully");
    });
  });
});


//Update
app.post('/update', function(req,res){
  db.serialize(()=>{
    db.run('UPDATE emp SET name = ? WHERE id = ?', [req.body.name,req.body.id], function(err){
      if(err){
        res.send("Error encountered while updating");
        return console.error(err.message);
      }
      res.send("Entry updated successfully");
      console.log("Entry updated successfully");
    });
  });
});

// Delete
app.post('/delete', function(req,res) {
  db.serialize(() => {
    db.run('DELETE FROM emp WHERE id = ?', req.body.id, function (err) {
      if (err) {
        res.send("Error encountered while deleting");
        return console.error(err.message);
      }
      res.send("Entry deleted");
      console.log("Entry deleted");
    });
  });

  app.post('/viewData', function (req, res) {
    db.serialize(() => {
      router.get('/user-list', function(req, res, next) {
        var sql='SELECT * FROM emp';
        db.run(sql, function (err, data, fields) {
          if (err) throw err;
          res.send('user-list', { title: 'User List', userData: data});
        });
      });
      module.exports = router;

      //db.run('SELECT * FROM emp ', function (err, data) {
     //   if (err) {
      //    res.send("Error encountered while deleting");
      //    return console.error(err.message);
      //  }
      //  res.send("Show All Data");
     //   res.render('user-list', {title: 'User List', userData: data});
      //  console.log("Show All Data");
      });
    });

    //var sql='SELECT * FROM emp';
    //db.query(sql, function (err, data, fields) {
    //   if (err) throw err;
    //   res.render('user-list', { title: 'User List', userData: data});
    //   console.log("Show All Data");
    // });
   // <%
  //if(userData.length!=0){
   //   var i=1;
   //   userData.forEach(function(data){
  //    %>
  //    <%  i++; }) %>
    //  <% } else{ %>
   // <% } %>
  //});
});


// Closing the database connection.
  app.get('/close', function (req, res) {
    db.close((err) => {
      if (err) {
        res.send('There is some error in closing the database');
        return console.error(err.message);
      }
      console.log('Closing the database connection.');
      res.send('Database connection successfully closed');
    });

  });


  server.listen(3000, function () {
    console.log("server is listening on port: 3000");
  });


