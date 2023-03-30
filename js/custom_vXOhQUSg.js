/* Getting Started  (#2) */

  $(function(){
  	// more settings: https://github.com/mattboldt/typed.js/#customization
    $(".typed").typed({
      strings: ["Blockchain", "DeFi", "Multichain"],
      typeSpeed: 50,
      backDelay: 2500,
      loop: true,
      shuffle: false
    });
  });


/* What We Do (#3) */

$(function(){
  window.swiper105 = new Swiper('.swiper-105', {
    slidesPerView: 'auto', 
    spaceBetween: 20,
    /*autoplay: {
      delay: 5000,
      disableOnInteraction: true, 
    }*/
  });
});

/* Board Info (#4) */

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