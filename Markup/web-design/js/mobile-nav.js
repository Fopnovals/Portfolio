jQuery(document).ready(function($){
    /* Подготавливаем иконку меню */
    $('#nav-wrap').prepend('<div id="menu-icon"></div>');
    /* Включаем навигацию */
    $("#menu-icon").on("click", function(){
        $("#nav").slideToggle();
	$("#nav2").slideToggle();
        $(this).toggleClass("active");
    });
});
