/* board info (#2) */

$(function(){
  $(document).ready(function(){
    window.slick104 = $('.slider-104').each(function(){
      $(this).slick({ 
        asNavFor: '.slider-104-controller',
        dots: false,
        arrows: false,
        slidesToShow: 2,
        slidesToScroll: 1,
        centerMode: true,        
        variableWidth: true,
        infinite: true,
        speed: 500,
        touchThreshold: 1/0,
        swipeToSlide: true,
      });
    });
    window.slick104controller = $('.slider-104-controller').each(function(){
      $(this).slick({ 
        asNavFor: '.slider-104',
        dots: false,
        arrows: true,
        prevArrow: $(this).prev("li").find(".slick-prev"),
        nextArrow: $(this).next("li").find(".slick-next"),
        infinite: true,
        fade: true,
        speed: 300,
        slidesToShow: 1, 
        slidesToScroll: 1    
      });
    });   
  });
});