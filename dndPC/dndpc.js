


;(function(global, factory){
	if (typeof define === 'function' && define.amd) {
	  define(factory);
	} else if (typeof exports === 'object') {
	  module.exports = factory();
	} else {
	  global.dnd = factory();
	}
})(typeof window !== 'undefined' ? window : this, function(opts){
	function isDrag(){

	}
	var dnd = {
		options: {
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
				},
				type2: 'src'
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
				var item = e.dataTransfer.item;
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
						e.dataTransfer.effectAllowed = "move";
						e.dataTransfer.setData('isAdd', false);
						e.dataTransfer.setData('id', e.target.id);
					});
				}else{
					var id = e.dataTransfer.getData('id');
					var moveIcon = document.getElementById(id);
					moveIcon.style.left = x+'px';
					moveIcon.style.top = y+'px';
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
						moveImg.style.top = (e.clientY - 20) + 'px';
						moveImg.style.left = (e.clientX - 20) + 'px';
						document.body.onmousemove = function(e){
							moveImg.style.top = (e.clientY - 20) + 'px';
							moveImg.style.left = (e.clientX - 20) + 'px';
						}
						document.body.addEventListener('mouseup', function(e){
							document.body.onmousemove = null;
							var container = _this.options.container;
							var cx = container.getBoundingClientRect().left;
							var cy = container.getBoundingClientRect().top;
							document.body.removeChild(document.getElementById(moveImg.id));
							
							if(!(e.clientY - cy -20 > container.offsetHeight || e.clientY - cy -20 < 0 || e.clientX - cx -20 > container.offsetWidth || e.clientX - cx -20 < 0)){
								var icon = new Image();
								icon.src = moveImg.src;
								icon.draggable = false;
								container.appendChild(icon);
								icon.style.position = 'absolute';
								icon.style.top = (e.clientY - cy -20) + 'px';
								icon.style.left = (e.clientX - cx -20) + 'px';
								
								icon.onmousedown = function(e){
									var _this = this;
									var startTop = _this.style.top;
									var startLeft = _this.style.left;

									document.body.onmousemove = function(e){
										_this.style.top = (e.clientY -cy - 20) + 'px';
										_this.style.left = (e.clientX -cx - 20) + 'px';
									}

									document.body.onmouseup = function(e){
										document.body.onmousemove = null;
										var top = _this.style.top.split('px')[0];
										var left = _this.style.left.split('px')[0];
										if(top > container.offsetHeight || top < 0 || left > container.offsetWidth || left < 0){
											_this.style.top = startTop;
											_this.style.left = startLeft;
										}
									}
								}
							}
						});
					});
				})(i);
			}
			return this;
		},
		init: function(opts){
			this.setConfig(opts).setCss().setIconImg().bindMouseEvent();
		}
	}

	return dnd;
});