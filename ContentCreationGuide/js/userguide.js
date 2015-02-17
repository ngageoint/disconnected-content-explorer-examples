(function() {
  $(window).scroll(function() {
    var oVal;
    oVal = $(window).scrollTop() / 250;
    return $(".blur").css("opacity", oVal);
  });

  var mySwiper = $('.swiper-container').swiper({
    //Your options here:
    mode:'horizontal',
    loop: true,
    grabCursor: true,
    pagination: '.pagination'
  });


  $(".twentytwenty-container[data-orientation!='vertical']").twentytwenty({default_offset_pct: 0.5});

  new WOW().init();

}).call(this);