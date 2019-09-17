
class Keyboard {
	constructor(){

		this.KeyCode = {
			ESCAPE: 27,

			SPACE: 32,

			LEFT: 37,
			UP: 38,
			RIGHT: 39,
			DOWN: 40,

			A: 65,
			D: 68,
			S: 83,
			W: 87,

			COUNT: 222
		};
		
		this.keysDown = [];
		this.keysUp = [];
		this.keysHeld = [];
		this.keysLast = [];

		for(let i = 0; i < this.KeyCode.COUNT; i++){
			this.keysDown[i] = false;
			this.keysUp[i] = false;
			this.keysHeld[i] = false;
			this.keysLast[i] = false;
		}

		this._update = function(){
			for(var i = 0; i < this.KeyCode.COUNT; i++){
				this.keysDown[i] = (!this.keysLast[i]) && this.keysHeld[i];
				this.keysUp[i] = this.keysLast[i] && (!this.keysHeld[i]);
				this.keysLast[i] = this.keysHeld[i];
			}
		};

		this._onKeyDown = function(evnt){
			this.keysHeld[evnt.keyCode] = true;
		};

		this._onKeyUp = function(evnt){
			this.keysHeld[evnt.keyCode] = false;
		};

		window.addEventListener('keydown', this._onKeyDown.bind(this));
		window.addEventListener('keyup', this._onKeyUp.bind(this));
	}

	getKey(keycode){
		this._update();
		return this.keysHeld[keycode];
	}

	getKeyDown(keycode){
		this._update();
		return this.keysDown[keycode];
	}

	getKeyUp(keycode){
		this._update();
		return this.keysUp[keycode];
	}


}

const instance = new Keyboard();
Object.freeze(instance);

export default instance;