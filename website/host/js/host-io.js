//socket.io
var socket = io.connect('http://localhost:7777');

function NotifyPlayerHasReached(p_UUID, p_Rank){
	var playerIndex = FindPlayerIndexByUUID(p_UUID);
	socket.emit('h2s-player-reached', { uuid: p_UUID, rank: p_Rank });
	console.log(String.format('Player #{0} [{1}] has reached, #{2}',playerIndex,playerArray[playerIndex].playerName, p_Rank));
}

function SendStartRace(){
	socket.emit('h2s-startgame', { message: 'start-game' });
}

socket.on('s2h-log',function(data){
	console.log(data);
});

socket.on('connect',function(){
	$('#canvas-main').css('border-color','green');
	console.log('Connected to server.');
	socket.emit('h2s-register');
});

socket.on('disconnect',function(){
	$('#canvas-main').css('border-color','black');
});

socket.on('s2h-player-join', function(data){
	console.log('Player ' + data.username + ' joined the game, uuid: ' + data.uuid);
	addPlayer(data.uuid, data.username);
	//ListPlayers();
});	

socket.on('s2h-player-disconnected', function(data){
	var playerIndex = FindPlayerIndexByUUID(data.uuid);
	removePlayer(playerIndex);
	console.log('Player ' + playerIndex + ' has left the game.');
});

socket.on('s2h-player-push',function(data){
	pushPlayer(FindPlayerIndexByUUID(data.uuid));
});

socket.on('c2h-get-lottery',function(){
	window.location.replace('http://artgital.com/2013-xmas/');
});

function FindPlayerIndexByUUID(p_UUID){
	for(c=0;c<playerMax;c++){
        if(playerArray[c]!=null){
        	if(playerArray[c].uuid == p_UUID){
        		return c;
        	}
        }
    }
    return -1;
}

function ListPlayers(){
	for(c=0;c<playerMax;c++){
        if(playerArray[c]!=null){
        	console.log('#' + c + ': ' + playerArray[c].uuid);
        }
    }
}