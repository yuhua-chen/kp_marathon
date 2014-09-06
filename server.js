var io = require('socket.io').listen(7777);
io.set('log level', 1);

//Host instance
var hostId = '';

io.sockets.on('connection', function (socket) {

	//----------------S2C-------------------

	var client = socket.handshake.address;
	var uuid = socket.id;

	console.log(String.format('Player connected from [{0}: {1}], id: {2}',client.address,client.port, uuid));

	//S2C 發送連線成功訊號
	socket.emit('s2c-connected', { message: 'connect-success' });

	//C2S 接收手機玩家加入訊息
	socket.on('c2s-join', function (data) {
		console.log(String.format('Player [{0}] joined from [{1}: {2}], id:{3}', data.username ,client.address,client.port,uuid));
		S2H_PlayerJoined(uuid, data.username);
	});

	//接收手機玩家推推訊息
	socket.on('c2s-push', function () {
		S2H_PlayerPush(uuid);
		console.log(String.format('Push from [{0}: {1}]',client.address,client.port));
	});

	//C2S 接收手機斷線訊息
	socket.on('disconnect', function(){
		if(hostId == uuid){
			console.log('Host has disconnected');
			hostId = '';
			S2AC_HostDisconnected();
		}else{
			console.log(String.format('Player disconnected from [{0}: {1}]',client.address,client.port));
			S2H_PlayerDisconnected(uuid);
		}
	});

	//S2AC 場景轉換訊息
	function S2AC_GotoScene(p_Scene){
		socket.broadcast.emit('s2ac-gotoscene', { message: p_Scene });
	}

	//S2AC 發送遊戲開始訊息
	function S2AC_StartGame(){
		socket.broadcast.emit('s2ac-startgame');
	}

	//告訴大家Host斷線了
	function S2AC_HostDisconnected(){
		socket.broadcast.emit('s2ac-host-disconnected');	
	}

	//----------------S2C-------------------
	//--------------------------------------
	//----------------S2H-------------------

	//H2S 接收遊戲開始訊息
	socket.on('h2s-startgame',function(){
		S2AC_StartGame();
		console.log('Host has started the game!');
	});

	//發送給Host玩家加入訊息
	function S2H_PlayerJoined(p_UUID, p_UserName){
		console.log('Sending player join message to host.');
		socket.broadcast.emit('s2h-player-join', { uuid: p_UUID, username: p_UserName });		
	}

	function S2H_PlayerPush(p_UUID){
		socket.broadcast.emit('s2h-player-push', { uuid: p_UUID});			
	}

	function S2H_PlayerDisconnected(p_UUID){
		socket.broadcast.emit('s2h-player-disconnected', { uuid: p_UUID});			
	}

	function H2S_PlayerReached(){
		socket.emit('s2c-player-reached', { uuid: p_UUID});				
	}

	socket.on('h2s-register',function(){
		hostId = uuid;
		console.log(String.format('Host has register id [{0}] to server',hostId));
	});

	socket.on('h2s-player-reached',function(data){
		var client = FindClientById(data.uuid);
		console.log('id: ' + client.id);
		client.emit('s2c-player-reached',{rank: data.rank});
	});
	
	socket.on('c2h-get-lottery',function(){
		socket.broadcast.emit('c2h-get-lottery');	
	})

	function FindClientById(p_Id){
		var clients = io.sockets.clients();
		for(c=0;c<clients.length;c++){
			if(clients[c].id == p_Id){
				return clients[c];
			}
		}
		return null;
	}

	//----------------S2H-------------------
});



















//-------------String.format---------------

//可在Javascript中使用如同C#中的string.format
//使用方式 : var fullName = String.format('Hello. My name is {0} {1}.', 'FirstName', 'LastName');
String.format = function ()
{
    var s = arguments[0];
    if (s == null) return "";
    for (var i = 0; i < arguments.length - 1; i++)
    {
        var reg = getStringFormatPlaceHolderRegEx(i);
        s = s.replace(reg, (arguments[i + 1] == null ? "" : arguments[i + 1]));
    }
    return cleanStringFormatResult(s);
}
//可在Javascript中使用如同C#中的string.format (對jQuery String的擴充方法)
//使用方式 : var fullName = 'Hello. My name is {0} {1}.'.format('FirstName', 'LastName');
String.prototype.format = function ()
{
    var txt = this.toString();
    for (var i = 0; i < arguments.length; i++)
    {
        var exp = getStringFormatPlaceHolderRegEx(i);
        txt = txt.replace(exp, (arguments[i] == null ? "" : arguments[i]));
    }
    return cleanStringFormatResult(txt);
}
//讓輸入的字串可以包含{}
function getStringFormatPlaceHolderRegEx(placeHolderIndex)
{
    return new RegExp('({)?\\{' + placeHolderIndex + '\\}(?!})', 'gm')
}
//當format格式有多餘的position時，就不會將多餘的position輸出
//ex:
// var fullName = 'Hello. My name is {0} {1} {2}.'.format('firstName', 'lastName');
// 輸出的 fullName 為 'firstName lastName', 而不會是 'firstName lastName {2}'
function cleanStringFormatResult(txt)
{
    if (txt == null) return "";
    return txt.replace(getStringFormatPlaceHolderRegEx("\\d+"), "");
}