
    //單一玩家物件，作為複製參考
    var player;

    //玩家陣列
    var playerArray = new Array();

    //玩家上限數量
    var playerMax = 20;

    //目前玩家數
    var playerCount = 0;

    //目前的名次
    var currentRankCount = 1;

    const runwayWidth = 45;

    //推一次的速度
    const speed = 6;

    //遊戲是否結束了
    var gameEnded = false;

    var waitingMusic;

    var gamingMusic;

    var Scene_StartScreen;

    var Scene_GameScreen;

    //讀取素材
    function loadResource(){
        resource.loadManifest([
                //Images
                {id:'map',src:'assets/map.png'},
                {id:'character_sprite',src:'assets/char_sprite.png'},
                {id:'start-screen',src:'assets/startscreen.png'},
                {id:'click-to-start',src:'assets/clicktostart.png'},
                {id:'ready-button',src:'assets/readybutton.png'},

                //Sounds
                {id:'startup',src:'assets/gameboy.mp3'},
                {id:'ding',src:'assets/ding.mp3'},
                {id:'cheers',src:'assets/cheers.mp3'},
                {id:'start',src:'assets/start.mp3'},
                {id:'waiting-music',src:'assets/waiting.mp3'},
                {id:'gaming-music',src:'assets/chmg.mp3'},
            ]);
    }

    //當素材讀取完成
    function onReady(){
		$('#loading-screen').hide();
        createjs.Sound.play('startup');
        SetupGameScene();
    }

    //設定遊戲場景
    function SetupGameScene(){
        SetupScenes();
        waitingMusic = createjs.Sound.play('waiting-music');
    }

    function SetupScenes(){
        SetupStartScreen();
        SetupGameScreen();

        gotoScene('StartScreen');
    }

    function gotoScene(p_SceneName){
        switch(p_SceneName){
            case 'StartScreen':
                Scene_StartScreen.visible = true;
                Scene_GameScreen.visible = false;
                break;
            case 'GameScene':
                Scene_StartScreen.visible = false;
                Scene_GameScreen.visible = true;
                break;
        }
    }

    function SetupStartScreen(){
        Scene_StartScreen = new createjs.Container();

        GUI_StartScreen = new createjs.Bitmap(resource.getResult('start-screen'));
        Scene_StartScreen.addChild(GUI_StartScreen);

        GUI_ClickToStart = new createjs.Bitmap(resource.getResult('click-to-start'));
        MovePivotToCenter(GUI_ClickToStart);
        MoveToCanvasCenter(GUI_ClickToStart);
        GUI_ClickToStart.y += 250;
        Scene_StartScreen.addChild(GUI_ClickToStart);
        var Anim_BlinkText = setInterval(function(){
            GUI_ClickToStart.visible = !GUI_ClickToStart.visible;
        },1000);
        
        stage.addChild(Scene_StartScreen);

        GUI_StartScreen.on('click', StartTheGame);
    }

    function SetupGameScreen(){
        Scene_GameScreen = new createjs.Container();
        stage.addChild(Scene_GameScreen);

        var map = new createjs.Bitmap(resource.getResult('map'));
        Scene_GameScreen.addChild(map);

        var GUI_ReadyButton = new createjs.Bitmap(resource.getResult('ready-button'));
        GUI_ReadyButton.name = 'GUI_ReadyButton';
        GUI_ReadyButton.on('click',StartCountDown);
        Scene_GameScreen.addChild(GUI_ReadyButton);

        SetupPlayerAsset();
    }

    function StartTheGame(){
        gotoScene('GameScene');
    }

    function StartCountDown(){
        //按下Ready後，隱藏Ready鍵
        var readyButton = Scene_GameScreen.getChildByName('GUI_ReadyButton');
        readyButton.visible = false;

        //停止等待音樂
        waitingMusic.stop();


        var padding = 250;
        var countFrom = 3;
        var countText = new createjs.Text(countFrom, "240px Arial", "#fff");
        MovePivotToCenter(countText);
        MoveToCanvasCenter(countText);
        Scene_GameScreen.addChild(countText);

        countText.x = stage.canvas.width + padding;
        createjs.Tween.get(countText)
                    .to({x: stage.canvas.width / 2}, 200,createjs.Ease.cubicOut)
                    .wait(800)
                    .to({x: 0 - padding}, 200,createjs.Ease.cubicIn)
                    .wait(500)
                    .call(function(){
                        countFrom--;
                        countText.text = countFrom;

                        countText.x = stage.canvas.width + padding;
                        createjs.Tween.get(countText)
                                    .to({x: stage.canvas.width / 2}, 200,createjs.Ease.cubicOut)
                                    .wait(800)
                                    .to({x: 0 - padding}, 200,createjs.Ease.cubicIn)
                                    .wait(500)
                                    .call(function(){
                                        countFrom--;
                                        countText.text = countFrom;

                                        countText.x = stage.canvas.width + padding;
                                        createjs.Tween.get(countText)
                                                    .to({x: stage.canvas.width / 2}, 200,createjs.Ease.cubicOut)
                                                    .wait(800)
                                                    .to({x: 0 - padding}, 200,createjs.Ease.cubicIn)
                                                    .wait(500)
                                                    .call(function(){
                                                        countFrom = 3;
                                                        countText.text = 'GO!';
                                                        MovePivotToCenter(countText);
                                                        
                                                        countText.x = stage.canvas.width + padding;
                                                        createjs.Tween.get(countText)
                                                                    .to({x: stage.canvas.width / 2}, 200,createjs.Ease.cubicOut)
                                                                    .wait(800)
                                                                    .call(function(){
                                                                        StartTheRace();
                                                                    })
                                                                    .to({x: 0 - padding}, 200,createjs.Ease.cubicIn);
                                                    });
                                    });
                    });
    }

    function StartTheRace(){
        console.log('Race Start!');
        SendStartRace();
        
        //把每個動畫都變成跑步動畫
        foreach(playerArray , function(index){
            var currentPlayer = playerArray[index];
            var sprite = currentPlayer.getChildByName('sprite');
            currentPlayer.state = 'running';
            sprite.gotoAndPlay('run-forward');
        });

        gamingMusic = createjs.Sound.play('gaming-music');
    }

    //讀取並設定玩家動畫及設定
    function SetupPlayerAsset(){
        var data = {
            framerate: 10,
             images: [ resource.getResult('character_sprite') ],
             frames: { width: 32, height: 64 },
             animations: {
                    "stay": { frames:[1] },
                    "run-forward": { frames: [ 1, 2, 3, 4, 5, 6, 7, 8 ]},
             }
        };

        //Player元素都在這邊產生
        player = new createjs.Container();

        var sprite = new createjs.Sprite(new createjs.SpriteSheet(data));
        sprite.name = 'sprite';     //要取名字才找得到
        player.addChild(sprite);
        player.regX = 16;
        player.regY = 50;

        var nameLabel = new createjs.Text("", "28px 標楷體", "#fff");
        nameLabel.name = 'nameLabel';
        nameLabel.x = 32;
        nameLabel.y = 64;
        nameLabel.textAlign = 'left';
        nameLabel.rotation = 90;
        player.addChild(nameLabel);
    }

    //增加一位玩家
    function addPlayer(p_UUID, p_PlayerName){
        var playerIndex = getEmptyPlayerIndex();
        if(playerIndex == -1) return;

        var startPosition = new createjs.Point(23 + runwayWidth , 140);
        var newPosition = new createjs.Point(startPosition.x + (playerIndex*runwayWidth), 768 - startPosition.y);

        playerArray[playerIndex] = player.clone(true);
        var currentPlayer = playerArray[playerIndex];

        currentPlayer.state = 'stay';

        Scene_GameScreen.addChild(currentPlayer);
        currentPlayer.x = newPosition.x;
        currentPlayer.y = newPosition.y;

        var nameLabel = currentPlayer.getChildByName('nameLabel');
        currentPlayer.playerName = p_PlayerName;
        currentPlayer.uuid = p_UUID;
        nameLabel.text = p_PlayerName;


        playerCount++;
    }

    //移除一位玩家
    function removePlayer(index){
        if(playerArray[index]!=null){
            Scene_GameScreen.removeChild(playerArray[index]);
            delete playerArray[index];
            playerCount--;
        }
    }

    //尋找最小的可用玩家索引
    function getEmptyPlayerIndex(){
        for(c=0;c<playerMax;c++){
            if(playerArray[c]==null){
                return c;
            }
        }
        return -1;
    }

    //檢查玩家是否到了終點
    function CheckIfPlayerReached(){
        if(playerCount>0 && currentRankCount == playerCount + 1){
            //所有玩家都到了
            if(!gameEnded){
                gameEnded=true;
            }
            return;
        }

        for(c=0;c<playerMax;c++){
            if(playerArray[c]!=null){
                var currentPlayer = playerArray[c];
                if(currentPlayer.state == 'running'){
                    //檢查是否到了終點線
                    if(currentPlayer.y <= 125){
                        createjs.Sound.play('cheers');
                        currentPlayer.state = 'reached';    //玩家已經到了
                        var sprite = currentPlayer.getChildByName('sprite');
                        sprite.gotoAndPlay('stay');
                        var nameLabel = currentPlayer.getChildByName('nameLabel');
                        nameLabel.color = '#ff0';
                        nameLabel.text += ' #' + currentRankCount;
                        currentPlayer.rank = currentRankCount;  //玩家得到名次
                        NotifyPlayerHasReached(currentPlayer.uuid, currentPlayer.rank);    //通知手機玩家完賽
                        currentRankCount++;
                    }
                }
            }
        }
    }

    //更新函式
    function onUpdate(){
        CheckIfPlayerReached();
    }

    //每按一次就推一下玩家
    function pushPlayer(index){
        console.log('push', playerArray[index]);
        var currentPlayer = playerArray[index];
        //TODO: 速度變化在這邊
        var acc = parseName(currentPlayer.playerName, currentPlayer.y);
        // console.log(currentPlayer.playerName, acc);
        //模擬跑步
        if(currentPlayer.state == 'running'){
            playerArray[c].y -= Math.random() * speed * acc;
        }

        var result = currentPlayer.playerName.match(/[王炳忠]+/g);
        if (result) {
            $('.bubble-wang').css({
                "left": (currentPlayer.x + 35) + "px",
                "top": (currentPlayer.y - 40) + "px",
                "display" : "block"
            });
        }

        result = currentPlayer.playerName.match(/[馬英九]+/g);
        if (result) {
            $('.bubble-ma').css({
                "left": (currentPlayer.x + 35) + "px",
                "top": (currentPlayer.y - 40) + "px",
                "display" : "block"
            });
        }
    }

    function parseName(name, yPos)
    {
        var result = name.match(/[柯文哲]+/g);
        if (result) {
            return 1 + 1 / 10 * getParsedCount(result); 
        }

        result = name.match(/[連勝丼]+/g);
        if (result) {
            return 1 - 1 / 10 * getParsedCount(result); 
        }

        result = name.match(/[王炳忠]+/g);
        if (result) {
            var operator = Math.random() > 0.5 ? -1 : 1;
            return Math.random() > 0.5 ? -1 : 1;
        }

        result = name.match(/[馬英九]+/g);
        if (result) {
            var weakness = (yPos - 125)/545;
            return weakness * (1-1/5 * getParsedCount(result));
        }

        return 1;
    }

    function getParsedCount(result) {
        var count = 0;
        for(var i=0; i<result.length; i++) {
            count += result[i].length;
        }
        return count;
    }