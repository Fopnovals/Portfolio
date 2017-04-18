

function _ID(e) {
    return document.getElementById(e);
}

function app() {
    "use strict";

    (function(){let b=true,f=false;function g(a){let c=a||{};this.d=this.c=f;if(a.visible==undefined)a.visible=b;if(a.shadow==undefined)a.shadow="7px -3px 5px rgba(88,88,88,0.7)";if(a.anchor==undefined)a.anchor=i.BOTTOM;this.setValues(c)}g.prototype=new google.maps.OverlayView;window.RichMarker=g;g.prototype.getVisible=function(){return this.get("visible")};g.prototype.getVisible=g.prototype.getVisible;g.prototype.setVisible=function(a){this.set("visible",a)};g.prototype.setVisible=g.prototype.setVisible;
        g.prototype.s=function(){if(this.c){this.a.style.display=this.getVisible()?"":"none";this.draw()}};g.prototype.visible_changed=g.prototype.s;g.prototype.setFlat=function(a){this.set("flat",!!a)};g.prototype.setFlat=g.prototype.setFlat;g.prototype.getFlat=function(){return this.get("flat")};g.prototype.getFlat=g.prototype.getFlat;g.prototype.p=function(){return this.get("width")};g.prototype.getWidth=g.prototype.p;g.prototype.o=function(){return this.get("height")};g.prototype.getHeight=g.prototype.o;
        g.prototype.setShadow=function(a){this.set("shadow",a);this.g()};g.prototype.setShadow=g.prototype.setShadow;g.prototype.getShadow=function(){return this.get("shadow")};g.prototype.getShadow=g.prototype.getShadow;g.prototype.g=function(){if(this.c)this.a.style.boxShadow=this.a.style.webkitBoxShadow=this.a.style.MozBoxShadow=this.getFlat()?"":this.getShadow()};g.prototype.flat_changed=g.prototype.g;g.prototype.setZIndex=function(a){this.set("zIndex",a)};g.prototype.setZIndex=g.prototype.setZIndex;
        g.prototype.getZIndex=function(){return this.get("zIndex")};g.prototype.getZIndex=g.prototype.getZIndex;g.prototype.t=function(){if(this.getZIndex()&&this.c)this.a.style.zIndex=this.getZIndex()};g.prototype.zIndex_changed=g.prototype.t;g.prototype.getDraggable=function(){return this.get("draggable")};g.prototype.getDraggable=g.prototype.getDraggable;g.prototype.setDraggable=function(a){this.set("draggable",!!a)};g.prototype.setDraggable=g.prototype.setDraggable;
        g.prototype.k=function(){if(this.c)this.getDraggable()?j(this,this.a):k(this)};g.prototype.draggable_changed=g.prototype.k;g.prototype.getPosition=function(){return this.get("position")};g.prototype.getPosition=g.prototype.getPosition;g.prototype.setPosition=function(a){this.set("position",a)};g.prototype.setPosition=g.prototype.setPosition;g.prototype.q=function(){this.draw()};g.prototype.position_changed=g.prototype.q;g.prototype.l=function(){return this.get("anchor")};g.prototype.getAnchor=g.prototype.l;
        g.prototype.r=function(a){this.set("anchor",a)};g.prototype.setAnchor=g.prototype.r;g.prototype.n=function(){this.draw()};g.prototype.anchor_changed=g.prototype.n;function l(a,c){let d=document.createElement("DIV");d.innerHTML=c;if(d.childNodes.length==1)return d.removeChild(d.firstChild);else{for(let e=document.createDocumentFragment();d.firstChild;)e.appendChild(d.firstChild);return e}}function m(a,c){if(c)for(let d;d=c.firstChild;)c.removeChild(d)}
        g.prototype.setContent=function(a){this.set("content",a)};g.prototype.setContent=g.prototype.setContent;g.prototype.getContent=function(){return this.get("content")};g.prototype.getContent=g.prototype.getContent;
        g.prototype.j=function(){if(this.b){m(this,this.b);let a=this.getContent();if(a){if(typeof a=="string"){a=a.replace(/^\s*([\S\s]*)\b\s*$/,"$1");a=l(this,a)}this.b.appendChild(a);let c=this;a=this.b.getElementsByTagName("IMG");for(let d=0,e;e=a[d];d++){google.maps.event.addDomListener(e,"mousedown",function(h){if(c.getDraggable()){h.preventDefault&&h.preventDefault();h.returnValue=f}});google.maps.event.addDomListener(e,"load",function(){c.draw()})}google.maps.event.trigger(this,"domready")}this.c&&
        this.draw()}};g.prototype.content_changed=g.prototype.j;function n(a,c){if(a.c){let d="";if(navigator.userAgent.indexOf("Gecko/")!==-1){if(c=="dragging")d="-moz-grabbing";if(c=="dragready")d="-moz-grab"}else if(c=="dragging"||c=="dragready")d="move";if(c=="draggable")d="pointer";if(a.a.style.cursor!=d)a.a.style.cursor=d}}
        function o(a,c){if(a.getDraggable())if(!a.d){a.d=b;let d=a.getMap();a.m=d.get("draggable");d.set("draggable",f);a.h=c.clientX;a.i=c.clientY;n(a,"dragready");a.a.style.MozUserSelect="none";a.a.style.KhtmlUserSelect="none";a.a.style.WebkitUserSelect="none";a.a.unselectable="on";a.a.onselectstart=function(){return f};p(a);google.maps.event.trigger(a,"dragstart")}}
        function q(a){if(a.getDraggable())if(a.d){a.d=f;a.getMap().set("draggable",a.m);a.h=a.i=a.m=null;a.a.style.MozUserSelect="";a.a.style.KhtmlUserSelect="";a.a.style.WebkitUserSelect="";a.a.unselectable="off";a.a.onselectstart=function(){};r(a);n(a,"draggable");google.maps.event.trigger(a,"dragend");a.draw()}}
        function s(a,c){if(!a.getDraggable()||!a.d)q(a);else{let d=a.h-c.clientX,e=a.i-c.clientY;a.h=c.clientX;a.i=c.clientY;d=parseInt(a.a.style.left,10)-d;e=parseInt(a.a.style.top,10)-e;a.a.style.left=d+"px";a.a.style.top=e+"px";let h=t(a);a.setPosition(a.getProjection().fromDivPixelToLatLng(new google.maps.Point(d-h.width,e-h.height)));n(a,"dragging");google.maps.event.trigger(a,"drag")}}function k(a){if(a.f){google.maps.event.removeListener(a.f);delete a.f}n(a,"")}
        function j(a,c){if(c){a.f=google.maps.event.addDomListener(c,"mousedown",function(d){o(a,d)});n(a,"draggable")}}function p(a){if(a.a.setCapture){a.a.setCapture(b);a.e=[google.maps.event.addDomListener(a.a,"mousemove",function(c){s(a,c)},b),google.maps.event.addDomListener(a.a,"mouseup",function(){q(a);a.a.releaseCapture()},b)]}else a.e=[google.maps.event.addDomListener(window,"mousemove",function(c){s(a,c)},b),google.maps.event.addDomListener(window,"mouseup",function(){q(a)},b)]}
        function r(a){if(a.e){for(let c=0,d;d=a.e[c];c++)google.maps.event.removeListener(d);a.e.length=0}}
        function t(a){let c=a.l();if(typeof c=="object")return c;let d=new google.maps.Size(0,0);if(!a.b)return d;let e=a.b.offsetWidth;a=a.b.offsetHeight;switch(c){case i.TOP:d.width=-e/2;break;case i.TOP_RIGHT:d.width=-e;break;case i.LEFT:d.height=-a/2;break;case i.MIDDLE:d.width=-e/2;d.height=-a/2;break;case i.RIGHT:d.width=-e;d.height=-a/2;break;case i.BOTTOM_LEFT:d.height=-a;break;case i.BOTTOM:d.width=-e/2;d.height=-a;break;case i.BOTTOM_RIGHT:d.width=-e;d.height=-a}return d}
        g.prototype.onAdd=function(){if(!this.a){this.a=document.createElement("DIV");this.a.style.position="absolute"}if(this.getZIndex())this.a.style.zIndex=this.getZIndex();this.a.style.display=this.getVisible()?"":"none";if(!this.b){this.b=document.createElement("DIV");this.a.appendChild(this.b);let a=this;google.maps.event.addDomListener(this.b,"click",function(){google.maps.event.trigger(a,"click")});google.maps.event.addDomListener(this.b,"mouseover",function(){google.maps.event.trigger(a,"mouseover")});
            google.maps.event.addDomListener(this.b,"mouseout",function(){google.maps.event.trigger(a,"mouseout")})}this.c=b;this.j();this.g();this.k();let c=this.getPanes();c&&c.overlayImage.appendChild(this.a);google.maps.event.trigger(this,"ready")};g.prototype.onAdd=g.prototype.onAdd;
        g.prototype.draw=function(){if(!(!this.c||this.d)){let a=this.getProjection();if(a){let c=this.get("position");a=a.fromLatLngToDivPixel(c);c=t(this);this.a.style.top=a.y+c.height+"px";this.a.style.left=a.x+c.width+"px";a=this.b.offsetHeight;c=this.b.offsetWidth;c!=this.get("width")&&this.set("width",c);a!=this.get("height")&&this.set("height",a)}}};g.prototype.draw=g.prototype.draw;g.prototype.onRemove=function(){this.a&&this.a.parentNode&&this.a.parentNode.removeChild(this.a);k(this)};
        g.prototype.onRemove=g.prototype.onRemove;let i={TOP_LEFT:1,TOP:2,TOP_RIGHT:3,LEFT:4,MIDDLE:5,RIGHT:6,BOTTOM_LEFT:7,BOTTOM:8,BOTTOM_RIGHT:9};window.RichMarkerPosition=i;
    })();

    const body = $('body');

    // collapse widget
    body.on('click', '.js-widget-collapse', function(e) {
        e.preventDefault();
        $(this)
            .closest('.widget')
            .toggleClass('widget-expanded')
            .find('.widget-list')
            .slideToggle(150);
    });

    // selectbox
    $('.stuff-option').styler();
    $('.stuff .icon').styler();
    $('.order-select, .m-order-select, .select-country, .select-p').styler({
        selectSmartPositioning: false
    });
    $('.field-select').styler({
        selectSmartPositioning: false,
        onFormStyled: function() {
            let listItems = $('li[data-icon]');
            listItems.each(function() {
                let t = $(this);
                t.wrapInner('<span/>');
                $('<span class="icon-holder"><span class="icon icon-' + t.data('icon') + '"></span></span>').prependTo(t);
            });
        }
    });

    // scroll

    $(window).scroll(function() {
        if (pageYOffset >= $('.hero').outerHeight()+47 && $('.hero').length) {
            body.addClass('fixed-header');
        } else if (!$('.hero').length && pageYOffset > 46) {
            body.addClass('fixed-header');
        } else {
            body.removeClass('fixed-header');
        }
    });

    // play video
    body.on('click', '.js-play', function(e) {
        e.preventDefault();
        let t = $(this),
            wrap = t.closest('.video'),
            frame = wrap.find('iframe'),
            src = frame.prop('src');
        src += "?autoplay=1";
        wrap.addClass('playing');
        frame.attr('src', src);
    });

    // product slider
    $('.viewed-items').slick({
        slidesToShow: 6,
        slidesToScroll: 2,
        speed: 300,
        dots: false,
        arrows: true,
        appendArrows: $('.viewed-arrows'),
        responsive: [
            {
                breakpoint: 1025,
                settings: {
                    slidesToShow: 5,
                    dots: true,
                    arrows: false
                }
            }
        ]
    });

    $('.similar-items').slick({
        slidesToShow: 4,
        slidesToScroll: 2,
        speed: 300,
        dots: false,
        arrows: true,
        appendArrows: $('.similar-arrows'),
        responsive: [
            {
                breakpoint: 1025,
                settings: {
                    slidesToShow: 4,
                    dots: true,
                    arrows: false
                }
            }
        ]
    });

    // slider
    $('.slider').slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        speed: 750,
        dots: false,
        arrows: true
    });

    //latest-slider
    $('.latest-slider').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        speed: 750,
        dots: true,
        arrows: false
    });

    // map
    function initMap() {

        let styles = [{"featureType":"water","elementType":"geometry","stylers":[{"color":"#e9e9e9"},{"lightness":17}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":16}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":21}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#dedede"},{"lightness":21}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"lightness":16}]},{"elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#333333"},{"lightness":40}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#f2f2f2"},{"lightness":19}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#fefefe"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#fefefe"},{"lightness":17},{"weight":1.2}]}];

        let
            mapJQ = $('#map'),
            latLng = new google.maps.LatLng(mapJQ.data('lat'), mapJQ.data('lng')),
            map = new google.maps.Map(document.getElementById('map'), {
                center: latLng,
                scrollwheel: false,
                zoom: mapJQ.data('zoom'),
                styles: styles,
                disableDefaultUI: true
            }),
            image = 'img/gui/pin.png',
            marker = new google.maps.Marker({
                position: latLng,
                map: map,
                icon: image
            }),
            toggler = $('.map-toggler'),
            height = toggler.data('height'),
            regularHeight = toggler.data('regular-height');
        toggler.length && toggler.click(e => {
            e.preventDefault();
            mapJQ.animate({
                'height': toggler.hasClass('active') ? regularHeight : height
            }, 200);
            toggler.toggleClass('active');
            setTimeout(e => {
                google.maps.event.trigger(map, "resize");
                map.setCenter(latLng);
            }, 300);
        });
    }

    document.getElementById('map') && initMap();

     //datepicker
    (function() {
        const datepicker = $('#datepicker');
        if (datepicker.length) {
            let
                dates = datepicker.data('dates'),
                datesArray = [];
            $
                .ajax({
                    url: dates
                })
                .done(d => {
                    let dates = d.dates;
                    dates.forEach(e => datesArray.push(new Date(e.date)));
                    datepicker.multiDatesPicker({
                        showOtherMonths: true,
                        addDates: datesArray,
                        beforeShowDay: function(date) {
                            return [true, 'nonono ui-datepicker-unselectable', ''];
                        }
                    });
                    function setHolidaysData() {
                        $('.ui-state-highlight[data-handler="selectDay"]').each(function() {
                            let t = $(this),
                                m = t.data('month') + 1,
                                y = t.data('year'),
                                d = t.text(),
                                fullDate = y + "-" + m + "-" + d;
                            dates.forEach(e => {
                                if (e.date == fullDate) {
                                t.attr('data-hover', e.holiday);
                                t.removeClass('nonono');
                            }
                            });
                        });
                    }
                    setTimeout(e => {
                        let observer = new MutationObserver(mutations => {
                            setHolidaysData();
                        });
                        observer.observe(document.querySelector('.ui-datepicker'), {
                            childList: true
                        });
                        setHolidaysData();
                    }, 1000);
                });
        }

    })();



    // pgp key
    body.on('click', '.js-pgp', function(e) {
        e.preventDefault();
        $(this).toggleClass('active').siblings('.pgp').slideToggle(200);
    });

    (function() {
        let clip = new Clipboard('.js-clipboard');
        clip.on('success', (e) => {
            e.trigger.classList.add('active');
            setTimeout(() => e.trigger.classList.remove('active'), 2000);
        });
    })();

    // scrollto
    body.on('click', '.js-scrollto', function(e) {
        e.preventDefault();
        let scrollTo = $(this).data('href');
        TweenMax.to(window, 1, {
            scrollTo: {
                y: scrollTo,
                offsetY: 64
            },
            ease: Power2.easeOut
        });
    });

    // timer
    $('.clock[data-time]').each(function() {
        let t = $(this), fin = t.data('time');
        t.countdown(fin).on('update.countdown', function(e) {
            t.html(e.strftime(''
                + '<span class="clock-block">days<span class="clock-time">%-d</span></span>'
                + '<span class="clock-block">hours<span class="clock-time">%H</span></span>'
                + '<span class="clock-block">minutes<span class="clock-time">%M</span></span>'
                + '<span class="clock-block">seconds<span class="clock-time">%S</span></span>'
            ));
        });
    });

    // faq
    body.on('click', '.faq-trigger', function(e) {
        e.preventDefault();
        const t = $(this);
        $('.faq-trigger')
            .not(t)
            .removeClass('active')
            .siblings('.faq-content')
            .slideUp(250);
        t.addClass('active')
            .siblings('.faq-content')
            .slideDown(250);
    });

    // password toggle
    $('.password-toggle').hover(function() {
        $(this).siblings('.input').attr('type', 'text');
    }, function() {
        $(this).siblings('.input').attr('type', 'password');
    });

    // article reply
    body.on('click', '.js-toggle-target', function(e) {
        e.preventDefault();
        const target = $(this).attr('href');
        $(target).slideToggle(200);
    });

    // input file
    _ID('upload-recipe') && _ID('upload-recipe').addEventListener('change', function() {
        $('.label-file-name').css('display', 'inline-flex').text(this.files[0].name);
    });

    _ID('upload-photo') && _ID('upload-photo').addEventListener('change', function() {
        $('.label-file-photo-text').text(this.files[0].name).siblings('.icon').addClass('active');
    });

    // input count
    body.on('click', '.js-count', function(e) {
        e.preventDefault();
        let
            t = $(this),
            input = t.siblings('.input-count'),
            currency = input.data('currency'),
            value = parseInt(input.val()),
            decrease = t.hasClass('input-count-minus'),
            totalPrice = t.closest('.modal-quant').find('.modal-price'),
            basePrice = parseFloat(t.data('price'));
        if (decrease) {
            if (value == 50) return;
            input.val(value - 50 + 'gr');
        } else {
            input.val(value + 50 + 'gr');
        }
        if (totalPrice.length) {
            totalPrice.text(basePrice*parseInt(input.val())/50 + currency);
        }
    });

    // input count currency
    body.on('click', '.js-counter', function(e) {
        e.preventDefault();
        let
            t = $(this),
            input = t.siblings('.input-count'),
            currency = input.data('currency'),
            value = parseInt(input.val()),
            decrease = t.hasClass('input-count-minus');
        if (decrease) {
            if (value == 1) return;
            input.val((value - 1) + currency);
        } else {
            input.val((value + 1) + currency);
        }
    });

    // group buy features
    body.on('click', '.modal-proposal-link', function(e) {
        e.preventDefault();
        $(this).closest('form').addClass('hidden').next().removeClass('hidden');
    });
    body.on('submit', '.modal-form-authorize, .modal-form-register', function(e) {
        e.preventDefault();
        $(this).addClass('hidden')
            .siblings('.modal-form-success').removeClass('hidden')
            .siblings('.modal-form-group-buy').find('[disabled]').prop('disabled', false);
    });

    // select country
    body.on('change', '.select-country', function(e) {
       let v = $(this).val();
       v && $('.flag').removeClass('active').filter('[data-value="'+v+'"]').addClass('active');
    });

    // tabs
    $('.js-tab-trigger').each(function() {
        const t = $(this),
            target = $(t.attr('href')),
            otherTargets = t.closest('.js-tabs').find('.js-tab-target').not(target),
            other = t.closest('.js-tabs').find('.js-tab-trigger').not(t);
        t.click(e => {
            e.preventDefault();
            other.add(otherTargets).removeClass('active');
            t.add(target).addClass('active');
        });
    });

    // nav search
    body.on('mouseenter', '.nav-category .nav-link', function() {
        let target = $(this).data('href');
        $('.nav-category .nav-link').removeClass('active');
        $(this).addClass('active');
        $('.nav-category-dropdown')
            .stop(true).removeClass('active')
            .filter(target).addClass('active');
    });
    body.on('mouseleave', '.nav-category', function() {
        $('.nav-category .nav-link').removeClass('active');
        $('.nav-category-dropdown').stop(true).delay(500).removeClass('active');
    });


    // order forms
    $('.js-order-choose').each(function() {
        const t = $(this),
            row = t.closest('.oform-row'),
            otherRows = row.siblings('.oform-row'),
            other = otherRows.find('.js-order-choose');
        t.on('change', e => {
            e.preventDefault();
            if (t.prop('checked')) {
                row.addClass('active');
                otherRows.removeClass('active');
                other.prop('checked', false);
            } else {
                t.prop('checked', true);
            }
        });
    });

    body.on('submit', '.oform-shipping', function(e) {
        e.preventDefault();
        $('.order-nav-link').last().trigger('click');
        TweenMax.to(window, .5, {
            scrollTo: {
                y: 0
            },
            ease: Power2.easeOut
        });
    });

    // ui slider
    (function() {
        const sliderUI = $('#slider');
        if (sliderUI.length) {
            let
                step = +sliderUI.data('step'),
                min = +sliderUI.data('min'),
                max = +sliderUI.data('max'),
                start = +sliderUI.data('start'),
                handle = $( "#custom-handle" );
            sliderUI.slider({
                min: min,
                max: max,
                step: step,
                create: function() {
                    handle.text( $( this ).slider( "value" ) );
                },
                slide: function( event, ui ) {
                    handle.text( ui.value );
                    totalPreorder();
                }
            });
        }
    }());

    // map data

    (function(){
        const rMap = $('#reviews-map');
        if (rMap.length) {
            let
                myMap = _ID('reviews-map'),
                styles = [{"stylers":[{"visibility":"on"},{"saturation":-100}]},{"featureType":"water","stylers":[{"visibility":"on"},{"saturation":100},{"hue":"#00ffe6"}]},{"featureType":"road","elementType":"geometry","stylers":[{"saturation":100},{"hue":"#00ffcc"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","stylers":[{"visibility":"on"}]}],
                infoWindow = new google.maps.InfoWindow(),
                markersList = {},
                myLatlng,
                myOptions,
                map;
            $
                .ajax({
                    url: rMap.data('data')
                })
                .done(d => {
                    let
                        lat = d.map.lat,
                        long = d.map.long,
                        i = 0;
                    markersList = d.users;
                    myLatlng = new google.maps.LatLng(lat, long);
                    myOptions = {
                        zoom: d.map.zoom,
                        center: myLatlng,
                        scrollwheel: false
                    };
                    map = new google.maps.Map(myMap, myOptions);
                    map.setOptions({styles: styles});
                    (function() {
                        let i = 0;
                        for (; i < markersList.length; i+=1) {
                            let d = markersList[i],
                                lat = d.lat,
                                long = d.long,
                                markerPosition = new google.maps.LatLng(lat, long),
                                marker = new RichMarker({
                                    position: markerPosition,
                                    map: map,
                                    shadow: 'none',
                                    draggable: false,
                                    content: `<i class="icon icon-pin"></i>`
                                }),
                                img = d.img,
                                name = d.name,
                                city = d.city,
                                country = d.country;
                            (function (marker, d) {
                                google.maps.event.addListener(marker, "mouseover", function() {
                                    infoWindow
                                        .setContent(`
                                        <div class="window" style="z-index: 1000" data-toggle="modal" data-target="#recall">
                                            <div class="window-ava" style="background-image: url(${img})"></div>
                                            <div class="window-desc">
                                                <div class="window-name">${name}</div>
                                                <div class="window-address">${country}, ${city}</div>
                                            </div>
                                        </div>`);
                                    infoWindow.open(map, marker);
                                    var timeoutHandle = window.setTimeout(function() {
                                        infoWindow.close();
                                    },3000);
                                });
                            })(marker, d);
                        }
                    })();

                    $('.reviews-collapse').click(e => {
                        e.preventDefault();
                        $('.reviews').toggleClass('active');
                        setTimeout(e => {
                            google.maps.event.trigger(map, "resize");
                            map.setCenter(myLatlng);
                        }, 500);
                    });
                });

        }
        //$('#recall').modal();
    }());

    // open cart
    body.on('click', '.js-cdd-open', e => {
        e.preventDefault();
        body.toggleClass('cdd-opened');
    });

    $(document).click(e => {
       if ($(e.target).closest('.nav-account').length) return;
       body.removeClass('cdd-opened');
       e.stopPropagation();
    });

    // gallery slider
    //$('.p-gallery').slick({
    //    dots: true,
    //    arrows: false,
    //    autoplay: false,
    //    slidesToShow: 1,
    //    slidesToScroll: 1,
    //    speed: 650,
    //    appendDots: $('.p-dots'),
    //    customPaging: (slider, i) => {
    //        let slide = $(slider.$slides[i]),
    //            bg = slide.attr('style'),
    //            pattern = /\(.*?\)/g,
    //            test = ''+pattern.exec(bg)[0],
    //            result = '<a class="p-dot" style="background-image:url'+test+'"></a>';
    //console.log(result);
    //        return result;
    //    }
    //});
    $('.p-gallery').slick({
        dots: false,
        arrows: false,
        autoplay: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        speed: 650,
        asNavFor: '.small-gallery'
    });
    $('.small-gallery').slick({
        dots: false,
        arrows: false,
        autoplay: false,
        slidesToShow: 5,
        slidesToScroll: 1,
        focusOnSelect: true,
        speed: 650,
        asNavFor: '.p-gallery'
    });
}

window.addEventListener('load', app);
window.addEventListener('load', checkDiscount);



//COUNT PERCENTS OF DISCOUNT IN FORM 'APPLICATION FOR FEEDBACK'
var variables = {
    'arguments': {
        'pattern': /^[a-z0-9_-]+@[a-z0-9-]+\.[a-z]{2,6}$/i,
        'patternUrl': /^(?:([a-z]+):(?:([a-z]*):)?\/\/)?(?:([^:@]*)(?::([^:@]*))?@)?((?:[a-z0-9_-]+\.)+[a-z]{2,}|localhost|(?:(?:[01]?\d\d?|2[0-4]\d|25[0-5])\.){3}(?:(?:[01]?\d\d?|2[0-4]\d|25[0-5])))(?::(\d+))?(?:([^:\?\#]+))?(?:\?([^\#]+))?(?:\#([^\s]+))?$/i,
        'patternNumbers': /^\d+$/,
        'patternPhoto': /^.*\.(?:jpg|jpeg)\s*$/ig

    },
    'elements': {
        'resultOfView': $('.summ-percents'),
        'resultBg': $('.bg-percents'),
        'resultInput': $('#summ-percents'),
        'emailForDiscount': $('#email-for-discount'),
        'percentEmail': $('#email-for-discount').prev().find('.percent').text(),
        'country': $('#country-select'),
        'percentCountry': $('#country-select').prev().find('.percent').text(),
        'city': $('#city-select'),
        'percentCity': $('#city-select').prev().find('.percent').text(),
        'message': $('#message-box'),
        'percentMessage': $('#message-box').prev().find('.percent').text(),
        'link': $('#link-input'),
        'percentLink': $('#link-input').prev().find('.percent').text(),
        'trackNumber': $('#track-number'),
        'percentTrackNumber': $('#track-number').prev().find('.percent').text(),
        'upload': $('#upload-photos'),
        'percentUpload': $('#upload-photos').parent().parent().find('.percent-photo').text()
    },
    'summPercents': 0,
    'koefficient': (function() {
        var maxPerc = 0;
        $('#give-feedback-form .percent').each(function(i, el){
            maxPerc += parseFloat($(el).text());
        });
        maxPerc += parseFloat($('.percent-photo').text());
        return 100 / maxPerc;
    })()
};

var flags = {
    'addedForEmail': false,
    'addedForCountry': false,
    'addedForCity': false,
    'addedForMessage': false,
    'addedForLink': false,
    'addedForTrackNumber': false,
    'addedForUpload': false
};


function checkDiscount() {
    //variables.elements.emailForDiscount.on('change', function() {
    //    if(variables.arguments.pattern.test($(this).val())) {
    //        viewSummDiscount(variables.elements.percentEmail, 'addedForEmail');
    //    } else if($(this).val() == '' || !variables.arguments.pattern.test($(this).val())) {
    //        viewSummDiscount(variables.elements.percentEmail, 'addedForEmail', $(this));
    //    }
    //});

    variables.elements.country.on('change', function() {
        if($(this).val().length) {
            viewSummDiscount(variables.elements.percentCountry, 'addedForCountry');
        }
    });

    variables.elements.city.on('change', function() {
        if($(this).val().length) {
            viewSummDiscount(variables.elements.percentCity, 'addedForCity');
        }
    });

    variables.elements.message.on('change', function() {
        if($(this).val().length) {
            viewSummDiscount(variables.elements.percentMessage, 'addedForMessage');
        } else {
            viewSummDiscount(variables.elements.percentMessage, 'addedForMessage', $(this));
        }
    });

    variables.elements.link.on('change', function() {
        if(variables.arguments.patternUrl.test($(this).val())) {
            viewSummDiscount(variables.elements.percentLink, 'addedForLink');
        } else if($(this).val() == '' || !variables.arguments.patternUrl.test($(this).val())) {
            viewSummDiscount(variables.elements.percentLink, 'addedForLink', $(this));
        }
    });

    variables.elements.trackNumber.on('change', function() {
        if(variables.arguments.patternNumbers.test($(this).val())) {
            viewSummDiscount(variables.elements.percentTrackNumber, 'addedForTrackNumber');
        } else if($(this).val() == '' || !variables.arguments.patternNumbers.test($(this).val())) {
            viewSummDiscount(variables.elements.percentTrackNumber, 'addedForTrackNumber', $(this));
        }
    });

    variables.elements.upload.on('change', function() {
        if($(this).val().length && variables.arguments.patternPhoto.test($(this).val())) {
            viewSummDiscount(variables.elements.percentUpload, 'addedForUpload');
        } else {
            viewSummDiscount(variables.elements.percentUpload, 'addedForUpload', $(this));
        }
    });
}

function viewSummDiscount (elemPerc, param, elemChanged) {
    if(!flags[param] && elemChanged == undefined) {
        variables.summPercents += parseFloat(elemPerc);
        variables.elements.resultOfView.text(variables.summPercents + '%');
        $('.bg-percents').css({'width': ((variables.summPercents * variables.koefficient) + '%')});
        variables.elements.resultInput.val((variables.summPercents + '%'));
        flags[param] = true;
    }
    else if(flags[param] && elemChanged != undefined) {
        variables.summPercents -= parseFloat(elemPerc);
        variables.elements.resultOfView.text(variables.summPercents + '%');
        $('.bg-percents').css({'width': ((variables.summPercents * variables.koefficient) + '%')});
        variables.elements.resultInput.val((variables.summPercents + '%'));
        flags[param] = false;
    }
}



//COUNT TOTAL PREORDER
var buySumTotal = 0;
function totalPreorder() {
    var priceProduct = +$('#select-product option:selected').val() || 0;
    var shippingCountry = +$('#shipping-country option:selected').val() || 0;
    var countProduct = +$('#custom-handle').text();
    buySumTotal = priceProduct * countProduct + shippingCountry;
    $('.each-price').text(priceProduct * countProduct);
    $('.shipping-price').text(shippingCountry);
    $('.total-price').text(buySumTotal);
    if(priceProduct && shippingCountry) {
        $('.nav.buy-summary').css('display','flex');
    } else {
        $('.nav.buy-summary').css('display', 'none');
    }
}

$('#select-product').on('change', totalPreorder);
$('#shipping-country').on('change', totalPreorder);


//COUNT TOTAL PREORDER in product page tab EXPRESS CHECKOUT
var buySumTotalExpress = 0;
function totalPreorderExpress() {
    var priceProduct = +$('#express-product option:selected').val() || 0;
    var weightProduct = +$('#express-weight option:selected').val() || 0;
    buySumTotalExpress = priceProduct * weightProduct;
    if(priceProduct && weightProduct) {
        $('.i-sum.express').css('display','flex').find('.i-total').text(buySumTotalExpress + '$');
    } else {
        $('.i-sum.express').css('display', 'none');
    }
}

$('#express-product').on('change', totalPreorderExpress);
$('#express-weight').on('change', totalPreorderExpress);


//COUNT TOTAL PREORDER in page PRODUCT tab BUY SAMPLE
function totalPreorderBuySample() {
    var priceProduct = +$('#buy-sample-product option:selected').val() || 0;
    var shippingCountry = +$('#buy-sample-country option:selected').val() || 0;
    var weightProduct = +$('#buy-sample-weight option:selected').val() || 0;
    buySumTotal = priceProduct * weightProduct + shippingCountry;
    $('.ship-price').text('$' + shippingCountry);
    $('.sum-price').text('$' + priceProduct * weightProduct);
    $('.buy-sample-total').text(buySumTotal + '$');
    if(priceProduct && shippingCountry && weightProduct) {
        $('.buy-sample.i-sum').css('display','flex');
    } else {
        $('.buy-sample.i-sum').css('display', 'none');
    }
}

$('#buy-sample-product').on('change', totalPreorderBuySample);
$('#buy-sample-country').on('change', totalPreorderBuySample);
$('#buy-sample-weight').on('change', totalPreorderBuySample);


window.addEventListener('load', function() {
    //scrolling to header on click mouse icon
    $('.icon-mouse').on('click', function() {
      $('body, html').animate({'scrollTop': $(this).parent().next().position().top}, 800);
    });


    //ajax add items to shop
    $('.load-more').each(function() {
        if(!$(this).closest('.news').length && !$(this).closest('.globalnav').length) {
            $(this).on('click', function(event) {
                event.preventDefault();
                var $this = $(this),
                    urlItems,
                    sourseInsert,
                    leftItems = +(/\/[0-9]+/).exec($this.text())[0].replace('/', '');
                if($this.parent().prev('.shop-row').length) {
                    urlItems = 'items-ajax.html';
                    sourseInsert = function(a) {
                        ($this.parent()).before(a);
                    }
                } else if($this.parent().prev('.shop-table').length) {
                    urlItems = 'items-ajax2.html';
                    sourseInsert = function(a) {
                        ($this.parent().prev()).append(a);
                    }
                }
                if(urlItems != undefined) {
                    $.ajax({
                            url: urlItems,
                            success: function (data) {
                                sourseInsert(data);
                                $this.html('Load more 4/'+ (leftItems -= 4));
                            }
                        }
                    )
                }
            });
        }
    });



    //add button top next to button Load more
    $('.load-more').each(function() {
        if(!$(this).closest('.news').length && !$(this).closest('.globalnav').length) {
            ($(this).parent()).append("<span class='delete-one-row'></span>");
        }
    });


    //delete items from shop
    $('.delete-one-row').on('click', function(event) {
        event.preventDefault();
        var $this = $(this),
            weDidRemove = 0,
            leftItems = +(/\/[0-9]+/).exec($this.prev('.load-more').text())[0].replace('/', '');
        if($this.parent().prev('.shop-row').length) {
            $this.parent().prev('.shop-row').remove();
            weDidRemove = 4;
        } else if($this.parent().prev('.shop-table').length) {
            var tableRows = $this.parent().prev('.shop-table').find('tr');
            var countRows = tableRows.length;
            while(countRows>(tableRows.length-4) && countRows>=1) {
                tableRows.eq(countRows-1).remove();
                weDidRemove++;
                countRows --;
            }
        }
        $this.prev('.load-more').html('Load more 4/'+ (leftItems + weDidRemove));
    });


    //datepicker on popup
    $('#date-pick1, #date-pick2').datepicker({
        dateFormat: "dd-mm-yy",
        showOtherMonths: true,
        beforeShow: function(input, inst) {
            console.log(inst);
            inst.dpDiv.addClass('custom1');
        }
    });
    $('body').on('click', '#date-pick1, #date-pick2', function() {
        $('#ui-datepicker-div').appendTo($(this).parent());
        $(this).toggleClass('active');
    });



    $('.filtering').on('click', function(event) {
        event.preventDefault();
        $(this).next('.second-menu').toggleClass('active');
    });


    //visible input of promo-code on event click order-promocode
    $('.order-promocode').on('click', function(event) {
        event.preventDefault();
        $(this).hide().next('.cover-promo').show();
    });


    $('.how-it-work-button').on('click', function(event) {
        event.preventDefault();
        $('.how-it-works').slideToggle();
    });


    //INIT POPUP IF DIDNT CHOOSE ALL PARAMETERS OF PRODUCT
    $('.btn-add-inner').parent('button').on('click', function() {
        console.log('dgyguysfufgyfgyfdggyugyogoy');
        var choseType = $(this).closest('.stuff-inner').find('input:radio:checked').length,
            choseColor = $(this).closest('.stuff-inner').find('.stuff-option').not('.stuff-weight').find('option:selected').val();
        if(!choseType || !choseColor) {
            if(!choseType) {
                $('.type-of-product').css({'display': 'block'});
            } else {
                $('.type-of-product').css({'display': 'none'});
            }
            if(!choseColor) {
                $('.color-of-product').css({'display': 'block'});
            } else {
                $('.color-of-product').css({'display': 'none'});
            }
            console.log('kjygkuyg');
            $('#error-add-to-cart').modal();
        }
    });


    //ADD INFO FROM CHOSE PREORDER-BOX TO PREORDER POPUP
    $('.preorder-button').on('click', function() {
        $('#product .preorder-name').val($(this).closest('.js-tabs').find('.js-tab-trigger.active').text());
        $('#product .total').text($(this).closest('.kg-item-inner').find('.kg-sum').text());
        var choseWeight = $(this).closest('.kg-item').find('.preorder-weight').text(),
            optionsWeight = $('#product .order-select option');
        optionsWeight.removeAttr('selected');
        optionsWeight.each(function() {
            if($(this).val() == choseWeight) {
                $(this).attr('selected', true);
                $('#product .order-select').trigger('refresh');
                return;
            }
        });
    });


    //TRIGGER ICON SEARCH
    $('.icon-search').on('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        $(this).toggleClass('active');
    });
    $('.general-search').on('click', function(event) {
        event.stopPropagation();
        return false;
    });


    $('.modal-confirm .cover-upload input').on('change', function() {
        console.log('ghukh');
        $(this).parent().parent().next('.state-upload').text($(this).val());
    });


    $('.change-color-order, .change-weight-order').styler();
    $('.custom-checkbox').styler();


    //alignment modal windows
    //function alignmentModal() {
    //    $('[data-toggle]').on('click', function() {
    //
    //        console.log($(window));
    //        var windowWidth = $(window).width();
    //        if($(window).width() > 980) {
    //            var windowWidth = $(window).width();
    //        } else {
    //            var windowWidth = $('html').width();
    //        }
    //        var thisPopup = $($(this).attr('data-target')).find('.modal-dialog'),
    //            thisWidth = thisPopup.width(),
    //            bodyWidth = $('body').width(),
    //            windowY = window.screenX,
    //            thisLeft = (windowWidth - thisWidth) / 2;
    //        alert(windowY+'   '+windowWidth+'   '+ bodyWidth +'  '+thisWidth+'   '+thisLeft);
    //        thisPopup.css({'left': thisLeft});
    //    });
    //}
    //alignmentModal();
    //$(window).on('resize',alignmentModal);


    //function show password on click
    $('body').on('click', '.eye-pass', function() {
        if($(this).prev().attr('type') == 'password') {
            $(this).prev().attr({'type':'text'});
        } else {
            $(this).prev().attr({'type':'password'});
        }
    });


    //hide dots of slick slider in product page
    $('.similar-items .stuff').on('mouseover', function() {
        $(this).closest('.similar-items').find('.slick-dots').hide();
    });
    $('.similar-items .stuff').on('mouseout', function() {
        $(this).closest('.similar-items').find('.slick-dots').show();
    });


    //disable button .btn-gray
    $('.btn-gray').on('click', function(e) {
        e.preventDefault();
    });
});