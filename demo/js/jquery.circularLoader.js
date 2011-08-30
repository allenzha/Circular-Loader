/*
 * Plugin Name: CircularLoader
 *
 * Display a circular animated loader entirely made with canvas
 *
 * Author: Raspo - http://pixncode.com
 * Version: 1.0
 */

function CircularLoader( el, percent, conf ){

	var self	= this;

	$.extend(self, {
		
		utils	: {
			current		: 0,
			next		: percent,
			startAngle	: -Math.PI*(1/2),
			queue		: [],
			is_ready	: true
		},
		
		init	: function(){
		
			self.ctx = self.canvas.getContext("2d");
			
			// Calculate dimensions
			self.param.width		= self.canvas.width;
			self.param.radius		= ( self.param.width/2 ) - ( self.param.lineWidth / 2 );
			self.param.innerRadius	= ( self.param.width/2 ) - self.param.lineWidth - self.param.lineSpacing;
			
			// Save some utils
			self.utils.center		= ( self.param.width/2 );
			
			self.utils.currentAngle = self.utils.startAngle;
			
			// Setup ctx
			self.ctx.lineWidth		= self.param.lineWidth;				
			self.ctx.font			= "27px 'Droid Serif',serif";
			self.ctx.textAlign		= "center";
			self.ctx.textBaseline	= "middle";
			self.ctx.save();
			
			self.clear();
			self.text( 0 );
			self.load( self.utils.next );
		
		},

		clear	: function(){
			
			// Clear frame
			self.ctx.clearRect( 0,0, self.param.width, self.param.width );
			
			// Design inner circle
			self.ctx.fillStyle = self.param.bgColor;
			self.ctx.beginPath();
			self.ctx.arc( self.utils.center, self.utils.center, self.param.innerRadius, 0, Math.PI*2, false );
			self.ctx.closePath();
			self.ctx.fill();
			
			// Design surrounding ring
			self.ctx.strokeStyle = self.param.bgColor;
			self.ctx.beginPath();
			self.ctx.arc( self.utils.center, self.utils.center, self.param.radius, Math.PI*2, 0, false);
			self.ctx.stroke();
			
			self.ctx.strokeStyle = self.param.color;
			self.ctx.save();
			
		},

		load	: function( percent ){
		
			// Add to queue
			if( percent ){ self.utils.queue.push( percent ); }

			if( self.utils.is_ready ){
				
				self.utils.is_ready = false;
				
				self.utils.next = self.utils.queue.shift();
				
				self.utils.nextAngle	= ( ( Math.PI/50 ) * self.utils.next ) - Math.abs( self.utils.startAngle );
				
				self.utils.totFrames	= ( self.param.fps / 1000 ) * self.param.speed ;
					
				var diff			= self.utils.next - self.utils.current, // Difference of percentance
					diffAngle		= self.utils.nextAngle - self.utils.currentAngle,
					angleVariation	= diffAngle / self.utils.totFrames,
					variation		= diff / self.utils.totFrames;	// Percentance variation in each frame
				
				self.utils.timer = setInterval( function(){
					self.animation( angleVariation, variation );
				}, self.param.fps );
				
			}

		},
		
		text	: function( variation ){
			
			self.utils.current	= self.utils.current + variation;
			
			if( self.utils.totFrames <= 1 ){ self.utils.current = self.utils.next; }
		
			var text = Math.round( self.utils.current ) + self.param.afterText;
			
			self.ctx.fillStyle = self.param.textColor;
			self.ctx.fillText( text , self.utils.center , self.utils.center );
		
		},
		
		animation	: function( angleVariation, variation ){
			
			self.utils.currentAngle = self.utils.currentAngle + angleVariation;
			
			self.clear();
			self.text( variation );
			
			self.ctx.strokeStyle = self.param.color;
			
			self.ctx.beginPath();
			self.ctx.arc( self.utils.center, self.utils.center, self.param.radius, self.utils.startAngle, self.utils.currentAngle, false);
			self.ctx.stroke();
			
			if( self.utils.totFrames > 1 ){
			
				self.utils.totFrames--;
				
			} else {
			
				self.animationEnd();
			
			}
			
		},
		
		animationEnd	: function(){
		
			clearInterval( self.utils.timer );
			self.utils.current = self.utils.next;
			
			if( self.utils.current !== 100 ){
				self.utils.is_ready = true;
			}
			
			// Check the queue
			if( self.utils.queue.length ){
				self.load( false );	
			}
		
		}

	});

	self.param	= conf;

	self.canvas = el.get(0);

	if( self.canvas.getContext ){

		self.init();

	} else {

		self.ctx = false;
		console.log( 'canvas is not supported' );

	}
}

(function($){

	$.circularLoader_defaults	= {

		bgColor		: '#444340',
		color		: '#cc3300',
		textColor	: '#f1f0e8',
		lineWidth	: 5,
		lineSpacing	: 7,
		afterText	: '%',
		speed		: 200,
		fps			: 50

	}

	$.fn.CircularLoader	= function( percent, conf ){

		var api = this.data( 'circularloader' );

		if (api) {
		
			api.load( percent );

		} else {

			conf = $.extend( true, {}, $.circularLoader_defaults, conf );

			this.each(function() {

				api = new CircularLoader( $(this), percent, conf );

				$(this).data( 'circularloader', api );

			});

		}

		return this;
	}

})(jQuery);




