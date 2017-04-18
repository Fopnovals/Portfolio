$(document).ready(function(){

  setTimeout(function() {
    $('.sidebar, .content, .content__addit, .content__addit_gray').css('transition','0.4s');
  },400);


  var statusSidebar = localStorage.getItem("sidebar");


  //In mobile version the sidebar is always closed
  if($(window).width() <= 640) {
    statusSidebar = 'sidebar_close';
  }


  var $this = null;



  $('.sidebar__item').each(function(i,el) {
    if($(el).hasClass('active') && $(el).next('.dropdown').length && statusSidebar === 'sidebar_open') {
      $(el).next('.dropdown').show();
    }
    if(!$(el).next('.dropdown').length) {
      $(el).addClass('not-arrow');
    }
  });



  function heightSidebars () {
    if($(window).outerHeight() < $('body').outerHeight()) {
      $('.sidebar').outerHeight($('.wrapper').outerHeight()-$('.header').outerHeight());
    }
    else {
      $('.sidebar').outerHeight($(window).outerHeight());
      $('body').outerHeight($(window).outerHeight());
    }
  }
  window.addEventListener('load', heightSidebars);
  window.addEventListener('resize', heightSidebars);


//check the availability of the right sidebar
  if($('.content__addit_gray').length) {
    $('.content').addClass('second-page');
  } else {
    $('.content__main').css('width','64%');
  }


// sidebar__nav
  $('.sidebar__item').on('click', function(event) {
    event.stopPropagation();

    localStorage.setItem('sidebar', $('body').attr('class'));

    $this = $(this);

    if($this.next('.dropdown').length) {
      if($this.hasClass('opened-submenu')) {
        $this.removeClass('opened-submenu');
        $this.next('.dropdown').hide();
      } else {
        $('.dropdown').hide();
        $('.sidebar__item').removeClass('opened-submenu');
        $this.addClass('opened-submenu');
        $this.next('.dropdown').show();
      }
    }
  });



  $('.sidebar__title').on('click', function(event) {
    event.stopPropagation();

    $this = $(this).parent();

    if(!$this.next('.dropdown').length) {
      return;
    }

    if($('body').hasClass('sidebar_close')) {
      $('body').removeClass('sidebar_close').addClass('sidebar_open');

      localStorage.setItem('sidebar', 'sidebar_open');

      setTimeout(function() {
        $this.addClass('opened-submenu');
        $this.next('.dropdown').show();
      },200);
    } else {
      $('.dropdown').hide();
      setTimeout(function() {
        $('body').removeClass('sidebar_open').addClass('sidebar_close');
        $('.sidebar__item').removeClass('opened-submenu');
        localStorage.setItem('sidebar', 'sidebar_close');
      },200);
    }

    setTimeout(function() {
      heightSidebars();
    },400);
  });


// scrollbar 
//$(".dropdown").mCustomScrollbar({
//    theme:"dark",
//    axis:"y"
//});

// selects
$(".js-select").select2();

// select form send
$(".form-send .js-select").select2({
    placeholder: "Выберите компанию"
  });


// sidebar
  (function() {
    var $body = document.body;

    if($(window).width() > 640) {
      if(localStorage.getItem('sidebar') == null) {
        $('body').addClass('sidebar_open');
        if($(window).outerWidth() < 1100) {
          $('body').removeClass('sidebar_open').addClass('sidebar_close');
        }
      } else {
        $('body').addClass(localStorage.getItem('sidebar'));
      }
    } else {
      $('body').removeClass('sidebar_open').addClass('sidebar_close');
    }



      $('.show-menu').on('click', function() {
        $body.className = ( $body.className == 'sidebar_open' )? 'sidebar_close' : 'sidebar_open';
        localStorage.setItem('sidebar', $body.className);

          if($('body').hasClass('sidebar_close')) {
            $('.dropdown').hide();
          } else {
            $('.sidebar__item').each(function(i,el){
              if($(el).hasClass('opened-submenu') || $(el).hasClass('active')) {
                setTimeout(function() {
                  $(el).next('.dropdown').show();
                },300);
              }
            });
          }




        setTimeout(function() {
          if($(window).outerHeight() < $('body').outerHeight()) {
            $('.sidebar').outerHeight($('.wrapper').outerHeight()-$('.header').outerHeight());
          }
          else {
            $('.sidebar').outerHeight($(window).outerHeight());
            $('body').outerHeight($(window).outerHeight());
          }
        },400);

      });


  }).call(this);




  $('.logout, .logo').on('click', function() {
    localStorage.clear();
  });
}); // end jquery



/*!
 * iOS doesn't respect the meta viewport tag inside a frame
 * add a link to the debug view (for demo purposes only)
 */
if (/(iPhone|iPad|iPod)/gi.test(navigator.userAgent) && window.location.pathname.indexOf('/full') > -1) {
  var p = document.createElement('p');
  p.innerHTML = '<a target="_blank" href="http://s.codepen.io/dbushell/debug/wGaamR"><b>Click here to view this demo properly on iOS devices (remove the top frame)</b></a>';
  document.body.insertBefore(p, document.body.querySelector('h1'));
}