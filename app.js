const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const NodeCouchDb = require('node-couchdb');


// вводим логин пароль для коучДиБи
const couch = new NodeCouchDb({
	auth: {
		user:     'admin',
		password: 'admin'
	}
});
// название базы и ссылка на нее
const dbname = 'todolist';
const viewUrl = '_design/all_list/_view/all';

const app = express();
// порт
var port = 5000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));


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

// гет-запрос на добавление записи
app.post('/list/add', function(req, res){
	// получаем текст с формы
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

// гет-запрос на удаление
app.post('/list/delete/:id', function(req, res){
	// передаем данные с формы (айди и рев)
	const id = req.params.id;
	const rev = req.body.rev;
	// спользуем 'del' для удаления записи по 'id','rev' 
	couch.del(dbname,id,rev).then(
		function(data,headers,status){
			res.redirect('/');
		},
		function(){
			res.send(err);
		});
});

// прослушиваем порт
app.listen(port, function(){
	console.log('Server started on port ', port);
});