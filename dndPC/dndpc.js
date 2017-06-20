


;(function(global, factory){
	if (typeof define === 'function' && define.amd) {
	  define(factory);
	} else if (typeof exports === 'object') {
	  module.exports = factory();
	} else {
	  global.dnd = factory();
	}
})(typeof window !== 'undefined' ? window : this, function(opts){
	var moveImg, //未创建的元素拖动图片
		moveIcon, //已存在的元素图标
		startTop,startLeft,  //容器中元素的初始坐标
		skewingX,skewingY;  //鼠标偏移量
	var dnd = {
		iconData: [],    // 存储容器中所有icon的参数
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
					icon.dataset.iconType = type;
					icon.id = new Date().getTime();
					_this.options.container.appendChild(icon);
					icon.style.position = 'absolute';
					icon.style.left = x+'px';
					icon.style.top = y+'px';
					var event = _this.options.icons[type].event;
					for(var key in event){
						icon.addEventListener(key, event[key]);
					}
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
					// 给新建元素绑定鼠标down事件
					items[i].dom.addEventListener(_this.mouseEvent[0], function(e){
						
						moveImg = document.createElement('img');
						moveImg.iconType = items[i].iconType;
						moveImg.src = _this.iconImg[items[i].iconType].src;
						moveImg.id = new Date().getTime();
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
		getIconData: function(){
			var imgs = this.options.container.getElementsByTagName('img');
			var obj = {};
			for(var i = 0; i < imgs.length; i++){
				obj.src = imgs[i].src;
				obj.iconType = imgs[i].dataset.iconType;
				obj.id = imgs[i].id;
				obj.top = imgs[i].style.top.slice(0,-2);
				obj.left = imgs[i].style.left.slice(0,-2);
				this.iconData.push(obj);
			}
			return this.iconData;
		},
		init: function(opts){
			this.setConfig(opts).setCss().setIconImg();
			if(_isMobilePlatform() || opts.type == 'mouse'){
				this.bindMouseEvent();
			}else if(opts.type == 'drag'){
				this.bindDragAndDrop();
			}

		}
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
		// e.clientY = e.clientY||e.touches[0].clientY;
		// e.clientX = e.clientX||e.touches[0].clientX;
		document.body.removeEventListener(dnd.mouseEvent[1], _moveFuc, false);
		var container = dnd.options.container;
		var cx = container.getBoundingClientRect().left;
		var cy = container.getBoundingClientRect().top;
		
		
		// if(!(e.clientY - cy -skewingY > container.offsetHeight || e.clientY - cy -skewingY < 0 || e.clientX - cx -skewingX > container.offsetWidth || e.clientX - cx -skewingX < 0)){
		if(moveImg.offsetTop - cy < container.offsetHeight && moveImg.offsetTop - cy > 0 && moveImg.offsetLeft - cx < container.offsetWidth && moveImg.offsetLeft - cx > 0){
			// 创建将要显示在容器中的图标
			var icon = _createIcon(e,cx,cy);
			dnd.options.container.appendChild(icon);

			// 绑定图标事件
			var events = dnd.options.icons[moveImg.iconType].event;
			_bindIconEvents(icon, events);
			
			// 给图标绑定按下事件
			icon.addEventListener(dnd.mouseEvent[0], _iconDown, false);
		}

		if(document.getElementById(moveImg.id)){
			document.body.removeChild(document.getElementById(moveImg.id));
		}
	}

	//新建显示在容器中的图标
	function _createIcon(e,cx,cy){
		// e.clientY = e.clientY||e.touches[0].clientY;
		// e.clientX = e.clientX||e.touches[0].clientX;
		var icon = new Image();
		icon.src = moveImg.src;
		icon.dataset.iconType = moveImg.iconType;
		icon.id = new Date().getTime();
		icon.draggable = false;
		icon.style.position = 'absolute';
		// icon.style.top = (e.clientY - cy -skewingY) + 'px';
		// icon.style.left = (e.clientX - cx -skewingX) + 'px';
		icon.style.top = (moveImg.offsetTop - cy) + 'px';
		icon.style.left = (moveImg.offsetLeft - cx) + 'px';

		var obj = {
			id : icon.id,
			src : icon.src,
			top : icon.style.top,
			left : icon.style.left,
			iconType : icon.iconType
		}
		dnd.iconData.push(obj);
		return icon;
	}

	// 给新建图标绑定事件
	function _bindIconEvents(icon, events){
		var iconClick;
		for(var key in events){
			//为了不与拖动冲突，对click事件特殊处理
			if(key == 'click'){
				iconClick = events[key];
			}else{
				icon.addEventListener(key, events[key]);
			}
		}
	}

	// 给容器中元素绑定mousedown事件
	function _iconDown(e){
		moveIcon = this;
		startTop = moveIcon.style.top;
		startLeft = moveIcon.style.left;
		document.body.removeEventListener(dnd.mouseEvent[2], _upFuc);
		document.body.addEventListener(dnd.mouseEvent[1], _iconMove, false);
		document.body.addEventListener(dnd.mouseEvent[2], _iconUp, false);
		// document.body.onmouseup = function(e){
		// 	document.body.onmousemove = null;
		// }
	}

	// 容器中元素的移动
	function _iconMove(e){
		e.clientY = e.clientY||e.touches[0].clientY;
		e.clientX = e.clientX||e.touches[0].clientX;
		var cx = dnd.options.container.getBoundingClientRect().left;
		var cy = dnd.options.container.getBoundingClientRect().top;
		var top = e.clientY -cy - skewingY;
		var left = e.clientX -cx - skewingX;
		if(top + moveIcon.height -skewingY > dnd.options.container.offsetHeight){
			top = dnd.options.container.offsetHeight - moveIcon.height +skewingY;
		}
		if(top < - skewingY){
			top = - skewingY;
		}
		if(left + moveIcon.width -skewingX > dnd.options.container.offsetWidth){
			left = dnd.options.container.offsetWidth - moveIcon.width +skewingX;
		}
		if(left < - skewingX){
			left = - skewingX;
		}
		moveIcon.style.top = top + 'px';
		moveIcon.style.left = left + 'px';
	}

	// 容器中元素鼠标up
	function _iconUp(e){
		document.body.removeEventListener(dnd.mouseEvent[1], _iconMove, false);
	}
	
	//判断是否移动端
	function _isMobilePlatform() {
	    var isTrue = false;
	    //判断是否移动端设备的JS代码
	    if (navigator.userAgent.match(/(iPhone|iPad|Android|ios)/i)) {
	        isTrue = true;
	        //console.log("移动平台");
	    }
	    else {
	        isTrue = false;
	        //console.log("PC");
	    }
	    return isTrue;
	}

	return dnd;
});