const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const NodeCouchDb = require('node-couchdb');

// connect to couch db
const couch = new NodeCouchDb({
	auth: {
		user:     'admin',
		password: 'admin'
	}
});

const dbname = 'todolist';
const viewUrl = '_design/all_list/_view/all';
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


app.get('/', function(req, res){
	couch.get(dbname, viewUrl).then(
		function(data, headers, status){
			//console.log(data.data.rows);
			res.render('index',{ todolist: data.data.rows });
		},
		function(err){
			// error
			res.send(err);
		});
});

app.post('/list/add', function(req, res){

	// date from form
	const text = req.body.text;

	// couch.uniqid().then(ids => ids[0]);
	couch.uniqid().then(function(ids){
		const id = ids[0];

		/*
			couch.insert("databaseName", {
    		_id: "document_id",
    		field: ["sample", "data", true]
    	*/

		couch.insert(dbname,{ _id:id, text:text }).then(

			function(data,headers,status){
				// redirect 
				res.redirect('/');
			},
			function(err){
				// error
				res.send(err);
			});
	});
});

app.post('/list/delete/:id', function(req, res){

	// date from form 
	const id = req.params.id;
	console.log(id);
	const rev = req.body.rev;

	// couch.del("databaseName", "some_document_id", "document_revision") with promise
	couch.del(dbname,id,rev).then(
		function(data,headers,status){
			// redirect 
			res.redirect('/');
		},
		function(){
			// error
			res.send(err);
		});
});

var port = 5000;
app.listen(port, function(){
	console.log('Server started on port ', port);
});