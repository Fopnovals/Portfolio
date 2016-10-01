jQuery(function($) {
	$('.operation').each(function() {
		/*Define drop objects*/
		var opener = $('>span', this).removeClass('active');

		/*Add event listener*/
		opener.on('click touchstart', function(e) {
			opener.toggleClass('active');
			e.stopPropagation();
		});
	});

	/*Hide all drops on window click*/
	$(window).on('click touchstart', function() {
		$('.operation >span.active').removeClass('active');
	});
});