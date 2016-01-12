var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);
	nicknames = [];
	chat = [];

var mysql = require('mysql');

var conneck = mysql.createPool({
	connectionLimit : 100,
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'node',
	debug: false
});

server.listen(8080);

app.get('/',function(req, res){
	res.sendfile(__dirname + '/index.html');
});
var notif = 0;
io.sockets.on('connection',function(socket){
	socket.on('new user',function(data,callback){
		if(nicknames.indexOf(data) != -1) {
			callback(false);
		}else {
			callback(true);
			socket.nickname = data;
			nicknames.push(socket.nickname);
			updateNickmanes();
			// conneck.query('select * from node_table', selectChat);

			// function selectChat(error,results,fields)
			// {
			// 	if(error)
			// 	{
			// 		console.log('error to ger message'+error.message);
			// 	}
			// 	else
			// 	{
			// 		io.sockets.emit('Display Chat',results);
			// 	}
			// }
		}
	});
	socket.on('reset notif',function(data){
		if(data == true) {
			notif = 0;
		}
	});
	function updateNickmanes() {
		io.sockets.emit('usernames',nicknames);
	}
	socket.on('send message',function(	data){
		insertToMysql(data,socket.nickname);
		io.sockets.emit('new message',chat);
		notif += 1;
		io.sockets.emit('new notif',notif);
		io.emit('output',[{nama:socket.nickname,chat:data}]);
	
		// socket.broadcast.emit('new message',data);
	});
	socket.on('disconnect',function(data){
		if(!socket.nickname) return;
		nicknames.splice(nicknames.indexOf(socket.nickname),1);
	})

	function insertToMysql(chat,name) {
		var param = {
			nama: name,
			chat: chat
		};
		var query = conneck.query('insert into node_table set ?',param,function (err,result){

		});
	}

	var query = conneck.query('SELECT * FROM node_table',function (err,res){
		if(err) throw err;
		io.sockets.emit('output',res);
	});
});
