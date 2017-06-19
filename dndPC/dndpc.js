


;(function(global, factory){
	if (typeof define === 'function' && define.amd) {
	  define(factory);
	} else if (typeof exports === 'object') {
	  module.exports = factory();
	} else {
	  global.dnd = factory();
	}
})(typeof window !== 'undefined' ? window : this, function(opts){
	var dnd = {
		options: {
			type: 'drag',  //拖拽类型H5：drag, 鼠标事件: mouse
			container: null,  //接受拖拽元素
			items: [{
				dom: null,        //被拖拽元素
				iconType: "type1",     //显示的小图标        
			}],
			icons: {            //图标种类
				type1: {
					src: 'src',
					event:{
						'click': null    //该元素小图标需要绑定的事件
					}
				}
			}
		},
		setConfig: function(opts){
			var key, value;
			for(key in opts){
				value = opts[key];
				if (value !== undefined && opts.hasOwnProperty(key)){
					this.options[key] = value;
				} 
			}
			return this;
		},
		setCss: function(){
			this.options.container.style.position = 'relative';
			for(var i=0; i<this.options.items.length; i++){
				this.options.items[i].dom.style.position = 'absorlute';
				this.options.items[i].dom.draggable = true;
			}
			return this;
		},
		setIconImg: function(){
			var key, val, img,
				icons = this.options.icons;
			this.iconImg = {};
			for(key in icons){
				val = icons[key];
				img = new Image();
				img.src = val.src;
				this.iconImg[key] = img;
			}
			return this;
		},
		bindDragAndDrop: function(){
			var items = this.options.items;
			var _this = this;
			for(var i=0; i<items.length; i++){
				(function(i){
					items[i].dom.addEventListener('dragstart', function(e){
						e.dataTransfer.setDragImage(_this.iconImg[items[i].iconType], 20, 20);
						e.dataTransfer.effectAllowed = "move";
						e.dataTransfer.setData('isAdd', true);
						e.dataTransfer.setData('iconType', items[i].iconType);
					})
				})(i);
			}

			this.options.container.addEventListener('dragover', function(e){
				e.dataTransfer.dropEffect = "move";
				e.preventDefault();
			});

			this.options.container.addEventListener('drop', function(e){
				var x = e.offsetX-20;
				var y = e.offsetY-20;
				var isAdd = e.dataTransfer.getData('isAdd');
				if(isAdd == "true"){
					var type = e.dataTransfer.getData('iconType');
					var icon = document.createElement('img');
					icon.src = _this.options.icons[type].src;
					_this.options.container.appendChild(icon);
					icon.style.position = 'absolute';
					icon.style.left = x+'px';
					icon.style.top = y+'px';
					var event = _this.options.icons[type].event;
					for(var key in event){
						icon.addEventListener(key, event[key]);
					}
					icon.id = new Date();
					icon.addEventListener('dragstart', function(e){
						e.dataTransfer.setDragImage(_this.iconImg[type], 20, 20);
						e.dataTransfer.effectAllowed = "move";
						e.dataTransfer.setData('isAdd', false);
						e.dataTransfer.setData('id', e.target.id);
					});
				}else{
					var id = e.dataTransfer.getData('id');
					var moveIcon = document.getElementById(id);
					if(e.target == _this.options.container){
						moveIcon.style.left = x+'px';
						moveIcon.style.top = y+'px';
					}else{
						moveIcon.style.left = x + e.target.offsetLeft +'px';
						moveIcon.style.top = y + e.target.offsetTop +'px';
					}
					
				}
				
			});
			return this;
		},
		bindMouseEvent: function(){
			var items = this.options.items;
			var _this = this;
			for(var i=0; i<items.length; i++){
				(function(i){
					items[i].dom.addEventListener('mousedown', function(e){
						var moveImg = document.createElement('img');
						moveImg.src = _this.iconImg[items[i].iconType].src;
						moveImg.id = new Date();
						document.body.appendChild(moveImg);
						moveImg.draggable = false;
						moveImg.style.position = "fixed";
						var skewingX = moveImg.width/2;  //鼠标偏移量
						var skewingY = moveImg.height/2;
						moveImg.style.top = (e.clientY - skewingY) + 'px';
						moveImg.style.left = (e.clientX - skewingX) + 'px';
						document.body.onmousemove = function(e){
							moveImg.style.top = (e.clientY - skewingY) + 'px';
							moveImg.style.left = (e.clientX - skewingX) + 'px';
						}
						document.body.onmouseup = function(e){
							document.body.onmousemove = null;
							var container = _this.options.container;
							var cx = container.getBoundingClientRect().left;
							var cy = container.getBoundingClientRect().top;
							document.body.removeChild(document.getElementById(moveImg.id));
							
							if(!(e.clientY - cy -skewingY > container.offsetHeight || e.clientY - cy -skewingY < 0 || e.clientX - cx -skewingX > container.offsetWidth || e.clientX - cx -skewingX < 0)){
								var icon = new Image();
								icon.src = moveImg.src;
								icon.draggable = false;
								container.appendChild(icon);
								icon.style.position = 'absolute';
								icon.style.top = (e.clientY - cy -skewingY) + 'px';
								icon.style.left = (e.clientX - cx -skewingX) + 'px';
								
								icon.onmousedown = function(e){
									var that = this;
									var startTop = that.style.top;
									var startLeft = that.style.left;
									document.body.onmouseup = null;

									document.body.onmousemove = function(e){
										var top = e.clientY -cy - skewingY;
										var left = e.clientX -cx - skewingX;
										if(top + that.height -skewingY > _this.options.container.offsetHeight){
											top = _this.options.container.offsetHeight - that.height +skewingY;
										}
										if(top < - skewingY){
											top = - skewingY;
										}
										if(left + that.width -skewingX > _this.options.container.offsetWidth){
											left = _this.options.container.offsetWidth - that.width +skewingX;
										}
										if(left < - skewingX){
											left = - skewingX;
										}
										that.style.top = top + 'px';
										that.style.left = left + 'px';
									}

									document.body.onmouseup = function(e){
										document.body.onmousemove = null;
									}
								}
							}
						}
					});
				})(i);
			}
			return this;
		},
		init: function(opts){
			this.setConfig(opts).setCss().setIconImg();
			if(opts.type == 'mouse'){
				this.bindMouseEvent();
			}else{
				this.bindDragAndDrop();
			}
		}
	}

	return dnd;
});