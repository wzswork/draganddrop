


;(function(global, factory){
	if (typeof define === 'function' && define.amd) {
	  define(factory);
	} else if (typeof exports === 'object') {
	  module.exports = factory();
	} else {
	  global.drag = factory();
	}
})(typeof window !== 'undefined' ? window : this, function(opts){
	var moveImg, //未创建的元素拖动图片
		moveIcon, //已存在的元素图标
		startTop,startLeft,  //容器中元素的初始坐标
		skewingX,skewingY,  //鼠标偏移量
		zindex = 1001;   

	var drag = {
		iconData: [],    // 存储容器中所有icon的参数
		options: {
			type: 'drag',  //拖拽类型H5：drag, 鼠标事件: mouse
			container: document.querySelector('.drag-container'),  //接受拖拽元素
			items: document.querySelectorAll('.dragitem'),
			icons: {            //图标种类s
				img: '../img/static.jpg',
				video: '../img/DH.gif',
				audio: '../img/YP.gif',
				word: '../img/SJ.gif'
			}
		},
		mouseEvent: _isMobilePlatform()?['touchstart','touchmove','touchend']:['mousedown','mousemove','mouseup'],
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
		setIconImg: function(){
			var key, img,
				icons = this.options.icons;
			this.iconImg = {};
			for(key in icons){
				img = new Image();
				img.src = icons[key];
				this.iconImg[key] = img;
			}
			return this;
		},
		bindIconEvents: function () {
			this.options.container.addEventListener('click',function(e){
				var iconType = e.target.dataset.iconType;
				switch(iconType){
					case 'img': _imgFuc();break;
					case 'video': _videoFuc();break;
					case 'audio': _audioFuc();break;
					case 'word' : _wordFuc();break;
				} 
			})
		},
		bindDragAndDrop: function(){
			var _this = this;
			var items = this.options.items;

			// 绑定被拖动元素事件
			for(var i=0; i<items.length; i++){
				(function(i){
					items[i].addEventListener('dragstart', function(e){
						var obj = {
							iconType: items[i].dataset.iconType,
							datasrc: items[i].dataset.src
						}
						e.dataTransfer.setData("text",JSON.stringify(obj));

						// if(e.dataTransfer.setDragImage){
							e.dataTransfer.setDragImage(drag.iconImg[e.target.dataset.iconType], 20, 29, e.pageY-29, e.pageX-20);
						// }
						// e.dataTransfer.setDragImage(_this.iconImg[items[i].dataset.iconType], 20, 29);
						e.dataTransfer.effectAllowed = "move";
					});
				})(i);
			}

			// 绑定容器拖动相关事件
			this.options.container.addEventListener('dragover', function(e){
				e.dataTransfer.dropEffect = "move";
				e.preventDefault();
			});

			this.options.container.addEventListener('drop', function(e){
				e.preventDefault();
				var edata = JSON.parse(e.dataTransfer.getData('text'));
				// 判断被放置的是否为新图标，否则直接返回
				if(_this.activeElement) {
					var container = _this.options.container;
					var id = edata.id;
					var skewingX = edata.skewingX;
					var skewingY = edata.skewingY;
					var moveIcon = document.getElementById(id);
					moveIcon.style.display = 'block';
					// 图标左上角坐标
					var iconX = e.pageX - skewingX - container.offsetLeft;
					var iconY = e.pageY - skewingY - container.offsetTop;
					// 容器尺寸
					var containerW = container.offsetWidth;
					var containerH = container.offsetHeight;
					// 图标尺寸
					var iconW = moveIcon.offsetWidth;
					var iconH = moveIcon.offsetHeight;
					// 图标左上角坐标范围判断，容器范围向左上角偏移图标本身尺寸的一半
					if(iconX <= containerW - iconW/2 && iconX >= - iconW/2 && iconY <= containerH - iconH/2 && iconY >= - iconH){
						moveIcon.style.left = iconX +'px';
						moveIcon.style.top = iconY +'px';
					}
					_this.activeElement = null;
					return;
				};
				// 创建新图标
				var icon = _h5CreateIcon(e);
				// 给新图标绑定拖动事件
				icon.addEventListener('dragstart', _h5dragstart);

				icon.addEventListener('drag', function(e){
					e.target.style.opacity = 0;
				});

				icon.addEventListener('dragend', _h5dragend);
				
			});
			return this;
		},
		bindMouseEvent: function(){
			var items = this.options.items;
			var _this = this;
			for(var i=0; i<items.length; i++){
				(function(i){
					// 给新建元素绑定鼠标down事件
					items[i].addEventListener(_this.mouseEvent[0], function(e){
						this.draggable = false;
						moveImg = document.createElement('img');
						
						// moveImg.src = _this.iconImg[items[i].dataset.iconType].src;
						moveImg.src = _this.iconImg[items[i].getAttribute('data-icon-type')].src;
						moveImg.id = new Date().getTime();
						// moveImg.dataset.iconType = items[i].dataset.iconType;
						moveImg.setAttribute('data-icon-type',items[i].getAttribute('data-icon-type'));
						document.body.appendChild(moveImg);
						
						skewingX = moveImg.width/2;  //鼠标偏移量
						skewingY = moveImg.height/2;

						e.clientY = e.clientY||e.touches[0].clientY;
						e.clientX = e.clientX||e.touches[0].clientX;

						moveImg.draggable = false;
						moveImg.style.position = "fixed";
						moveImg.style.top = (e.clientY - skewingY) + 'px';
						moveImg.style.left = (e.clientX - skewingX) + 'px';

						//绑定鼠标移动事件
						document.body.addEventListener(_this.mouseEvent[1], _moveFuc, false);
						// 绑定鼠标up事件
						document.body.addEventListener(_this.mouseEvent[2], _upFuc, false);
						
					});

				})(i);
			}
			return this;
		},
		//返回已放在容器中的icon数据
		getIconData: function(){
			var imgs = this.options.container.getElementsByTagName('img');
			var obj = {};
			for(var i = 0; i < imgs.length; i++){
				obj.src = imgs[i].src;
				// obj.iconType = imgs[i].dataset.iconType;
				obj.iconType = imgs[i].getAttribute('data-icon-type');
				obj.id = imgs[i].id;
				obj.top = imgs[i].style.top.slice(0,-2);
				obj.left = imgs[i].style.left.slice(0,-2);
				// obj.datasrc = imgs[i].dataset.src;
				obj.datasrc = imgs[i].getAttribute('data-src');
				this.iconData.push(obj);
			}
			return this.iconData;
		},
		init: function(opts){
			this.setConfig(opts).setIconImg();
			if(_isMobilePlatform() || this.options.type == 'mouse' || _isIE()){
				this.bindMouseEvent();
			}else if(this.options.type == 'drag'){
				this.bindDragAndDrop();
			}

		}
	}

	//h5新图标创建
	function _h5CreateIcon(e){
		var icon = document.createElement('img');
		var edata = JSON.parse(e.dataTransfer.getData('text'));
		icon.dataset.iconType = edata.iconType;
		icon.src = drag.options.icons[icon.dataset.iconType];
		icon.id = new Date().getTime();
		drag.options.container.appendChild(icon);
		icon.style.position = 'absolute';
		icon.style.left = (e.pageX - 20 - drag.options.container.offsetLeft)+'px';
		icon.style.top = (e.pageY - 29 - drag.options.container.offsetTop)+'px';
		icon.style.zIndex = zindex;
		zindex++;
		icon.dataset.src = edata.datasrc;
		return icon;
	}

	// H5图标拖动开始
	function _h5dragstart(e){
		drag.activeElement = this;
		this.style.zIndex = zindex;
		zindex++;
		e.dataTransfer.effectAllowed = "move";
		e.target.dataset.id = e.target.id;
		e.target.dataset.skewingX = e.offsetX;
		e.target.dataset.skewingY = e.offsetY;
		var obj = {
			id: e.target.id,
			skewingX: e.offsetX,
			skewingY: e.offsetY
		}
		e.dataTransfer.setData('text', JSON.stringify(obj));

	}

	//H5图标拖动结束
	function _h5dragend(e){
		e.target.style.opacity = 1;
		e.preventDefault();
	}


	// 新元素鼠标移动事件
	function _moveFuc(e){
		e.clientY = e.clientY||e.touches[0].clientY;
		e.clientX = e.clientX||e.touches[0].clientX;
		moveImg.style.top = (e.clientY - skewingY) + 'px';
		moveImg.style.left = (e.clientX - skewingX) + 'px';
	}

	// 新元素鼠标up事件
	function _upFuc(e){
		document.body.removeEventListener(drag.mouseEvent[1], _moveFuc, false);
		var container = drag.options.container;
		var cx = container.getBoundingClientRect().left;
		var cy = container.getBoundingClientRect().top;
		
		if(moveImg.offsetTop - cy < container.offsetHeight && moveImg.offsetTop - cy > 0 && moveImg.offsetLeft - cx < container.offsetWidth && moveImg.offsetLeft - cx > 0){
			// 创建将要显示在容器中的图标
			var icon = _createIcon(e,cx,cy);
			drag.options.container.appendChild(icon);
			
			// 给图标绑定按下事件
			icon.addEventListener(drag.mouseEvent[0], _iconDown, false);
		}

		if(document.getElementById(moveImg.id)){
			document.body.removeChild(document.getElementById(moveImg.id));
		}
	}

	//新建显示在容器中的图标
	function _createIcon(e,cx,cy){
		var icon = new Image();
		icon.src = moveImg.src;
		// icon.dataset.iconType = moveImg.iconType;
		icon.setAttribute('data-icon-type', moveImg.getAttribute('data-icon-type'));
		icon.id = new Date().getTime();
		icon.setAttribute('draggable', false);
		icon.setAttribute('ondragstart','return false;');
		icon.style.position = 'absolute';
		icon.style.top = (moveImg.offsetTop - cy) + 'px';
		icon.style.left = (moveImg.offsetLeft - cx) + 'px';
		return icon;
	}
	// 给容器中元素绑定mousedown事件
	function _iconDown(e){
		moveIcon = this;
		startTop = moveIcon.style.top;
		startLeft = moveIcon.style.left;
		document.body.removeEventListener(drag.mouseEvent[2], _upFuc);
		document.body.addEventListener(drag.mouseEvent[1], _iconMove, false);
		document.body.addEventListener(drag.mouseEvent[2], _iconUp, false);
	}

	// 容器中元素的移动
	function _iconMove(e){
		e.clientY = e.clientY||e.touches[0].clientY;
		e.clientX = e.clientX||e.touches[0].clientX;
		var cx = drag.options.container.getBoundingClientRect().left;
		var cy = drag.options.container.getBoundingClientRect().top;
		var top = e.clientY -cy - skewingY;
		var left = e.clientX -cx - skewingX;
		// if(top + moveIcon.height -skewingY > drag.options.container.offsetHeight){
		// 	top = drag.options.container.offsetHeight - moveIcon.height +skewingY;
		// }
		// if(top < - skewingY){
		// 	top = - skewingY;
		// }
		// if(left + moveIcon.width -skewingX > drag.options.container.offsetWidth){
		// 	left = drag.options.container.offsetWidth - moveIcon.width +skewingX;
		// }
		// if(left < - skewingX){
		// 	left = - skewingX;
		// }
		moveIcon.style.top = top + 'px';
		moveIcon.style.left = left + 'px';
	}

	// 容器中元素鼠标up
	function _iconUp(e){
		document.body.removeEventListener(drag.mouseEvent[1], _iconMove, false);
		var cx = drag.options.container.getBoundingClientRect().left;
		var cy = drag.options.container.getBoundingClientRect().top;
		var top = e.clientY -cy - skewingY;
		var left = e.clientX -cx - skewingX;
		if(top + moveIcon.height -skewingY > drag.options.container.offsetHeight || top < - skewingY || left + moveIcon.width -skewingX > drag.options.container.offsetWidth || left < - skewingX){
			moveIcon.style.top = startTop;
			moveIcon.style.left = startLeft;
		}
		
	}
	
	//判断是否移动端
	function _isMobilePlatform() {
	    var isTrue = false;
	    //判断是否移动端设备的JS代码
	    if (navigator.userAgent.match(/(iPhone|iPad|Android|ios)/i)) {
	        isTrue = true;
	    }
	    else {
	        isTrue = false;
	    }
	    return isTrue;
	}

	// 判断IE
	function _isIE() { //ie?  
	    if (!!window.ActiveXObject || "ActiveXObject" in window)  
	        return true;  
	    else  
	        return false;  
	}

	return drag;
});