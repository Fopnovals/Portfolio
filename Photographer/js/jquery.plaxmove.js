(function($){
	$.fn.plaxmove = function(options) {
		this.defaults = {
			ratioH: 0.2,
			ratioV: 0.2,
			invertH: false,
			invertV: false,
			reversed: false
		}
		
		var settingsPM = $.extend({},this.defaults,options),
			layer = $(this),
			center = {
				x: $('html').width()/2-layer.width()/2,
				y: $('html').height()/2-layer.height()/2
			},
			y0 = layer.position().top,
			x0 = layer.position().left;
			
		if(settingsPM.reversed) {

			if(settingsPM.invertH)
				var eqH = function(e) {
					return x0-(e.pageY - center.y)*settingsPM.ratioH
				}
			
			else 
				var eqH = function(e) {
					return x0+(e.pageY - center.y)*settingsPM.ratioH
				}
			
			if(settingsPM.invertV)
				var eqW = function(e) {
					return y0-(e.pageX - center.x)*settingsPM.ratioV
				}
			else
				var eqW = function(e) {
					return y0+(e.pageX - center.x)*settingsPM.ratioV
				}

		}
		
		else {

			if(settingsPM.invertH)
				var eqH = function(e) {
					return x0-(e.pageX - center.x)*settingsPM.ratioH
				}
			
			else 
				var eqH = function(e) {
					return x0+(e.pageX - center.x)*settingsPM.ratioH
				}
			
			if(settingsPM.invertV)
				var eqW = function(e) {
					return y0-(e.pageY - center.y)*settingsPM.ratioV
				}
			else
				var eqW = function(e) {
					return y0+(e.pageY - center.y)*settingsPM.ratioV
				}		

		}

		$('html').on('mousemove', function(e) {

				x = eqH(e);
				y = eqW(e);

				$(layer).css({top:y,left:x})

		});
	};

})(jQuery);