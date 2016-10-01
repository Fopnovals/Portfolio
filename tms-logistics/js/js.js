//MAP
window.addEventListener('load', mapInit2);

function mapInit2 (){
    var myMap;

    ymaps.ready(function(){
        var myMap = new ymaps.Map("map", {
            center: [55.784916, 37.722541],
            zoom: 15,
            controls: ['smallMapDefaultSet']
        }),
        myPlacemark = new ymaps.Placemark([55.784916, 37.722541], {}, {
            iconLayout: 'default#image',
            iconImageHref: 'img/icon-map.png',
            iconImageSize: [116, 33],
            iconImageOffset: [-3, -42]
        });
    myMap.geoObjects.add(myPlacemark); // Размещение геообъекта на карте.
        myMap.controls.remove('searchControl');
        myMap.controls.remove('trafficControl');
        myMap.controls.remove('typeSelector');
        myMap.controls.remove('fullscreenControl');
})}



    $(document).ready(function() {
//SCROLL
        $('a[href^="#service-company"]').click(function () {
            elementClick = $(this).attr("href");

            destination = $(elementClick).offset().top;
                $('body,html').animate( { scrollTop: destination-20 }, 1100 );
            return false;
        });


//MOBILE SIDEBAR
        var o = $(".info") || null,
            k = $('.accordion_item') || null,
            n = $(".info_items") || null,
            t = $(".title_block") || null;
        t.on("click", function() {
            if(o.hasClass("active_block")) {
                o.slideUp();
                o.removeClass("active_block");
                k.removeClass("active_block");
            } else {
                o.slideDown();
                o.addClass("active_block");
                k.addClass("active_block");
            }
        })

    });



