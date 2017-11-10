const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const NodeCouchDb = require('node-couchdb');



//var PouchDB = require('pouchdb');

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

app.use(express.static(path.join(__dirname, 'js')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


app.get('/', function(req, res){
	couch.get(dbname, viewUrl).then(
		function(data, headers, status){
			console.log(data.data.rows);
			res.render('index',{ todolist: data.data.rows });
		},
		function(err){
			res.send(err);
		});
});

app.post('/list/add', function(req, res){
	const text = req.body.text;
	couch.uniqid().then(function(ids){
		const id = ids[0];
		couch.insert(dbname,{ _id:id, text:text }).then(
			function(data,headers,status){ 
				res.redirect('/');
			},
			function(err){
				res.send(err);
			});
	});
});

app.post('/list/delete/:id', function(req, res){
	const id = req.params.id;
	const rev = req.body.rev;
	couch.del(dbname,id,rev).then(
		function(data,headers,status){
			res.redirect('/');
		},
		function(){
			res.send(err);
		});
});

var port = 5000;
app.listen(port, function(){
	console.log('Server started on port ', port);
});