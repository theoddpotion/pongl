'use strict';

//Using a module style for local-global scope.
(function(){
	var win = nw.Window.get();

	//Minimize
	document.getElementById('window-controls-minimize').onclick = function(){
		win.minimize();
	};

	//Maximize
	win.isMaximized = false;
	document.getElementById('window-controls-maximize').onclick = function(){
		if(win.isMaximized){
			win.unmaximize();
		}else{
			win.maximize();
		}
	};
	win.on('maximize', function(){
		win.isMaximized = true;
	});
	win.on('restore', function(){
		win.isMaximized = false;
	});

	//Close
	document.getElementById('window-controls-close').onclick = function(){
		win.close();
	}
})();