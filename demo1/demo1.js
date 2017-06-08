var dra = document.getElementById("dra");
var img = document.createElement('img');
var container = document.querySelector('.container');
img.src = "../img/DH.gif";
// container.appendChild(img);
dra.ondragstart = function(e){
	e.dataTransfer.setDragImage(img,20,20);
	e.dataTransfer.effectAllowed = "move";
	e.dataTransfer.setData("src", "../img/DH.gif");
}

container.ondragover = function(e){
	e.dataTransfer.dropEffect = "move";
	e.preventDefault();
}

container.ondrop = function(e){
	var x = e.offsetX-20;
	var y = e.offsetY-20;
	var item = e.dataTransfer.item;
	
	var icon = document.createElement('img');
	icon.src = e.dataTransfer.getData('src');
	container.appendChild(icon);
	icon.style.position = 'absolute';
	icon.style.left = x+'px';
	icon.style.top = y+'px';
}