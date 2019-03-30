$(document).ready(function () {

  // Resize sticky header
  $(window).scroll(function() {
    if ($(this).scrollTop() > 250) {
      $('header').addClass("sticky");
    } else {
      $('header').removeClass("sticky");
    }

    if ($(this).scrollTop() > 500) {
      $('.totop').addClass("uk-animation-slide-bottom");
    } else {
      $('.totop').removeClass("uk-animation-slide-bottom");
    }
  });
});
