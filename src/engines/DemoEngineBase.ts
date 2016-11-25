///<reference path='../overlay/Overlay.ts'/>

namespace engines
{

	import Overlay = overlay.Overlay;
	import OverlayIcons = overlay.OverlayIcons;
	import OverlayOptions = overlay.OverlayOptions;

	export enum VertFormat
	{
		Array,
		Vector
	}

	export interface IVertex
	{
		new (x:number, y:number);
	}

	export abstract class DemoEngineBase
	{

		public name:string = 'INVALID';

		protected canvas:HTMLCanvasElement;
		protected context:CanvasRenderingContext2D;
		protected stageWidth:number;
		protected stageHeight:number;
		protected frameRate:number;
		protected frameRateInterval:number;

		protected _velocityIterations = 10;
		protected _positionIterations = 10;

		public mouseX:number = 0;
		public mouseY:number = 0;

		protected _enableDrawing:boolean = true;
		protected autoClearCanvas = false;

		protected overlays:Overlay[];

		constructor(canvas:HTMLCanvasElement, frameRate:number)
		{
			this.canvas = canvas;
			this.context = this.canvas.getContext('2d');
			this.stageWidth = canvas.width;
			this.stageHeight = canvas.height;

			this.frameRate = frameRate;
			this.frameRateInterval = 1 / frameRate;

			Overlay.bounds.set(0, 0, this.stageWidth, this.stageHeight);

			this.setup();
		}

		abstract setup();

		/**
		 * super.clear() is required for all Demos overriding this method
		 */
		clear()
		{
			this.overlays = [];
		}

		public clearCanvas()
		{
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}

		loadDemo(name:string)
		{
			this.clear();

			let demoFunc = this['loadDemo' + name];
			if(demoFunc)
			{
				demoFunc.call(this);
			}
			else
			{
				this.addWarning(this.stageWidth / 2, 20, `Cannot find "${name}" demo for "${this.name}" engine`);
			}
		}

		/**
		 * Runs this demo. Demos must not override this method and use runInternal instead.
		 * @param deltaTime
		 * @param timestamp
		 */
		run = (deltaTime:number, timestamp:number) =>
		{
			this.runInternal(deltaTime, timestamp);

			if(this._enableDrawing)
			{
				this.renderOverlays();
			}
		};

		protected abstract runInternal(deltaTime:number, timestamp:number);

		protected renderOverlays()
		{
			const context = this.context;

			for(let overlay of this.overlays)
			{
				overlay.render(context);
			}
		}

		/*
		 *** Getters, Setters
		 */

		public get enableDrawing():boolean
		{
			return this._enableDrawing;
		}

		public set enableDrawing(value:boolean)
		{
			this._enableDrawing = value;

			if(!value)
			{
				if(this.autoClearCanvas)
				{
					this.clearCanvas();
				}

				this.onDisableDrawing();
			}
		}

		get positionIterations():number
		{
			return this._positionIterations;
		}
		set positionIterations(value:number)
		{
			if(this._positionIterations == value)
				return;

			this._positionIterations = value;
			this.onPositionIterationsUpdate(value);
		}

		get velocityIterations():number
		{
			return this._velocityIterations;
		}
		set velocityIterations(value:number)
		{
			if(this._velocityIterations == value)
				return;

			this._velocityIterations = value;
			this.onVelocityIterationsUpdate(value);
		}

		/*
		 *** Utility Methods
		 */

		protected addWarning(x, y, message:string, options?:OverlayOptions)
		{
			this.overlays.push(new Overlay(x, y, message, OverlayIcons.Warning, options));
		}

		/*
		 *** Events
		 */

		protected onDisableDrawing() { }

		protected onPositionIterationsUpdate(iterations:number) { }

		protected onVelocityIterationsUpdate(iterations:number) { }

		onMouseDown = (event) => { };

		onMouseUp = (event) => { };

		/*
		 *** Utility Methods
		 */

		static Box(x, y, w, h, format:VertFormat = VertFormat.Array, VertexClass:IVertex = null):Array<Array<number>|{x:number, y:number}|any>
		{
			var vertices = [];
			const useArray = format == VertFormat.Array;

			const hw = w / 2;
			const hh = h / 2;

			const boxVertices = [
				x + hw, y + hh,
				x - hw, y + hh,
				x - hw, y - hh,
				x + hw, y - hh
			];

			for(let a = 0; a < 8; a += 2)
			{
				let x = boxVertices[a];
				let y = boxVertices[a + 1];

				if(VertexClass)
					vertices.push(new VertexClass(x, y));
				else
					vertices.push(useArray ? [x, y] : {x: x, y:y});
			}

			return vertices;
		}

		static Regular(xRadius, yRadius, edgeCount, angleOffset = 0, format:VertFormat = VertFormat.Array, VertexClass:IVertex = null):Array<Array<number>|{x:number, y:number}|any>
		{
			var vertices = [];
			const useArray = format == VertFormat.Array;

			for(let a = 0; a < edgeCount; a++)
			{
				let x = xRadius * Math.cos(angleOffset + 2 * Math.PI * (a / edgeCount));
				let y = yRadius * Math.sin(angleOffset + 2 * Math.PI * (a / edgeCount));

				if(VertexClass)
					vertices.push(new VertexClass(x, y));
				else
					vertices.push(useArray ? [x, y] : {x: x, y:y});
			}

			return vertices;
		}

	}

}