function MovePivotToCenter(graphic)
{
    graphic.regX = graphic.getBounds().width / 2;
    graphic.regY = graphic.getBounds().height / 2;
}

function MoveToCanvasCenter(graphic){
	graphic.x = stage.canvas.width / 2;
	graphic.y = stage.canvas.height / 2;
}

function foreach(array, func){
	for(c=0;c<array.length;c++){
		if(array[c]!=null){
			func(c);
		}
	}
}