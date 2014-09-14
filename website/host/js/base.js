var stage;
var resource;

$(document).ready(initialize);

function initialize(){
    stage = new createjs.Stage('canvas-main');	
	
    initializeResource(function(){
        SetupRenderer();
        onReady();
    });
}

function initializeResource(completeHandler){
    resource = new createjs.LoadQueue(false);
    resource.installPlugin(createjs.Sound);
    resource.addEventListener('complete', completeHandler);
    loadResource();
}

function SetupRenderer(){
    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener('tick', onRender);
}

//務必在Ticker上的Handler加入event參數，Sprite的Framerate才會work
function onRender(event){
	onUpdate();
    stage.update(event);
}