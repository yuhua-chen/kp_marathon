
	//檢查是否支援觸控
	$.extend($.support, { touch: "ontouchend" in document });
	
	//註冊搖晃事件
	window.addEventListener('shake', onPush, false);

	//socket.io
	var socket;

	//Player name
	var m_UserName='';

	//是否與server連線
	var bConnected = false;

	//是否已經加入
	var bJoined = false;
	
	//Ready
	$(document).ready(function(){
		$('#touch-area').on('touchstart',onPush);
			//如果連不上socket.io
		  if(typeof io == 'undefined'){
			alert('伺服器尚未啟動');
			return;
		  }

		  socket = io.connect('http://10.10.10.20:7777');
		  socket.on('s2c-connected', function (data) {
				//connected server
		  });

		  //與server連線成功
		  socket.on('connect',function(){
				bConnected = true;
				console.log('Connected with server');
				$('#scene-welcome').css('background-color','#f00');
				$('#touch-area').css('background-color','white');
		  });

		  //當Server斷線
		  socket.on('disconnect',function(){
				bConnected=false;
				bJoined=false;
				console.log('Server has disconnected');
				$('#scene-welcome').css('background-color','black');
				$('#touch-area').css('background-color','black');

				gotoScene('join-scene');
		  });

		  //收到場景轉換訊息
		  socket.on('s2ac-gotoscene', function(data){
				console.log(data.message);
		  });

		  socket.on('s2ac-startgame', function(){
			onStartGame();
		  });

		  socket.on('s2ac-host-disconnected',function(){
			gotoScene('join-scene');
		  });

		  socket.on('s2c-player-reached',function(data){
			gotoScene('result-scene');
			var resultText = '恭喜你得到第' + data.rank +'名!\n';
			
			if(data.rank == 1){
				$('#result-image').attr('src','./assets/cityhall.jpg');
				resultText += "您即將入主臺北市政府，成為臺北市長！"
			}else{
				var region_array = ["中正區 永康里",
									"中正區 建國里",
									"中正區 愛國里",
									"萬華區 和平里",
									"萬華區 孝德里",
									"信義區 長春里",
									"信義區 大仁里",
									"北投區 正和里",
									"士林區 建民里",
									"士林區 承德里",
									"大安區 仁勇里",
									"大安區 天母里",
									"文山區 木柵里",
									"松山區 莊敬里",
									"松山區 敦化里",
									"大同區 介壽里",
									"大同區 建功里",
									"大同區 延平里",
									"南港區 自強里",
									"內湖區 西湖里"];

				var title = " 里長!";
				var _c = Math.floor(Math.random() * region_array.length);
				resultText += "恭喜您高票當選\n " + region_array[_c] + title;
				$('#result-image').attr('src','./assets/region.jpg');
			}
			$('#result-text').html("<pre>" + resultText + "</pre>");
		  });
	});
	
	function onLottery()
	{
		if(bConnected && bJoined)
		{
			SendToGetLottery();
		}
	}
	
	function onPush(){
		if(bConnected && bJoined)
		{
			var r = Math.floor(Math.random() * 255);
			var g = Math.floor(Math.random() * 255);
			var b = Math.floor(Math.random() * 255);
			var color = 'rgb('+r+','+g+','+b+')';
			$('#touch-area').css('background',color);

			SendPush();
		}
	}

	function Join(){
		if(!bConnected){
			alert('尚未連到伺服器');
			return;
		}

		//取得輸入的名字
		m_UserName = $('#ui-inputbox-name').val();
		if(m_UserName!=''){
			bJoined = true;
			SendJoin(m_UserName);                
			gotoScene('waiting-scene');
		}else{
			alert('求你先幫我取個名字');
		}
	}

	function gotoScene(p_Scene){
		switch(p_Scene){
			case 'join-scene':
				bJoined = false;
				//顯示歡迎場景
				$('#scene-welcome').css('background-image','assets/background.jpg');
				$('#scene-welcome').show();
				//出現輸入框框
				$('#group-naming-box').show();
				//隱藏輸入完成的框框
				$('#group-naming-complete').hide();
				$('#ui-text-username').html('');
				//隱藏結果場景
				$('#scene-result').hide();
				break;
			case 'waiting-scene':
				//隱藏輸入框框
				$('#scene-welcome').css('height','100%');
				$('#group-naming-box').hide();

				//出現輸入完成的框框
				$('#group-naming-complete').show();
				$('#ui-text-username').html(m_UserName);
				break;
			case 'gameplay-scene':
				//隱藏歡迎場景
				$('#scene-welcome').hide();
				//顯示遊戲場景
				$('#scene-game-play').show();
				//隱藏結果場景
				$('#scene-result').hide();
				//setInterval(onPush,100);
				break;
			case 'result-scene':
				//隱藏歡迎場景
				$('#scene-welcome').hide();
				//隱藏遊戲場景
				$('#scene-game-play').hide();
				//顯示結果場景
				$('#scene-result').show();
				break;
		}
	}

	function onStartGame(){
		if(bJoined){
			console.log('Starting the game...');
			gotoScene('gameplay-scene');
		}
	}

	function SendPush(){
		socket.emit('c2s-push');
	}
	
	function SendToGetLottery(){
		socket.emit('c2h-get-lottery');
	}

	function SendJoin(p_UserName){
		socket.emit('c2s-join', {username: p_UserName});
		console.log('Sending join message...');
	}