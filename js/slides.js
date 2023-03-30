// @codekit-prepend "plugins.js";
/*

   _____ _       _                 _  _____
  / ___/| (*)   | |               | |/ ___/  v 6.1.1
 | (___ | |_  __| | ___ ____      | | (___
  \___ \| | |/ _` |/ _ / __/  _   | |\___ \
  ____) | | | (_| |  __\__ \ | |__| |____) |
 /_____/|_|_|\__,_|\___/___/  \____//_____/


This file contains scripts required for the proper functionality and display
of your Slides Project. It also requires plugins.js and jquery-3.6.0 to run this script properly.

https://designmodo.com/slides/

*/

window.debug = 0;

window.inAction = 1;
window.allowSlide = 1;
window.blockScroll = 1;
window.effectOffset = 500;
window.effectSpeed = 1000;
window.slideSpeed = 1000;
window.cleanupDelay = 1400;
window.horizontalMode = 0;
window.sidebarShown = 0;
window.loadingProgress = 0;
window.smoothScroll = 0;
window.stickyScroll = 0;
window.stickyScrollEffectSpeed = 500;
window.scrollSpeed = 500;
window.preload = 1;
window.setHashLink = 1;
window.hideSidebarOnBodyClick = 1;
window.collectScrolls = 0;
window.sliderStatus = 0;
window.minScrollToSlide = 200; // scroll sensitivity for slide change. The larger value will force user to make larger motion on touchpad / scroll more mousewheel steps.
window.minSwipeToSlide = 4;
window.enableMobileZoom = 0;
window.hideOnScrollSensitivity = 100;
window.allowParallaxOnMobile = 1;
window.hidePopupOnBodyClick = 1;
window.disableKeyNavigation = 0;

var $html = $('html');
var $body = $('body');

var navParent = $('.navigation');
var navigation = $(navParent).find('ul');
var slidesNumber = $('.slide:not(.exclude)').length;

/***
 *     Some globally accessible functions (you can call them at any time)
 */

// Init Slides script
function runTheCode(){
  if(window.debug) console.log("%c runTheCode()","color:GreenYellow");
  $html.addClass('page-loaded');
  window.inAction = 0;
  window.blockScroll = 0;
  window.loaded = 1;

  setTimeout(function(){
    if (window.isScroll){
      updateScroll();
      updateNavigation();
    } 
    if (window.isMobile && window.isSimplifiedMobile){
      $('.slide').addClass('selected animate active');
      updateScroll();
      updateNavigation();
    } else {
      showSlide(window.stage);
    }
  },500);
}

//Check hash on start
function updateHash(){
  var hashLink = window.location.href.split("#")[1];
  if (hashLink) {
    //find a slide
    if ( $('.slide[data-name="' +hashLink+ '"]').length > 0 ){
      //asking for the slide?
      var requestedElement = $('.slide[data-name="' +hashLink+ '"]');

      //scroll to a desired slide
      if ( (window.isMobile && window.isSimplifiedMobile) || window.isScroll ){
        //scroll mode
        if (requestedElement.length) {
          if (!window.preload || window.loaded) {
                var requestedElementPos = requestedElement.position().top;
                $('html,body').stop().clearQueue().animate({scrollTop:requestedElementPos},window.effectSpeed,function(){
                  // if some more content was loaded and it affected page height - scroll once again to the desired element.
                  if(requestedElementPos != requestedElement.position().top){
                    if(window.loaded==1){
                        $('html,body').stop().clearQueue().animate({scrollTop:requestedElement.position().top},window.effectSpeed);
                    }else{
                      $(window).on('load', function(){
                        $('html,body').stop().clearQueue().animate({scrollTop:requestedElement.position().top},window.effectSpeed);
                      });
                    }
                  }
                });
          } else {
            $(window).on('load', function(){
              $('html,body').stop().clearQueue().animate({scrollTop:requestedElement.position().top},window.effectSpeed);
            });
          }
        }
      } else {
        //slide mode
        window.stage = $('.slide').index(requestedElement) + 1;
        showSlide(window.stage);
      }
    }
    // Debug mode on
    if(hashLink.indexOf("slidesDebug")!=-1){
      window.debug=1;
    }
  }
  if(window.debug) console.log("%c updateHash()","color:Lime");
}

// Show slide X
function showSlide(requested){

  requested = parseInt(requested);

  if(window.debug) console.log("%c showSlide("+requested+")","color:LimeGreen");

  if ( window.isMobile && window.isSimplifiedMobile || window.isScroll ){
    return;
  }

  updateNavigation();

  var newSlide = $('.slide').eq(requested - 1),
      currenSlide = $('.slide.selected'),
      currenSlideIndex = currenSlide.index('.slide') + 1;

  //cleanup
  hideDropdown();
  unzoomImage();
  hideSidebar();
  window.allowSlide = 1;

  //reset
  $body.removeClass('sidebarShown lastSlide firstSlide hidePanel-top hidePanel-bottom');

  //It it first or last stage?
  if (window.setStageClasses != 0) {
    if (window.stage === 1){
      $body.addClass('firstSlide');
    }
    if ((window.stages === window.stage)&&(window.stages !== 1)) {
      $body.addClass('lastSlide');
    }

    $body.removeClassByPrefix("stage-").addClass('stage-'+window.stage);
  }


  //white slide?
  if ( newSlide.hasClass('whiteSlide') ){
    $body.addClass('whiteSlide');
  } else {
    $body.removeClass('whiteSlide');
  }

  //prepare slides for transporting
  if (currenSlideIndex !== requested && window.setStageClasses != 0){
    currenSlide.removeClass('selected').addClass('active');
    newSlide.removeClass('before after').addClass('selected active');

    //set order
    newSlide.prevAll('.slide').addClass('before').removeClass('after');
    newSlide.nextAll('.slide').addClass('after').removeClass('before');

    //set a trigger
    $(window).trigger("slideChange", [parseInt(requested), newSlide]);
  }

  //set hash
  if (window.setHashLink){
    if (newSlide.attr('data-name') || newSlide.attr('id')) {
      window.location.hash = (newSlide.attr('data-name')) ? newSlide.attr('data-name') : newSlide.attr('id');
    } else if ((window.location.toString().indexOf('#')>0)&&(location.protocol !== "file:")&&(location.href.split('#')[0])){
      if (history.pushState) {
        window.history.pushState("", "", location.href.split('#')[0]);
      } else {
        window.location.hash = "";
      }
    }
  }

  //prepare to show slide
  newSlide.find('.content, .container').scrollTop(0);

  if (window.loaded){
    //wait for animation
    window.blockScroll = 1;

    setTimeout(function(){
      if (currenSlideIndex !== requested){
        if (window.animationLoop === 0) {
          currenSlide.removeClass('active');
        } else {
          currenSlide.removeClass('active animate');
        }
      }

      //avoid accident scrolls
      window.blockScroll = 0;
    },window.effectSpeed);

    if (window.effectOffset > window.slideSpeed) { window.effectOffset = window.slideSpeed; }

    setTimeout(function(){
      newSlide.addClass('animate');
    },window.slideSpeed - window.effectOffset);


    //clear element animation on done
    if (window.animationLoop != 0) {
      $('.done').removeClass('done');      
    }

    $(".slide.selected [class*='ae-']").one('webkitTransitionEnd oTransitionEnd msTransitionEnd transitionend', function(){
      var $this = $(this);
      setTimeout(function(){ $this.addClass("done"); },window.effectOffset);
    });
  }
  //end showSlide();
}

// Change slide
function changeSlide(n){
  if(window.debug) console.log("%c changeSlide("+n+")","color:PaleGreen");
  if (n === "increase"){
    if ((window.stage + 1) >= window.stages){
      n = window.stages;
    } else {
      n = window.stage + 1;
    }
  } else if (n === "decrease"){
    if ((window.stage - 1) < 1){
      n = 1;
    } else {
      n = window.stage - 1;
    }
  }

  if ( window.isMobile && window.isSimplifiedMobile || window.isScroll ){
    window.stage = n;
    var requestedElement = $('.slide:eq('+ (window.stage - 1) +')'),
        finalPosition = $(requestedElement).offset().top;

    $('html,body').stop().clearQueue().animate({scrollTop:finalPosition},window.effectSpeed);
  } else {
    if ((n !== window.stage)&&( n <= window.stages)){
      if (window.inAction !== 1){
        window.inAction = 1;
        window.stage = n;

        var delay = 0;
        if ($('.zoom-overlay-open').length > 0) {
          unzoomImage();
          delay = 550;
        }

        setTimeout(function(){
          window.stage = n;
          showSlide(window.stage);
          setTimeout(function(){ window.inAction = 0; }, window.slideSpeed);
        }, delay);
      }
    }
  }

  //stop iframe autoplay
  $("iframe.autoplay").each(function(){
    var iframeSrc = $(this).attr('src').replace("?autoplay=1","?").replace("&autoplay=1","");
    $(this).attr('src', iframeSrc);
  });

  //stop videos
  $("video.autoplay").each(function(){
    $(this)[0].pause();
    $(this)[0].currentTime = 0;
  });
};

// Hide share with delay
var hideDropdownOnScrollDelay = 0;
function updateScroll(){
  if(window.debug) console.log("%c updateScroll()","color:LightGreen");
  // Hide dropdown
  hideDropdownOnScrollDelay++;
  if (hideDropdownOnScrollDelay >= 2){
    hideDropdown();
    hideDropdownOnScrollDelay = 0;
  }

  $('.slide').each(function(index, element) {

    var $element = $(element),
        elementIndex = $element.index('.slide'),
        scrollTop = $(document).scrollTop(),
        positionY = $element.offset().top,
        elementHeight = $element.height(),
        halfWay = (window.windowHeight/2 > elementHeight) ? elementHeight/2 : window.windowHeight/2,
        halfOnScreen = ((positionY < (window.windowHeight + scrollTop - halfWay)) && (positionY > (scrollTop - elementHeight + halfWay))),
        scale = (((scrollTop + window.windowHeight) - positionY) / (window.windowHeight + elementHeight) - 0.5) * 2,
        allowToSelect = true;

    // checking first slide
    if (scrollTop === 0) {
      if (index === 0) {
        allowToSelect = true;
      } else {
        allowToSelect = false;
      }
    }

    //checking last slide
    if (scrollTop + window.windowHeight === window.documentHeight) {
      if (index === window.stages - 1) {
        allowToSelect = true;
      } else {
        allowToSelect = false;
      }
    }

    if (window.setStageClasses != 0) {
      if (halfOnScreen && allowToSelect) {
        //set order

        $element.prevAll('.slide').addClass('before').removeClass('after');
        $element.nextAll('.slide').addClass('after').removeClass('before');
        $element.addClass('selected animate active').removeClass('after before');

        if ((window.stage !== elementIndex + 1) || !window.firstTimeTrigger){
          window.stage = elementIndex + 1;

          //set a trigger
          $(window).trigger("slideChange", [window.stage, $element]);

          if (window.stage === 1){
            $body.addClass('firstSlide');
          } else {
            $body.removeClass('firstSlide');
          }

          if (window.stages === window.stage) {
            $body.addClass('lastSlide');
          } else {
            $body.removeClass('lastSlide');
          }
          $body.removeClassByPrefix("stage-").addClass('stage-'+window.stage);

          //white slide?
          if ($element.hasClass('whiteSlide')){
            $body.addClass('whiteSlide');
          } else {
            $body.removeClass('whiteSlide');
          }

          if (window.isAnimated == "auto") {
            //clearTimeout(window.clearElementAnimation);
            window.clearElementAnimation = setTimeout(function(){
              $element.find("[class*='ae-']").addClass('done');
            }, window.effectSpeed + window.cleanupDelay);
          }
        }

        if (!window.firstTimeTrigger){
          window.firstTimeTrigger = 1;
          $(window).trigger("slideChange", [window.stage, $element]);
        }

      } else {
        $element.removeClass('selected');
      }

      updateNavigation();
    }

    //Parallax background
    if (!window.isMobile || window.isMobile && window.allowParallaxOnMobile) {
      if ((scale > -1 && scale < 1)) {

        if ($element.hasClass('parallax') || $element.find('.parallax-element')){

          $element.find('.parallax-element').each(function() {
            var $el = $(this),
                velocity = parseInt($el.data('parallax-velocity')) ? parseInt($el.data('parallax-velocity')) : 50,
                precentage =  scale * velocity;

            if (velocity > 100) velocity = 100;
            $el.css('-webkit-transform',"translate3d(0, " + precentage + "%, 0)").css('transform',"translate3d(0, " + precentage + "%, 0)");
          });
        }
      }
    }
  });

  //Animate elements on Scroll
  if (window.isAnimated == "animateOnEvent") {

    if (!window.preload) {
      $("[class*='ae-']:not(.done):not(.do)").each(function(i, element) {
        var $ae = $(element);
        if (isElementInView($ae)) {
          $ae.addClass("do").one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(){
            $(this).removeClass("do").addClass("done");
          });
        } else {
          if (window.animationLoop == 1) {
            if (!isElementInView($ae)) {
              $ae.removeClass('done do');
            }
          }
        }
      });
    } else if (window.loaded){
      $("[class*='ae-']").each(function(i, element) {
        var $ae = $(element);
        if (isElementInView($ae)) {
          $ae.addClass("do").one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(){
            $(this).removeClassByPrefix('ae-').removeClass("do").addClass("done");
          });
        }
      });
    }
  }
}

function isElementInView(element) {
  if(window.debug) console.log("%c isElementInView()","color:MediumSpringGreen");
  if(window.debug) console.dir(element);
  var pageTop = $(window).scrollTop(),
      $element = $(element),
      elementHeight = $element.height(),
      pageBottom = pageTop + window.windowHeight,
      elementTop = $element.offset().top,
      elementBottom = elementTop + elementHeight;

  if (elementHeight >= window.windowHeight/5) {
    return (pageBottom >= elementTop + elementHeight/5);
  } else {
    return ((pageTop < elementTop) && (pageBottom > elementBottom));
  }
}

//Update Navigation
function updateNavigation(){
  if(window.debug) console.log("%c updateNavigation()","color:SeaGreen");
  setTimeout(function(){
    if ( $(navigation).length > 0 ){
      $(navigation).each(function(index, element) {
        $(element).find('li.selected').removeClass('selected');

        var $selectedSlide = $('.slide.selected'),
            parentSlide = parseInt($selectedSlide.data('parent-slide-id')),
            selectedIndex = $selectedSlide.index('.slide:not(.exclude)');

        if (selectedIndex !== -1) {
          $(element).find('li').eq(selectedIndex).addClass('selected');
        } else if (parentSlide) {
          selectedIndex  = $('.slide[data-slide-id="'+ parentSlide +'"]').index('.slide:not(.exclude)');
          $(element).find('li').eq(selectedIndex).addClass('selected');
        }
      });
    }
  },100);
}

// show progress bar at the top of a window
function updateProgressBar(){
  if(window.debug) console.log("%c updateProgressBar()","color:DarkGreen");
  //loading
  var progress = window.loadingProgress/window.images;

  // animate
  window.progressBar.css('width',progress * 100 + "%");

  if (window.loadingProgress == window.images) {
    window.progressBar.addClass('loaded');
  }
}

//zoom out image
function unzoomImage(type){
  if(window.debug) console.log("%c unzoomImage()","color:YellowGreen");
  if ($('.zoom-overlay-open').length > 0){
    $('.zoom-img').click();

    if (type) {
      $('.zoom-img-wrap, .zoom-overlay').remove();
    }
  }
}

// Show Sidebar
function showSidebar(id){
  if(window.debug) console.log("%c showSidebar("+id+")","color:OliveDrab");
  var sidebarID = id,
      element = $('.sidebar[data-sidebar-id="' + sidebarID + '"]'),
      isAnimated = $(element).hasClass('animated');

  if (!window.sidebarShown){
    if (element.length > 0) {
      window.sidebarShown = 1;
      window.allowSlide = 0;
      $(element).removeClass('animate active').addClass('visible');
      $html.addClass('sidebarShown sidebar_' + sidebarID);
      $(element).find('.content').scrollTop(0);

      if (isAnimated){
        clearTimeout(window.removeAnimationTimeout);
        setTimeout(function(){
          $(element).addClass('animate active');
        },100);
      }
      $(window).trigger('sidebarShown',[sidebarID]);
    }
  } else {
    hideSidebar();
  }

  //clean up
  hideDropdown();
}

// Hide Sidebar
function hideSidebar(){
  if(window.debug) console.log("%c hideSidebar()","color:DarkOliveGreen");
  if (window.sidebarShown){
    $html.removeClass('sidebarShown').removeClassByPrefix('sidebar_');
    var $sidebar = $('.sidebar.visible');
    $sidebar.removeClass('visible');

    window.removeAnimationTimeout = setTimeout(function(){
      $sidebar.removeClass('animate active').find('.done').removeClass('done');
    },500);
    window.sidebarShown = 0;
    window.allowSlide = 1;
    $(window).trigger('sidebarHidden');
  }
}

// Show popup
function showPopup(id, focusOn){
  if(window.debug) console.log("%c showPopup("+id+","+focusOn+")","color:MediumAquamarine");
  var popupID = id,
      focusOnID = focusOn,
      element = $('.popup[data-popup-id="' + popupID + '"]'),
      isAnimated = element.hasClass('animated');

  if (element.length > 0) {
    hideSidebar();
    $(element).addClass('visible');

    //set a trigger
    $(window).trigger('popupShown',[id]);

    function animatePopup() {
      if(window.debug) console.log("%c animatePopup()","color:DarkSeaGreen");
      var dfd = jQuery.Deferred();
      if (isAnimated){
        setTimeout(function(){
          $(element).addClass('animate active');

          clearTimeout(window.clearPopupElementAnimation);
          window.clearPopupElementAnimation = setTimeout(function(){
            $(element).find("[class*='ae-']").addClass('done');
            dfd.resolve( "done" );
          }, window.effectSpeed + window.cleanupDelay);
        },100);
      }else{
        dfd.resolve( "done" );
      }
      return dfd.promise();
    }
     
    $.when( animatePopup() ).then(
      function( status ) { // done
        if(focusOnID){
          $(element).find("#"+focusOnID).focus();
        }
      },
      function( status ) { }, // fail
      function( status ) { } // progress
    );

    $html.addClass('popupShown popup_' + popupID);
    $(element).find('.content').scrollTop(0);
    window.allowSlide = 0;

    //Add Popup ID in the stack
    if (!window.popupShown) window.popupShown = [];
    window.popupShown.push(popupID);

    //Autoplay Iframe, replace data-src to src
    var $element = $(element),
        iframes = $element.find('iframe'),
        HTML5videos = $element.find('video');
    if ( iframes.length > 0  ) {
      iframes.each(function(){
        var iframe = $(this),
            iframeSrc = iframe.attr('src') ? iframe.attr('src') : iframe.data('src'),
            symbol = (iframeSrc.indexOf('?') > -1) ? "&" : "?";

        if ($(element).hasClass('autoplay') || iframe.hasClass("autoplay") && iframe.closest(".slider li.selected").length){
            iframe.attr("allow","autoplay");
            iframe.attr('src',iframeSrc + symbol + "autoplay=1");
        }else{
          if(!iframe.attr('src')){
            iframe.attr('src',iframeSrc);
          }
        }
      });
    } 
    if (HTML5videos.length > 0){
      HTML5videos.each(function(){
        var video = $(this);
        if(video.find("source[data-src]").length > 0){
          video.find("source").each(function(){
            if(!$(this).attr('src')){
              $(this).attr('src',$(this).data('src'));
            }
          });
          video[0].load();
        }
        if ($(element).hasClass('autoplay') || video.hasClass("autoplay") && video.closest(".slider li.selected").length){
          video[0].play();
        }
      });
    }
  }

  //clean up
  hideDropdown();
}

// Hide popup
function hidePopup(popupID) {
  popupID = typeof popupID !== 'undefined' ? popupID : false;
  if(window.debug) console.log("%c hidePopup("+popupID+")","color:LightSeaGreen");

  if ( $.isArray(window.popupShown) ){

    var popupToHide = popupID ? popupID : window.popupShown.slice(-1)[0],
        $element = $('.popup.visible[data-popup-id="' + popupToHide + '"]'),
        iframe = $element.find('iframe[src]'),
        video = $element.find('video');

    //stop iframe autoplay
    if (iframe.length > 0 && ($element.hasClass('autoplay') || $element.find('iframe.autoplay').length)) {
      $(iframe).each(function(n, element){
        var iframeSrc = $(element).attr('src').replace("?autoplay=1","?").replace("&autoplay=1","");
        $(element).attr('src', iframeSrc);
      });
    }

    //stop videos
    if (video.length > 0) {
      $(video).each(function(n, element){
        $(element)[0].pause();
        $(element)[0].currentTime = 0;
      });
    }

    //clear element animation on done
    clearTimeout(window.clearPopupElementAnimation);
    $element.addClass('hidePopup');
    $(window).trigger('popupHidden', [popupID]);

    setTimeout(function(){
      window.allowSlide = 1;

      $element.removeClass('visible animate active hidePopup').removeAttr('style').find('.done').removeClass('done');
      $html.removeClass('popup_' + popupToHide);

      //remove last shown id
      if($.isArray(window.popupShown)) {
        var i = window.popupShown.indexOf(popupToHide);
        if(i != -1) {
          window.popupShown.splice(i, 1);
        }
      }

      if (window.popupShown.length <= 0) {
        $html.removeClass('popupShown');
        window.popupShown = false;
      }
    }, 500);
  }
}

// Set equal height for elements inside the flex container
function equalizeElements(){
  if(window.debug) console.log("%c equalizeElements()","color:Teal");
  var gridEl = $('.grid.equal, .flex.equal');
  if (gridEl.length) {
    $(gridEl).each(function(index, element) {

      var screenWidth = window.windowWidth,
          collapseWidth = ($(element).hasClass('later')) ? 767 : 1024,
          collapseWidth = $(element).data('equal-collapse-width') ? parseInt($(element).data('equal-collapse-width')) : collapseWidth,
          equalElement = $(element).find('.equalElement'),
          equalMobile = $(this).hasClass('equalMobile');

      if ((screenWidth >= collapseWidth)||(equalMobile)){
        var height = 0;

        //fetch max height
        $(equalElement).each(function(index, el) {

          $(el).css('height','auto');

          if (height < $(el).outerHeight()) {
            height = $(el).outerHeight();
          }

        });

        //apply
        $(element).find('.equalElement').each(function(index, el) {
          $(el).css('height', height + "px");
        });
      } else {
        $(equalElement).css("height", "auto");
      }
    });
  }
}

// Shows amount of slides in Slider and current slide number
function sliderCounterController($sliderCounter, nextIndex, $slider){
  if(window.debug) console.log("%c sliderCounterController("+$sliderCounter+","+nextIndex+","+$slider+")","color:PaleTurquoise");
  if ($sliderCounter.length > 0){
    $sliderCounter.each(function(){
      var $sliderCounter = $(this);
      $sliderCounter.find(".now").text(nextIndex+1);
      $sliderCounter.find(".total").text($slider.children("li").length);
    });
  }
}

// stop playing videos in slider and start playing it in chosen slide if autoplay is set
function sliderStopAndPlayVideos($slider,clickOnControl){
  if(window.debug) console.log("%c sliderStopAndPlayVideos("+$slider+","+clickOnControl+")","color:Aquamarine");
  $slider.find('>li iframe').each(function(){
    var iframeSrc = $(this).attr('src');
    if(typeof(iframeSrc)=="string"){
      if(iframeSrc.indexOf("autoplay")!=-1){
        iframeSrc = iframeSrc.replace("?autoplay=1","?").replace("&autoplay=1","");
        $(this).attr('src',iframeSrc);
      }
    }
    iframeSrc = $(this).attr('data-src');
    if(typeof(iframeSrc)=="string"){
      if(iframeSrc.indexOf("autoplay")!=-1){
        iframeSrc = iframeSrc.replace("?autoplay=1","?").replace("&autoplay=1","");
        $(this).attr('data-src',iframeSrc);
      }
    }
  });
  $slider.find('>li video').each(function(){
    $(this)[0].pause();
    $(this)[0].currentTime = 0;
  });
  if($slider.closest(".popup").length==0 || clickOnControl){ // if slider is not in popup
    // autoplay video in chosen slide
    var iframe = $slider.find("li.selected iframe.autoplay");
    if ( iframe.length > 0  ) {
        var iframeSrc = iframe.attr('src') ? iframe.attr('src') : iframe.data('src'),
            symbol = (iframeSrc.indexOf('?') > -1) ? "&" : "?";
            if(iframeSrc.indexOf("autoplay")==-1){
              iframe.attr("allow","autoplay");
              iframe.attr('src',iframeSrc + symbol + "autoplay=1");
            }
      }
    var video = $slider.find("li.selected video.autoplay");
    if (video.length > 0){
        if(video.find("source[data-src]").length > 0){
          video.find("source").each(function(){
            if(!$(this).attr('src')){
              $(this).attr('src',$(this).data('src'));
            }
          });
        }
        video[0].load();
        video[0].play();
    }
  }
}

// Show dropdown
function showDropdown($this, $isHover){
  $isHover = typeof $isHover !== 'undefined' ? $isHover : false;
  if(window.debug) console.log("%c showDropdown("+$this+","+$isHover+")","color:Turquoise");
  //show
  var offset = $this.offset(),
      position = $this.position(),
      offsetY = window.popupShown ? Math.ceil(position.top) : Math.ceil(offset.top),
      offsetX = Math.ceil(offset.left),
      dropdownID = $this.data('dropdown-id'),
      $element = $('.dropdown[data-dropdown-id="' + dropdownID + '"]'),
      elementPosition = $this.data('dropdown-position') ? $this.data('dropdown-position') : $element.attr('class'),
      setPosition = $element.data('dropdown-set-position') == false ? false : true,
      elementPosition = elementPosition.split(' '),
      over = false;

  if(typeof(window.dropdownInterval)=="number"){
    clearInterval(window.dropdownInterval);
  }
  
  //hide
  if (!$isHover) {
    if(dropdownID != window.dropdownShown){
      hideDropdown();
    }
  }else{
    over = false;
    $(document).mousemove(function(e){
      if(
        $(e.target).attr("data-dropdown-id")==dropdownID || 
        $(e.target).closest(".dropdownTrigger.hover[data-dropdown-id="+dropdownID+"]").length ||
        $(e.target).closest(".dropdown[data-dropdown-id="+dropdownID+"]").length
      ){
        over = true;
      }else{
        over = false;
      }
    });
    // set interval to check, is mouse over dropdown or it's popup or not
    window.dropdownInterval = setInterval(function(){
      if(!over){
        hideDropdown();
        clearInterval(window.dropdownInterval);
      }
    },300);
  }

  //vertical position
  if ( elementPosition.indexOf('bottom') != -1 ) {
    offsetY = offsetY - $element.outerHeight();
    $element.removeClass('top').addClass('bottom');
  } else {
    offsetY = offsetY + $this.outerHeight();
    $element.removeClass('bottom').addClass('top');
  }

  //horizontal position
  if ( elementPosition.indexOf('right') != -1 ) {
    offsetX = offsetX - $element.outerWidth() + $this.outerWidth();
    $element.removeClass('left center').addClass('right');
  } else if ( elementPosition.indexOf('left') != -1 ) {
    $element.removeClass('right center').addClass('left');
  } else if ( elementPosition.indexOf('center')  != -1 ) {
    offsetX = offsetX - ($element.outerWidth()/2) + ($this.outerWidth()/2);
    $element.removeClass('right left').addClass('center');
  }

  if($element.hasClass("hide") && $element.hasClass("show")){
    $element.removeClass("hide show");
  }
  
  $element.addClass('show');
  $(".dropdownTrigger.active").removeClass('active');
  $this.addClass('active');

  if (setPosition) {
    $element.css('top',offsetY).css('left',offsetX);
  }
  $html.addClass('dropdownShown dropdown_' + dropdownID);
  window.dropdownShown = dropdownID;
  $(window).trigger('dropdownShown',[dropdownID]);
}

// Hides any dropdown
function hideDropdown(id){
  id = typeof id !== 'undefined' ? id : false;
  if(window.debug) console.log("%c hideDropdown()","color:SteelBlue");
  //hide
  if (window.dropdownShown){
    hideDropdownOnScrollDelay = 0;
    window.dropdownShown = false;
    $('.dropdownTrigger.active'+(id?"[data-dropdown-id='"+id+"']":'')).removeClass('active');
    $('.dropdown.show'+(id?"[data-dropdown-id='"+id+"']":'')).addClass('hide').one('webkitTransitionEnd otransitionend msTransitionEnd transitionend', function(){
      $(this).removeClass('show hide');
      $html.removeClass('dropdownShown').removeClassByPrefix('dropdown_');
      //$html.removeClass('dropdownShown').removeClassByPrefix('dropdown_');
    });
    $(window).trigger('dropdownHidden',[id]);
  }
}










//On Window load
$(window).on('load', function(){
  window.loaded = 1;
});

//On DOM ready
$(document).ready(function() { "use strict";
  $body = $('body');

  // Debug mode on
  if($.cookie("slidesDebug")) window.debug=1;

  //add window a trigger
  setTimeout(function(){
    $(window).trigger('ready');
  },1);

  //Redraw
  $body.hide().show(0);

  //Detect mode
  window.isScroll = $body.hasClass('scroll');
  window.isSimplifiedMobile = $body.hasClass('simplifiedMobile');
  if (window.isScroll || window.isSimplifiedMobile && window.isMobile) { $html.addClass('scrollable'); }

  $html.addClass('page-ready');

  //Set speed
  if ($body.hasClass('fast')){
    //fast
    window.slideSpeed = 700;
    window.cleanupDelay = 1200;
    window.effectSpeed = 800;
    window.scrollSpeed = 350;
    window.effectOffset = 400;
  } else if ($body.hasClass('slow')){
    //slow
    window.slideSpeed = 1400;
    window.cleanupDelay = 2000;
    window.effectSpeed = 1400;
    window.scrollSpeed = 800;
    window.effectOffset = 600;
  }

  //How many stages?
  window.stage = 1;
  window.stages = $('.slide').length;

  //Horizonal Mode
  if ($body.hasClass('horizontal')){
    window.horizontalMode = 1;
  }

  //Preload
  if ($body.hasClass('noPreload')){
    window.preload = 0;
  }

  //Is it animated?
  if ($body.hasClass('animated')){
    window.isAnimated = "auto";
  } else if ($body.hasClass('animateOnEvent')) {
    window.isAnimated = "animateOnEvent";
    if (window.isMobile) {
      window.isAnimated = "auto";
      $body.removeClass('animateOnEvent').addClass('animated');
    }
  }

  //Remove animation for Simplified Mobile Option
  if (window.isSimplifiedMobile && window.isMobile) {
    window.isAnimated = false;
    $body.removeClass('animated animateOnEvent');
    $("[class*='ae-']").addClass('done');
  }

  if (!window.isAnimated) {
    window.cleanupDelay = 0;
  }

  //Is scroll hijacked?
  if ($body.hasClass('smoothScroll') && !window.isMobile){
    window.smoothScroll = 1;
  }

  // "Sticky" scroll effect detection
  if ($body.hasClass('stickyScroll')){
    window.stickyScroll = 1;
  }

  updateHash();

  //Listen history changes
  $(window).on('popstate',function(e) {
    setTimeout(function(){
      updateHash();
    },100);
    e.preventDefault();
  });

  //Show Progress Bar
  if (window.preload){
    var imgs = [];
    $("*").each(function() {
      var img_path,
          $img = $(this);

      if( $img.css("background-image") !== "none") {
        img_path = $img.css("background-image").replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, '');
      } else if ($img.is('img')){
        img_path = $img.attr("src");
      }
      // if( !/(linear-|data:).+/.test(img_path) )
      if( img_path && !/(repeating-)?(linear|radial)-gradient.+/.test(img_path) ) {
        imgs.push(img_path);
      }
    });

    window.images = imgs.length;
    window.progressBar = $('.progress-bar');

    //preload images (sort of)
    $.cacheImage(imgs, { complete: function () {
      window.loadingProgress++;
      updateProgressBar();
    }});

    updateProgressBar();
  }

  //Initiate slide
  showSlide(window.stage);

  //On page load
  if (!window.preload || !window.images || window.loaded) {
    runTheCode();
  }

  if (!window.loaded) {
    $(window).on('load', function(){
      runTheCode();
    });
  }







/***
 *       _____ _ _     _         _____ _
 *      / ____| (_)   | |       / ____| |
 *     | (___ | |_  __| | ___  | |    | |__   __ _ _ __   __ _  ___
 *      \___ \| | |/ _` |/ _ \ | |    | '_ \ / _` | '_ \ / _` |/ _ \
 *      ____) | | | (_| |  __/ | |____| | | | (_| | | | | (_| |  __/
 *     |_____/|_|_|\__,_|\___|  \_____|_| |_|\__,_|_| |_|\__, |\___|
 *                                                        __/ |
 *     Slide Appearance Manager                          |___/
 */

  //remove animation from a clickable element
  $(".animated").on("click", "[class*='ae-']:not('.done')", function(){ $(this).addClass('done'); });

  $('.nextSlide').on('click', function(){
    window.changeSlide('increase');
  });

  $('.prevSlide').on('click', function(){
    window.changeSlide('decrease');
  });

  $('.toFirstSlide').on('click', function(){
    window.changeSlide(1);
    if (history.pushState) {
      window.history.pushState("", "", location.href.split('#')[0]);
    } else {
      window.location.hash = "";
    }

    hideSidebar();
  });

  $('.toLastSlide').on('click', function(){
    window.changeSlide(window.stages);
    if (history.pushState) {
      window.history.pushState("", "", location.href.split('#')[0]);
    } else {
      window.location.hash = "";
    }
    hideSidebar();
  });

  $('[class*="toSlide-"]').on('click', function(){
    var num = parseInt($(this).attr('class').split('toSlide-')[1].split(' ')[0]);
    window.changeSlide(num);
    hideSidebar();
  });

  //set
  $(window).on('resize load ready',function(){
    //cleanup after image zoom
    $('[data-action="zoom"]').removeAttr('style');
    if ($('.zoom-overlay').length > 0){
      unzoomImage('fast');
    }

    //common stuff
    window.windowHeight = $(window).height();
    window.windowWidth = $(window).width();
    window.documentHeight = $(document).height();
  });








/***       *
 *         |         |          |
 *               |
 *       _____            *   _ _
 *      / ____|           |  | | |
 *     | (___   ___ _ __ ___ | | |
 *      \___ \ / __| '__/ _ \| | |
 *      ____) | (__| | | (_) | | |
 *     |_____/ \___|_|  \___/|_|_|
 *
 *      Scrolling
 */

  var eventCount = 0,
      eventCountStart;

  // remember start point of a touchmove to calculate touch move distance
  var yDown = null;
  document.addEventListener('touchstart', function(event){
    var firstTouch = event.touches || event.originalEvent.touches;
    yDown = firstTouch[0].clientY; 
  }, false);

//  $('html,body').on('DOMMouseScroll mousewheel scroll', function(event){ // - this is how it was in v.4
//  $('body').on('DOMMouseScroll mousewheel scroll touchend', function(event){ // we need to use new "wheel" event instead of "mousewheel". mousewheel causes "glitching" while scrolling scrollable area on Windows.
  var scrollSupportedEvents = 'scroll mousewheel';
      //scrollSupportedEvents += (typeof document.onwheel!="undefined" && !window.isFirefox) ? ' wheel': ' mousewheel';
      scrollSupportedEvents += (typeof document.onDOMMouseScroll!="undefined") ? ' DOMMouseScroll': '';

  $('body').on(scrollSupportedEvents+' touchend', function(event){
    // count touch move distance
    if(event.type=="touchend"){
      if (!yDown) {return;}                                                                                  
      event.deltaY = -1 * (yDown - event.changedTouches[0].clientY); 
      event.deltaFactor = 1;
      yDown = null;
    }
    var $currentSection = $('.slide.selected .content'),
        deltaY = (event.deltaY) ? event.deltaY : event.originalEvent.wheelDeltaY,
        scrollsize = (event.deltaY) ? Math.ceil(Math.abs(deltaY) * event.deltaFactor) : Math.ceil(Math.abs(deltaY)),
        browserScrollRate = (window.isFirefox) ? 2 : 1,
        OSScrollRate = (window.isWindows) ? browserScrollRate * 2 : browserScrollRate,
        wheelDelta = (event.originalEvent.wheelDelta) ? event.originalEvent.wheelDelta : event.deltaY * event.deltaFactor,
        wheelDelta = (event.wheelDelta) ? event.wheelDelta : wheelDelta, // maybe remove it if there is no event.wheelDelta in DOMMouseScroll scroll touchend
        energy = wheelDelta * browserScrollRate * OSScrollRate,
        scrollDirection = (deltaY >= 0) ? "up" : "down",
        curSecScrolltop = $currentSection.scrollTop(),
        currentSectionHeight = $currentSection.find('.container').outerHeight(),
        deviceZoom = detectZoom.device(),
        minScrollToSlide = (window.isFirefox && window.isWindows) ? 200 : window.minScrollToSlide;

    //console.log(event);
    //console.log(wheelDelta,scrollsize,event.deltaY, event.deltaFactor);
    //console.log(scrollDirection);
    //console.log($currentSection,scrollsize,browserScrollRate,OSScrollRate,wheelDelta,energy,scrollDirection,curSecScrolltop,currentSectionHeight,deviceZoom,minScrollToSlide);

    // Protection from too low minScrollToSlide value. Otherwise scroll inside the slide (overscrolled content scroll) won't work.
    if(event.deltaFactor && minScrollToSlide < event.deltaFactor){
      minScrollToSlide = event.deltaFactor + 1;
    }

    //skip empty events
    if (!scrollsize) return;

    //scroll mode
    if (window.isScroll && ((!window.sidebarShown)&&(!window.popupShown)&&(!window.blockScroll))) {
      //console.log("scroll mode");
      //smooth scroll
      if (window.smoothScroll && !window.isMobile){
        //console.log("smooth scroll mode");
        //lock default scroll
        //event.preventDefault();

        if (energy > 1500) { energy = 1500; }
        if (energy < -1000) { energy = -1500; }

        var scrollObject = $(window),
            scrollTop = scrollObject.scrollTop(),
            finalScroll = scrollTop - energy;

        TweenLite.to(scrollObject, (window.scrollSpeed/1000), {
          scrollTo : { y: finalScroll, autoKill:false },
          ease: Power4.easeOut,
          overwrite: "all"
        });

      } else {
        if (!window.isWindows){
          $currentSection.scrollTop(curSecScrolltop - energy);
        }
      }

    }

    //slide mode
    if ( !window.isScroll && !(window.isMobile && window.isSimplifiedMobile)){
      //console.log("slide mode");
      // scroll oversized content
      if ((currentSectionHeight > window.windowHeight)){
        //console.log("oversized content scroll mode");
        if ((( scrollDirection === "up" ) && ( $currentSection.scrollTop() <= 0 )) || (( scrollDirection === "down" ) && ( $currentSection.scrollTop() + window.windowHeight >= Math.floor(currentSectionHeight / deviceZoom) ))){
          window.allowSlide = 1;
        } else {
          window.allowSlide = 0;
        }
  
        //hide panels on scroll
        if (window.panelsToHide) { // TO DO: Seems like this condition will never be executed (cause no window.panelsToHide definition)
          if (scrollDirection === "down" && $currentSection.scrollTop() > 0) {
            $body.addClass('hidePanel-top');
          } else if (scrollDirection === "up"){
            $body.removeClass('hidePanel-top');
          }

          $body.addClass('hidePanel-bottom');

          if (scrollDirection === "down" && $currentSection.scrollTop() + window.windowHeight >= Math.floor(currentSectionHeight / deviceZoom)) {
            $body.removeClass('hidePanel-bottom');
          } else if (scrollDirection === "up"){
            $body.addClass('hidePanel-bottom');
          }
        }

        if ((!window.sidebarShown)&&(!window.popupShown)&&(!window.blockScroll)) {

          if (window.smoothScroll){
            //lock default scroll
            //event.preventDefault();

            //smooth scroll
            if (energy > 1500) { energy = 1500; }
            if (energy < -1000) { energy = -1500; }

            TweenLite.to($currentSection, 0.5, {
              scrollTo : { y: curSecScrolltop - energy, autoKill:false },
              ease: Power4.easeOut,
              overwrite: 5
            });

          } else {
            if(event.isDefaultPrevented() || event.type == "mousewheel" && !window.isAndroid){
              curSecScrolltop = (scrollDirection === "up") ? curSecScrolltop - scrollsize : curSecScrolltop + scrollsize;
              $currentSection.scrollTop(curSecScrolltop);
            }
          }
        }
      //end scroll oversized content
      }

      if (window.allowSlide && scrollsize) {
        if (scrollDirection == "down") {
          window.collectScrolls = window.collectScrolls + scrollsize;
        } else {
          window.collectScrolls = window.collectScrolls - scrollsize;
        }

        setTimeout(function(){
          window.collectScrolls = 0;
        },200);
      }

      //change slide on medium user scroll
      if ((Math.abs(window.collectScrolls) >= minScrollToSlide) && (window.allowSlide) && (!window.sidebarShown) && (!window.popupShown) && (!window.disableOnScroll)){

        window.collectScrolls = 0;

        //should we even..
        if ((scrollDirection === "down" && window.stage !== window.stages)||(scrollDirection === "up" && window.stage !== 1)){
          //console.log("slide changed");
          //ok let's go
          if (window.inAction !== 1){
            if (scrollDirection === "down"){
              window.changeSlide('increase');
            } else {
              window.changeSlide('decrease');
            }
          }
        }
      }
    }
    //end on mousewheel event
  });

  // "Sticky" scroll
  if (window.stickyScroll){
    var stickySlides, stickyVisibleSlides, stickyScrollTo, scrollTop, scrollBottom;

    $(document).on('scrollstop resizeEnd', function() {
      stickySlides = $('.slide:not(.unstick');
      stickyVisibleSlides = [];
      scrollTop = $(window).scrollTop();
      scrollBottom = scrollTop + $(window).height();
      stickyScrollTo = false;
      var body = document.body,
          html = document.documentElement,
          documentHeight = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

      if(stickySlides.length>0){ // collect slides that are visible on the screen now
        stickySlides.each(function(index,slide){
          slide = $(slide);
          var top = slide.offset().top,
              bottom = top + slide.outerHeight();
          if(top <= scrollBottom && top >= scrollTop || bottom >= scrollTop && bottom <= scrollBottom){
            stickyVisibleSlides.push(slide);
          }
        });        
      }

      if(stickyVisibleSlides.length > 0){ // find the slide which center is now closer to the screen center.
        var screenCenter = scrollTop + $(window).height()/2,
            slideCenter = false,
            diff = Infinity,
            found = stickyVisibleSlides[0];
        $.each(stickyVisibleSlides,function(key,slide){
          slideCenter = (slide.offset().top + slide.offset().top + slide.outerHeight())/2;
          if(Math.abs(screenCenter - slideCenter) < diff){
            diff = Math.abs(screenCenter - slideCenter);
            found = slide;
          }
        });
        // find diff between the slide top/bottom edge and the screen+scroll top/bottom edge.
        var diffTop = Math.abs(scrollTop - found.offset().top),
            diffBottom = Math.abs(scrollBottom - (found.offset().top + found.outerHeight()));
        if(diffTop<diffBottom){ // scroll to the top of a side
          stickyScrollTo = found.offset().top;
        }else{ // scroll so the bottom of a side to match it with the bottom of a screen
          stickyScrollTo = found.offset().top + found.outerHeight() - $(window).height();
        }
      } // else - do nothing, we're in the middle of a long slide which is higher than window height
      
      if(scrollTop<=50){ // fix to be able to reach the first slide
        stickyScrollTo = stickySlides.first().offset().top; // scroll to the top of the first slide on the page
      }

      if(scrollBottom>=documentHeight - 50){ // fix to be able to reach the last slide
        stickyScrollTo = stickySlides.last().offset().top + stickySlides.last().outerHeight(); // scroll to the bottom of the last slide on the page
      }

      // scroll to slide
      if(stickyScrollTo){
        $('html,body').clearQueue().stop().animate({scrollTop: stickyScrollTo}, window.stickyScrollEffectSpeed, function(){
          //done
        }).on('mousedown DOMMouseScroll mousewheel keyup',function(){
          //stop on scroll
          $('html, body').clearQueue().stop();
        });
      }

    });

  }

  //scroll or simplified mobile
  if ( (window.isMobile && window.isSimplifiedMobile) || window.isScroll ){
    $(window).on(scrollSupportedEvents+' touchmove load', function(){
      if (window.updateScroll != 0) updateScroll();
    });
  }










/***
 *       _____
 *      / ____|       (*)
 *     | (_____      ___ _ __   ___
 *      \___ \ \ /\ / / | '_ \ / _ \
 *      ____) \ V  V /| | |_) |  __/
 *     |_____/ \_/\_/ |_| .__/ \___|
 *                      | |
 *                      |_|
 *
 *     Swipes for mobile devices
 */


  $('.mobile .slides:not(.scroll):not(.simplifiedMobile), .slides.desktopSwipe').swipe({
    swipeStatus:function(event, phase, direction, distance){

      window.allowSwipeUp = 1;
      window.allowSwipeDown = 1;

      //set height for current slide
      var $currentSection = $('.slide.selected .content'),
          currentSectionHeight = Math.floor($currentSection.find('.container').outerHeight()),
          next = "up",
          prev = "down",
          minSwipeToSlide = window.minSwipeToSlide,
          windowHeight = window.innerHeight;

      if (window.sidebarShown){
        $currentSection = $('.sidebar .content');
      }

      if (window.popupShown){
        $currentSection = $('.popup .content');
      }

      if (phase === "start") {
        window.scrollTop = $currentSection.scrollTop();
      }

      //horizontal mode
      if (window.horizontalMode){
        next = "left";
        prev = "right";
      }

      //lock slide
      if ( !window.horizontalMode && ( currentSectionHeight > windowHeight) ){
        if (window.scrollTop + windowHeight < currentSectionHeight){
          window.allowSwipeUp = 0;
        }
        if (window.scrollTop > 0) {
          window.allowSwipeDown = 0;
        }
      }

      if (!window.sidebarShown && !window.disableOnSwipe) {
        if (window.horizontalMode){
          if (direction === next && distance > minSwipeToSlide){
            window.changeSlide('increase');
          } else if (direction === prev && distance > minSwipeToSlide){
            window.changeSlide('decrease');
          }
        } else {
          if (direction === next && distance > minSwipeToSlide && window.allowSwipeUp && window.allowSlide){
            window.changeSlide('increase');
          } else if (direction === prev && distance > minSwipeToSlide && window.allowSwipeDown && window.allowSlide){
            window.changeSlide('decrease');
          }
        }
      }
    },
    maxTimeThreshold:0,
    fingers:'all',
    allowPageScroll:"vertical"
  });

  $('.slides.desktopSwipe *').on('click',function(){
    $(this).addClass('selectable');
  });








/***
 *      _____                 _
 *     |  __ \               | |
 *     | |__) |_ _ _ __   ___| |___
 *     |  ___/ _` | '_ \ / _ \ / __|
 *     | |  | (_| | | | |  __/ \__ \
 *     |_|   \__,_|_| |_|\___|_|___/
 *
 *     Responsive Panels
 */

  if($('.panel .compact').length > 0){

    $('.panel .compact').each(function(index, element) {
      var panel = $(element).parents('.panel'),
          desktop = $(panel).find('.desktop'),
          compact = element,
          forceMobileView = $(panel).hasClass('forceMobileView');

      $(window).on('load resize ready',function(){

        if ((window.isMobile || $(document).width() < 767) && forceMobileView) {

          $(desktop).addClass('hidden');
          $(compact).removeClass('hidden');

        } else {

          $(desktop).removeClass('hidden');
          $(compact).addClass('hidden');

          var totalWidth = 0;
          var childrenWidth = 0;

          desktop.children().each(function(){
            childrenWidth = 0;
            $(this).children().each(function(){
              childrenWidth += $(this).outerWidth(true);
            });
            // Add to the total width of a section the max value of the width of the direct child container 
            // (.left, .center, .right, etc.) or it's contents. Includes margins.
            totalWidth += Math.max($(this).outerWidth(true),childrenWidth);
          });
          // if width of space is not enough or we are on mobile
          if ((Math.round(totalWidth) > Math.round($(panel).width()) ) || ((window.isMobile || $("body").width() < 767) && forceMobileView)) {
            $(desktop).addClass('hidden');
            $(compact).removeClass('hidden');
          } else {
            $(desktop).removeClass('hidden');
            $(compact).addClass('hidden');
          }
        }

      });

    });
  }

  //HIDE PANELS ON SCROLL
  if ($('.panel.hideOnScroll').length > 0) {
    window.panelsToHide = true;

    if (window.isScroll || window.isSimplifiedMobile){
      var lastScrollTop,
          i = 0,
          sensitivity = window.hideOnScrollSensitivity ? window.hideOnScrollSensitivity : 100,
          panelToHide = $('.panel.hideOnScroll');

      //hide if height larger than screen size
      $(window).on('mousewheel', function(event) {
        var scrollTop = $(this).scrollTop(),
            $panelToHide = $(panelToHide),
            scrollSize = Math.ceil(Math.abs(event.deltaY) * event.deltaFactor);

        if (scrollTop > lastScrollTop) {
          i += scrollSize;
          if (i >= sensitivity) {
            $panelToHide.addClass('hide');
            i = sensitivity;
          }
        } else {
          i -= scrollSize;
          if (i <= sensitivity/5) {
            i = 0;
            $panelToHide.removeClass('hide');
          }
        }
        lastScrollTop = scrollTop;

        //show on top and bottom
        if ((scrollTop + window.windowHeight + sensitivity >= window.documentHeight) || (scrollTop + sensitivity <= 0)) {
          $panelToHide.removeClass('hide');
        }
      });
    }
  }

  //scroll on mobile
  if (window.isMobile) {

    var $currentSection = window.isScroll ? $(document) : $('.slide .content'),
        currentSectionHeight = $currentSection.find('.container').outerHeight(),
        lastScroll = 0,
        scrollHeight = Math.max(
          document.body.scrollHeight, document.documentElement.scrollHeight,
          document.body.offsetHeight, document.documentElement.offsetHeight,
          document.body.clientHeight, document.documentElement.clientHeight
        ),
        hidePanelTop = $('.panel.top.hideOnScroll'),
        hidePanelBottom = $('.panel.bottom.hideOnScroll');

    $currentSection.on('scroll', function(event){

      if (window.inAction) return;

      var $currentSection = $(this),
          scrollTop = $(this).scrollTop(),
          scrollDirection = (scrollTop > lastScroll) ? "down" : "up";

      if (scrollDirection === "down" && $currentSection.scrollTop() > 0) {
        if (hidePanelTop) $body.addClass('hidePanel-top');
        if (hidePanelBottom) $body.addClass('hidePanel-bottom');
      } else if (scrollDirection === "up"){
        $body.removeClass('hidePanel-top hidePanel-bottom');
      }

      lastScroll = scrollTop;
    });
  }








/***
 *      _  __
 *     | |/ /
 *     | ' / ___ _   _ ___
 *     |  < / _ \ | | / __|
 *     | . \  __/ |_| \__ \
 *     |_|\_\___|\__, |___/
 *                __/ |
 *               |___/
 *
 *      Listen the Keys
 */

  $(document).on("keydown",function(e){
    var delta = 2.5,
        scrollTime = 0.3,
        scrollDistance = 50,
        $currentSection = $('.slide.selected .content'),
        scrollTop = $currentSection.scrollTop(),
        finalScroll = scrollTop + parseInt(delta * scrollDistance),
        finalScrollToTop = scrollTop - parseInt(delta * scrollDistance);

    if (window.disableKeyNavigation || e.target.nodeName.toLowerCase() == 'input' || e.target.nodeName.toLowerCase() == 'textarea') {
      return;
    }

    /* [ ← ] & [ PgUp ] */
    if (e.keyCode === 37 || e.keyCode === 33){
      e.preventDefault();
      if (window.horizontalMode){ window.changeSlide('decrease'); }
    }

    /* [ ↑ ] & [ PgUp ] */
    if (e.keyCode === 38 || e.keyCode === 33){
      if (!window.horizontalMode){
        e.preventDefault();
        window.changeSlide('decrease');
      } else {
        e.preventDefault();
        TweenLite.to($currentSection, (window.scrollSpeed/1000), {
          scrollTo : { y: finalScrollToTop, autoKill:true },
          ease: Power4.easeOut,
          overwrite: 5
        });
      }
    }

    /* [ → ] & [ PgDwn ] */
    if (e.keyCode === 39 || e.keyCode === 34){
      if (window.horizontalMode){
        e.preventDefault();
        window.changeSlide('increase');
      }
    }

    /* [ ↓ ] & [ PgDwn ] */
    if (e.keyCode === 40 || e.keyCode === 34){
      if (!window.horizontalMode) {
        e.preventDefault();
        window.changeSlide('increase');
      } else {
        e.preventDefault();
        TweenLite.to($currentSection, (window.scrollSpeed/1000), {
          scrollTo : { y: finalScroll, autoKill:true },
          ease: Power4.easeOut,
          overwrite: 5
        });
      }
    }

    /* [ esc ] */
    if (e.keyCode === 27){
      hideSidebar();
      hideDropdown();
      hidePopup();
      unzoomImage();
    }
  });








/***
*    _   _                           _
*   | \ | |           (*)           | | (*)                 *
*   |  \| | __ ___   ___  __ _  __ _| |_ _  ___  _ __       *
*   | . ` |/ _` \ \ / | |/ _` |/ _` | __| |/ _ \| '_ \     (*) [Tooltip]
*   | |\  | (_| |\ V /| | (_| | (_| | |_| | (_) | | | |     *
*   |_| \_|\__,_| \_/ |_|\__, |\__,_|\__|_|\___/|_| |_|     *
*                         __/ |
*                        /___/
*
*    Generate Navigation Dots and Tootlips
*/



  navParent = $('.navigation'),
  navigation = $(navParent).find('ul'),
  slidesNumber = $('.slide:not(.exclude)').length;

  if ($(navigation).length > 0) {

    if ($(navigation).is(':empty')) {

      $(navigation).each(function(index, element) {
        for (var i = 1; i <= slidesNumber; i++){

          // Add Tooltips
          var title = $('.slide:not(.exclude):eq('+(i - 1)+')').data('title');
          if (title === undefined) {
            $(element).append('<li></li>');
          } else {
            $(element).append('<li data-title="'+title+'"></li>');
          }
        }
      });
    }

    //Navigation clicks
    $('.navigation li').on("click touchend", function(){
      var thisIndes = $(this).index(),
          realIndex = $('.slide:not(.exclude):eq('+thisIndes+')').index('.slide');

      $(this).blur();

      window.changeSlide(realIndex + 1);
    });

    if (!$('.side').hasClass('compact')){
      //Collapse sidemenu to compact
      $(window).on('load resize ready',function(){
        var containerHeight = window.windowHeight - 140,
            container = $('.side').removeClass('compact').find('ul'),
            totalWidth = 0;

        $(container).children().each(function(){
          totalWidth += Math.round($(this).outerHeight(true));
        });

        if (totalWidth > containerHeight){
          $('.side').addClass('compact');
        } else {
          $('.side').removeClass('compact');
        }
      });
    }
  }

  //In-page #Navigation
  $("a[href^='#'][target!='_blank']").click(function(e){

    var url = $(this).attr('href'),
        hashLink = url.split('#')[1],
        requestedElement = hashLink ? $('.slide[id="' +hashLink+ '"], .slide[data-name="' +hashLink+ '"]') : $('.slide:eq(0)');

    if( requestedElement.length > 0 ){

      e.preventDefault();

      if ( window.isMobile && window.isSimplifiedMobile || window.isScroll ){
        var target = requestedElement;
        if (target.length) {
          $('html,body').stop().clearQueue().animate({scrollTop:target.position().top},1000);
        }
        if (window.setHashLink){
          window.location.hash = hashLink;
        }
      } else {
        if(!($(this).hasClass("toLastSlide") && $("body").hasClass("lastSlide"))){
          window.stage = $('.slide').index(requestedElement) + 1;
          showSlide(window.stage);
        }
      }
      hideSidebar();
    }

  });








/***
*       _____ _     _      _
*      / ____(_)   | |    | |
*     | (___  _  __| | ___| |__   __ _ _ __
*      \___ \| |/ _` |/ _ \ '_ \ / _` | '__|
*      ____) | | (_| |  __/ |_) | (_| | |
*     |_____/|_|\__,_|\___|_.__/ \__,_|_|
*
*     Sidebar Panel
*/

  $('.sidebarTrigger[data-sidebar-id]').on('click', function(){

    var sidebarID = $(this).data('sidebar-id');
    window.showSidebar(sidebarID);

  });

  //Hide on click outside
  $(document).on('mouseup touchstart', function (e){
    var container = $(".sidebarShown .sidebar, .dropdownTrigger"),
        clickTarget = e.target;

    if (!container.is(clickTarget) && container.has(clickTarget).length === 0 && window.hideSidebarOnBodyClick && $(clickTarget).hasClass('ignoreBodyClick') === false) {
      hideSidebar();
    }
  });

  //Hide on .close Click
  $('.sidebar .close, .sidebar [data-sidebar-action="close"]').on('click touchstart', function(){
    hideSidebar();
  });








/***
*     _____                            __
*    |  __ \           _   _ _ __     |  |_
*    | |__) ___  _ __ | | | | '_ \    |__| |
*    |  ___/ _ \| '_ \| | | | |_) |     |__|
*    | |  | (_) | |_)  \__,_| .__/
*    |_|   \___/| .__/      | |
*               | |         |_|
*    PopUp      |_|
*/


  $('.popupTrigger[data-popup-id]').on('click', function(){
    var popupID   = $(this).data('popup-id'),
        focusOnID = $(this).data('popup-focus-input'); // ID of input to focus on after showing popup
    if(typeof(focusOnID)!="string" && focusOnID!=""){
        focusOnID = false;
    }
    window.showPopup(popupID, focusOnID);
  });

  //Hide on body click
  if (window.hidePopupOnBodyClick){
    var isPopupOnMousePressed = false;
    $(document).on("mousedown", function (e){
      if($(e.target).closest(".popupShown .popup .popupContent, .popupTrigger, .popupNoHide").length){
        isPopupOnMousePressed = true; 
      }else{
        isPopupOnMousePressed = false;
      }
    });
    $(document).on('click', function (e){
      var container = $(".popupShown .popup .popupContent, .popupTrigger");
      if (!container.is(e.target) && container.has(e.target).length === 0 && container.length > 0 && !isPopupOnMousePressed && ($(e.target).closest(".dialog").length && $(e.target).closest(".popup").length!=0)!==false) {
        hidePopup();
      }
    });
  }

  //Hide on .close Click
  $('.popup [data-popup-action="close"]').on('click', function(){
    hidePopup($(this).parents('.popup').data('popup-id'));
  });

  //Set hash link on popup reveal (works only with window.setHashLink = 0);
  if (window.setPopupHash) {
    //Set hash on click
    $('.popupTrigger[data-popup-id]').on('click', function(){
      var hash = $(this).attr('data-popup-id');
      window.location.hash = "#" + hash;
    });

    //Collect unique hash links
    window.setPopupHash = [];
    $('.popupTrigger').each(function(){
      var hash = $(this).attr('data-popup-id');

      if($.inArray(hash, window.setPopupHash) == -1) {
        window.setPopupHash.push(hash);
      }
    });

    //Open popup if hash presented
    if($.inArray(window.location.hash.split("#")[1], window.setPopupHash) !== -1) {
      setTimeout(function(){
        $('.popupTrigger[data-popup-id="'+window.location.hash.split("#")[1]+'"]').click();
      }, 500);
    }

    $(window).on('popupHidden', function(){
      if (history.pushState) {
        window.history.pushState("", "", location.href.split('#')[0]);
      } else {
        window.location.hash = "";
      }
    });
  }



/***
*       _____       ______ ______ ______
*      / ____|     |  ____|  ____|  ____|
*     | |  __  __ _| |__  | |__  | |__
*     | | |_ |/ _` |  __| |  __| |  __|
*     | |__| | (_| | |    | |____| |____
*      \_____|\__,_|_|    |______|______|
*
*     Grid and Flex Element Equalizer
*/

  $(window).on('resize load ready popupShown',function(){

    setTimeout(function(){
      equalizeElements();
    }, 1);
  });

  //Detect Resize
  $(window).on('resize',function(){
    $html.addClass('resizing');
  }).on('resizeEnd',function(){
    $html.removeClass('resizing');
  });








/***
*       _____ _ _     _
*      / ____| (_)   | |
*     | (___ | |_  __| | ___ _ __
*      \___ \| | |/ _` |/ _ \ '__|
*      ____) | | | (_| |  __/ |
*     |_____/|_|_|\__,_|\___|_|
*
*      Slider       * *(*)* *
*/


  var sliderEl = $('.slider');

  if ($(sliderEl).length > 0) {

    $(sliderEl).each(function(index, element) {

      //check status
      var $el = $(element),
          sliderID = $el.data('slider-id'),
          nextIndex = $el.find('.selected').index();

      //set status
      if (window.sliderStatus) {
        $html.removeClassByPrefix("slider_" + sliderID).addClass("slider_" + sliderID + "_" + nextIndex);
      }

      //autoplay
      if ($el.hasClass('autoplay')) {

        var interval = ($el.data('slider-interval')) ? parseInt($el.data('slider-interval')) : 5000;

        var autoplay = setInterval(function(){
          $el.trigger('next');
        },interval);

        //stop interval on user interaction
        if ($el.data('slider-stoponclick') != false) {
          $('[data-slider-id="'+sliderID+'"]').on('mousedown touchstart', function(){
            clearInterval(autoplay);
          });
        }
      }

      //clickable
      if ($el.hasClass('clickable') || $el.hasClass('autoplay') || $el.hasClass('swipeable')){
        // go to the next slide
        $el.on('next', function(event){

          var $el = $(this),
              sliderID = $el.data('slider-id'),
              $slider = $('.slider[data-slider-id="'+sliderID+'"]'),
              clickTarget = event.target;

          //break
          if($(clickTarget).data('slider-event') == "cancel") return;

          //for multiple sliders
          $slider.each(function(){

            var $el = $(this),
                sliderID = $el.data('slider-id'),
                $selected = $el.children('.selected'),
                $nextElement = $selected.nextOrFirst('li'),
                nextIndex = $nextElement.index(),
                $controller = $('.controller[data-slider-id="'+sliderID+'"]'),
                $sliderCounter = $('.sliderCounter[data-slider-id="'+sliderID+'"]'),
                isAnimated = $el.is('.animated, .animateOnEvent');

            //uselect old
            $selected.removeClass('selected').addClass('hide').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() {
              $(this).removeClass('hide');
            });

            //select next
            $nextElement.removeClass('hide').addClass('selected');

            // stop playing videos in slider and start playing it in chosen slide if autoplay is set
            if($el.find('>li iframe.autoplay, >li video.autoplay')){
              sliderStopAndPlayVideos($el, true);
            }

            //set status
            if (window.sliderStatus) {
              $html.removeClassByPrefix("slider_" + sliderID).addClass("slider_" + sliderID + "_" + nextIndex);
            }

            //animated
            if (isAnimated) {
              $el.addClass('animateOnEvent');
              $el.find('li').removeClassByPrefix('ae-').removeClass('do');
              $el.find('.selected').each(function(index){
                $(this).removeClassByPrefix('ae-').removeClass('do').addClass('ae-' + (index + 1)).addClass('do');
              });

              $(window).scroll();
            }

            if (sliderID && $controller.length > 0){
              $controller.each(function(){
                var $controller = $(this);

                $controller.children('.selected').removeClass('selected');
                $controller.children('li:eq('+nextIndex+')').addClass('selected');
              });
            }

            // if slider slides couter applied
            sliderCounterController($sliderCounter, nextIndex, $el);
              
          });

          //set status
          if (window.sliderStatus) {
            $html.removeClassByPrefix("slider_" + sliderID).addClass("slider_" + sliderID + "_" + nextIndex);
          }
        });

        // go to the previous slide
        $el.on('prev', function(event){

          var $el = $(this),
              sliderID = $el.data('slider-id'),
              $slider = $('.slider[data-slider-id="'+sliderID+'"]'),
              clickTarget = event.target;

          //break
          if($(clickTarget).data('slider-event') == "cancel") return;

          //for multiple sliders
          $slider.each(function(){

            var $el = $(this),
                sliderID = $el.data('slider-id'),
                $selected = $el.children('.selected'),
                $prevElement = $selected.prevOrLast('li'),
                nextIndex = $prevElement.index(),
                $controller = $('.controller[data-slider-id="'+sliderID+'"]'),
                $sliderCounter = $('.sliderCounter[data-slider-id="'+sliderID+'"]'),
                isAnimated = $el.is('.animated, .animateOnEvent');
            //uselect old
            $selected.removeClass('selected').addClass('hide').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() {
              $(this).removeClass('hide');
            });

            //select next
            $prevElement.removeClass('hide').addClass('selected');

            // stop playing videos in slider and start playing it in chosen slide if autoplay is set
            if($el.find('>li iframe.autoplay, >li video.autoplay')){
              sliderStopAndPlayVideos($el, true);
            }

            //set status
            if (window.sliderStatus) {
              $html.removeClassByPrefix("slider_" + sliderID).addClass("slider_" + sliderID + "_" + nextIndex);
            }

            //animated
            if (isAnimated) {
              $el.addClass('animateOnEvent');
              $el.find('li').removeClassByPrefix('ae-').removeClass('do');
              $el.find('.selected').each(function(index){
                $(this).removeClassByPrefix('ae-').removeClass('do').addClass('ae-' + (index + 1)).addClass('do');
              });

              $(window).scroll();
            }

            if (sliderID && $controller.length > 0){
              $controller.each(function(){
                var $controller = $(this);

                $controller.children('.selected').removeClass('selected');
                $controller.children('li:eq('+nextIndex+')').addClass('selected');
              });
            }

            // if slider slides couter applied
            sliderCounterController($sliderCounter, nextIndex, $el);
              
          });

          //set status
          if (window.sliderStatus) {
            $html.removeClassByPrefix("slider_" + sliderID).addClass("slider_" + sliderID + "_" + nextIndex);
          }
        });

        if ($el.hasClass('clickable') || $el.hasClass('autoplay')){
          $el.on("click",function(){
            $(this).trigger("next");
          });
        }

      }

      // swipeable
      if ($el.hasClass('swipeable')){
        var swipeableMinDistance = 50;
        // touch swipe
        $el.swipe({
          swipeStatus:function(event, phase, direction, distance){
            if(phase=="end" && distance>swipeableMinDistance){
              if(direction=="right"){
                $el.trigger("prev");
              }
              if(direction=="left"){
                $el.trigger("next");
              }
            }
          },
          maxTimeThreshold:0,
          fingers:'all'
        });
      }

    });
  }

  // controller
  var $controller = $('.controller');

  if ($controller.length > 0) {

    var controllerSelector = $controller.data('controller-selector') ? $controller.data('controller-selector') : "li";

    $controller.on('click', controllerSelector, function(){
      var $controllerElement = $(this),
          $controller = $controllerElement.closest('.controller'),
          nextIndex = $($controller.find(controllerSelector)).index($controllerElement),
          sliderId = $controller.data('slider-id'),
          $slider = $('.slider[data-slider-id="'+sliderId+'"]'),
          $controllers = $('.controller[data-slider-id="'+sliderId+'"]'),
          $sliderCounter = $('.sliderCounter[data-slider-id="'+sliderId+'"]');

      if (!$controllerElement.hasClass('selected')){
        $controllers.each(function(){
          var $controller = $(this);

          $controller.children('.selected').removeClass('selected');
          $controller.children('li:eq('+nextIndex+')').addClass('selected');
        });

        //for multiple sliders
        $slider.each(function(){
          var $slider = $(this),
              isAnimated = $slider.hasClass('animated');


          $slider.children('.selected').removeClass('selected').addClass('hide').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() {
            $(this).removeClass('hide');
          });

          $slider.children('li').eq(nextIndex).removeClass('hide').addClass('selected');

          // stop playing videos in slider and start playing it in chosen slide if autoplay is set
          if($slider.find('>li iframe.autoplay, >li video.autoplay')){
            sliderStopAndPlayVideos($slider, false);
          }

          //is animated
          if (isAnimated) {
            $slider.addClass('animateOnEvent');
            $slider.find('>li').removeClassByPrefix('ae-').removeClass('do');
            $slider.find('.selected').each(function(index){
              $(this).removeClassByPrefix('ae-').removeClass('do').addClass('ae-' + (index + 1)).addClass('do');
            });

            $(window).scroll();
          }

          // if slider slides couter applied
          sliderCounterController($sliderCounter, nextIndex, $slider);
        });

        //set status
        if (window.sliderStatus) {
          $html.removeClassByPrefix("slider_" + sliderID).addClass("slider_" + sliderID + "_" + nextIndex);
        }
      }
    });
  }

  //Next and prev buttons
  $(document).on('click', '[data-slider-action]', function(){

    if ($(this).data('slider-id')){
      var $this = $(this),
          $desiredElement, nextIndex,
          sliderID = $this.data('slider-id'),
          action = $this.data('slider-action'),
          $slider = $('.slider[data-slider-id="' + sliderID + '"]'),
          $controller = $('.controller[data-slider-id="'+sliderID+'"]'),
          $sliderCounter = $('.sliderCounter[data-slider-id="'+sliderID+'"]');

      //set status
      if (window.sliderStatus) {
        $html.removeClassByPrefix("slider_" + sliderID).addClass("slider_" + sliderID + "_" + nextIndex);
      }

      $slider.each(function(){
        var $slider = $(this),
            controllerSelector = $controller.data('controller-selector') ? $controller.data('controller-selector') : "li",
            $selected = $slider.find('.selected'),
            isAnimated = $slider.hasClass('animated');

        //detect direction
        if (action === "next"){
          $desiredElement = $selected.nextOrFirst("li");
        } else if (action === "prev") {
          $desiredElement = $selected.prevOrLast("li");
        } else if (parseInt(action) || action === 0 ) {
          nextIndex = parseInt(action);
          $desiredElement =$slider.find('>li:eq(' + nextIndex + ")");
        }

        //select element
        nextIndex = $desiredElement.index();
        $selected.removeClass('selected');
        $desiredElement.removeClass('hide').addClass('selected');

        // stop playing videos in slider and start playing it in chosen slide if autoplay is set
        if($slider.find('>li iframe.autoplay, >li video.autoplay')){
          sliderStopAndPlayVideos($slider,true);
        }

        //is animated
        if (isAnimated) {
          $slider.addClass('animateOnEvent');
          $slider.find('li').removeClassByPrefix('ae-').removeClass('do');
          $slider.find('.selected').each(function(index){
            $(this).removeClassByPrefix('ae-').removeClass('do').addClass('ae-' + (index + 1)).addClass('do');
          });
          $(window).scroll();
        }

        // if slider slides couter applied
        sliderCounterController($sliderCounter, nextIndex, $slider);
      });

      $controller.each(function(){
        var $controller = $(this);

        //change controller
        if ((sliderID) && ($controller.length > 0) ){
          $controller.find('.selected').removeClass('selected').addClass('hide').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() {
            $this.removeClass('hide');
          });
          $controller.find(controllerSelector).eq(nextIndex).addClass('selected');
        }
      });
    }
  });

  //Auto Height
  $('[data-slider-id].autoHeight').each(function(index, element) {
    $(window).on('click resize load ready next',function(){
      var totalHeight = 0,
          el = $(element).find('.selected');

      $(element).find('.selected').children().each(function(){
        totalHeight += Math.round($(this).outerHeight(true));
      });

      $(element).height(totalHeight + "px");
    });
  });

  $(".slider.clickable[data-slider-id], .controller[data-slider-id]").on('click', function(event){
    if($(event.target).data('slider-event') != "cancel") $(window).resize();
  });







/***
*      _____                      _
*     |  __ \                    | |
*     | |  | |_ __ ___  _ __   __| | _____      ___ __
*     | |  | | '__/ _ \| '_ \ / _` |/ _ \ \ /\ / / '_ \
*     | |__| | | | (_) | |_) | (_| | (_) \ V  V /| | | |
*     |_____/|_|  \___/| .__/ \__,_|\___/ \_/\_/ |_| |_|
*                      | |
*                      |_|
*
*     Dropdown Window and Share
*/


  window.dropdownShown = false;
  window.dropdownInterval = false;
  //click
  $('body').on('click', '.dropdownTrigger', function(){
    showDropdown($(this));
  });

  //hover
  $('.dropdownTrigger.hover').hover(function(){
    showDropdown($(this), "hover");
  });

  //remove on resize
  $(window).on('resize',function(){
    hideDropdown();
  });

  //remove on click outside
  $(document).on('mouseup touchstart', function (e){
    var container = $(".dropdownShown .dropdown");
    if (
      window.dropdownShown && 
      !container.is(e.target) && 
      container.has(e.target).length === 0 && 
      $(e.target).closest("[data-dropdown-id]").attr("data-dropdown-id") != window.dropdownShown
    ) {
      hideDropdown();
    }
  });

  //set url for share
  window.shareUrl = window.location.href;
  if ($('.share').data('url')) {
    window.shareUrl = $('.dropdown').data('url');
  }
  //set text for share
  window.shareText = document.title;
  if ($('.share').data('text')) {
    window.shareText = $('.dropdown').data('url');
  }

  $('.share').sharrre({
    enableHover: false,
    url: window.shareUrl,
    text: window.shareText,
    enableCounter: false,
    share: {
      twitter: true,
      facebook: true,
      pinterest: true,
      googlePlus: true,
      stumbleupon: true,
      linkedin: true
    },

    buttons: {
      pinterest: {
        media: $('.dropdown').data('pinterest-image'),
        description: $('.dropdown').data('text') + " " + $('.dropdown').data('url')
      }
    },

    template: $('.share').html(),

    render: function(api) {

      $(api.element).on('click touchstart', '.social-twitter', function() {
        api.openPopup('twitter');
      });
      $(api.element).on('click touchstart', '.social-facebook', function() {
        api.openPopup('facebook');
      });
      $(api.element).on('click touchstart', '.social-pinterest', function() {
        api.openPopup('pinterest');
      });
      $(api.element).on('click touchstart', '.social-googlePlus', function() {
        api.openPopup('googlePlus');
      });
      $(api.element).on('click touchstart', '.social-stumbleupon', function() {
        api.openPopup('stumbleupon');
      });
      $(api.element).on('click touchstart', '.social-linkedin', function() {
        api.openPopup('linkedin');
      });
      $(api.element).on('click touchstart', '.mail', function() {
        var subject = $(this).data('subject') ? $(this).data('subject') : "",
            body = $(this).data('body') ? $(this).data('body') : "",
            url = $('.dropdown').data('url') ? $('.dropdown').data('url') : window.location.href;

        //open email
        window.location.href ="mailto:?subject=" + encodeURIComponent( subject ) + "&body=" + encodeURIComponent( body ) + "%20" + url;
      });

    }
  });








/***
*      _____  _       _
*     |  __ \(_)     | |
*     | |  | |_  __ _| | ___   __ _
*     | |  | | |/ _` | |/ _ \ / _` |
*     | |__| | | (_| | | (_) | (_| |
*     |_____/|_|\__,_|_|\___/ \__, |
*                              __/ |
*                             |___/
*     Dialog Windows
*/

  $.fn.slidesDialog = function( options ) {
    // check if container for dialogs exists?
    if($(document).find('.dialogContainer').length==0){
      if($(document).find('.dialog').length>1){
          console.log('%cWarning: You using more than one .dialog element. Maybe you should wrap them into the <div class="dialogContainer">?',"color:orange");
      }
    }
  
    // bind open/close methods to any element with data-dialog-action
    if(options=="bindOpenCloseMethods"){
      bindOpenCloseMethods($(this));
      return false;
    }

    var dialogs = this;
    // check if already exists?
    if(dialogs.length==0){
      if(options){
        if(options.id){
          dialogs = $(document).find(".dialog[data-dialog-id="+options.id+"]");
        }else{
          alert("Error: you need to provide the 'id' property to create the dialog!");
          return false;
        }
      }
    }

    // start creating
    if(dialogs.length){
      dialogs.each(function(i, dialog){
        if(typeof(options)!="string"){
          init(dialog,options);
        }else{
          if(options=="open"){dialog.open(true);}
          if(options=="close"){dialog.close();}
        }
      });
    }else if(options){
      init(false,options);
    }

    // functions
    // init
    function init(el, options){

      var settings = mergeSettings(el);

      // remove dialog if it's HTML was changed
      if(el){
        if(el.settings){
          if(el.settings.template != settings.template){
            $(el).remove();
            el=false;
          }
        }
      }

      // create dialog box if not exists
      if(!el){
        el = $(settings.template);
        el.attr("data-dialog-id",settings.id);
        if($('.dialogContainer').length){
          $('.dialogContainer').prepend(el);
        }else{
          $('body').append(el);
        }
        bindOpenCloseMethods(el.find('[data-dialog-action]'));
        el = el[0];
      }

      // store settings of an element inside it
      el.settings = settings;

      // bind methods
      bindMethods(el);

      // show dialog after initialization
      if(settings.action!="close" && !settings.closeByCookie){
        el.open();
      }
      // close dialog if cookie with it's id is set
      if(settings.closeByCookie){
        el.close();
      }
    
      // open links in dialog
      $(el).find("[data-href]").on('click', function(){
        if ($(this).data('target')){
          window.open($(this).data('href'), '_blank');
        } else {
          window.location = $(this).data('href');
        }
      });

      // submit forms in dialog
      $(el).find('[data-type="submit"]').click(function(){
        $(this).parents('form').submit();
      });

      // Set cookie if data-dialog-cookie-age is set
      if($(el).attr("data-dialog-cookie-age")!=undefined && el.settings.id){
        var age = parseInt($(el).attr("data-dialog-cookie-age"));
        $.cookie(el.settings.id,true,{expires:age,path:'/'});
      }

      return true;
    };
    // merge default, data-attributes set and provided options settings
    function mergeSettings(el){
      // default settings
      var settings = {
        template:'<div class="dialog hidden"><div class="close" data-dialog-action="close"></div><div class="dialogContent"><div class="text opacity-8">This popup was created with javascript. This is the default template. You can provide HTML code in the "template" property and it will be used as a Dialog box HTML.</div></div><ul><li data-dialog-action="close" class="indigo">Nice!</li></ul></div>', // the HTML code of a dialog box
        action: "close", // open/close
        id: false, // id of a dialog (need to be provided only if you create it via JS)
        speed:500, // show / hide animation speed
        openAfter:0, // delay before showing dialog
        closeAfter:0, // hide dialog after X ms after showing
        closeByCookie:false // close dialog if cookie with name = dialog-id is set
      };
      if(el){
        if(el.settings){settings = el.settings;}
        var $el = $(el);
        if(Object.keys($el.data()).length){
          // overwrite default settings to a data-attribes
          if($el.attr("data-dialog-id")){settings.id=$el.attr("data-dialog-id");}
          if($el.attr("data-dialog-action")){settings.action=$el.attr("data-dialog-action");}
          if($el.attr("data-dialog-speed")){settings.speed=parseInt($el.attr("data-dialog-speed"));}
          if($el.attr("data-dialog-open-delay")){settings.openAfter=parseInt($el.attr("data-dialog-open-delay"));}
          if($el.attr("data-dialog-close-delay")){settings.closeAfter=parseInt($el.attr("data-dialog-close-delay"));}
        }
        if($.cookie($el.attr("data-dialog-id"))){
          settings.closeByCookie = true;
        }
      }
      // overwrite settings with provided options
      settings = $.extend( {}, settings, options );
      return settings;
    };
    // bind methods to each dialog box
    function bindMethods(el){
      var settings = el.settings;
      // show
      el.open=function(noDelay){
        if(el.openTimeout){clearTimeout(el.openTimeout);}
        if(el.closeTimeout){clearTimeout(el.closeTimeout);}
        el.openTimeout = setTimeout(function(){
          if (!$(el).is(':visible')){
            $(el).addClass('reveal').slideDown(settings.speed,function(){
              $(this).removeClass('reveal hidden');
            });
          }
        },(noDelay)?0:settings.openAfter);
        if(settings.closeAfter+settings.openAfter > settings.openAfter && !noDelay){
          el.closeTimeout = setTimeout(function(){
            el.close();
          },settings.closeAfter + settings.openAfter);
        }
      };
      // hide
      el.close=function(){
      if(el.openTimeout){clearTimeout(el.openTimeout);}
        if(el.closeTimeout){clearTimeout(el.closeTimeout);}
        if ($(el).is(':visible')){
          $(el).addClass('hide').slideUp(settings.speed,function(){
            $(this).removeClass('hide');
          });
        }
      };
    }

    // bind open/close methods to any element with data-dialog-action and data-dialog-id provided
    function bindOpenCloseMethods(el){
      $(el).click(function(){
        var action = $(this).attr("data-dialog-action"),
            id = $(this).attr("data-dialog-id");
        
        if(id=="" || id==undefined){id=false;}
         
        if(action=="close"){
          if(id && $(this).closest(".dialog").length==0){ // if element is OUTSIDE the dialog box
            $(document).find(".dialog[data-dialog-id="+id+"]").slidesDialog("close");
          }else{ // if element is INSIDE the dialog box
            $(this).closest(".dialog").slidesDialog("close");
          }
        }else if(action="open" && id){
           $(document).find(".dialog[data-dialog-id="+id+"]").slidesDialog("open");
        }
      });
    }

  };

  // Initialize any element in HTML with .dialog class and data-dialog-id attribute
  $(".dialog[data-dialog-id]").slidesDialog();
  // Bind open/close methods to each element
  $(document).find('[data-dialog-action]:not(.dialog)').slidesDialog("bindOpenCloseMethods");


/***
*       _____            _             _     ______
*      / ____|          | |           | |   |  ____|
*     | |     ___  _ __ | |_ __ _  ___| |_  | |__ ___  _ __ _ __ ___
*     | |    / _ \| '_ \| __/ _` |/ __| __| |  __/ _ \| '__| '_ ` _ \
*     | |___| (_) | | | | || (_| | (__| |_  | | | (_) | |  | | | | | |
*      \_____\___/|_| |_|\__\__,_|\___|\__| |_|  \___/|_|  |_| |_| |_|
*
*     Ajax Contact Form
*/

  $('#contact-form, [data-ajax-form]').each(function(index, element) {
    $(element).ajaxForm(function() {
      var $ajaxForm = $(element),
          $ajaxFormButton = $(element).find('[type="submit"]'),
          ajaxFormButtonIsInput = $ajaxFormButton.is('input') ? true : false,
          successText = $ajaxFormButton.data('success-text') ? $ajaxFormButton.data('success-text') : "Done!",
          successClass = $ajaxFormButton.data('success-class') ? $ajaxFormButton.data('success-class') : "green",
          defaultText = ajaxFormButtonIsInput ? $ajaxFormButton.val() : $ajaxFormButton.html(),
          defaultClasses = $ajaxFormButton.attr('class');

      if (ajaxFormButtonIsInput) {
        $ajaxFormButton.val(successText);
      } else {
        $ajaxFormButton.text(successText)
      }
      $ajaxFormButton.addClass(successClass);

      setTimeout(function(){
        if (ajaxFormButtonIsInput) {
          $ajaxFormButton.val(defaultText);
        } else {
          $ajaxFormButton.html(defaultText);
        }
        $ajaxFormButton.attr('class', defaultClasses);
        $ajaxForm[0].reset();
      },4000);
    });
  });







/***
*       _____                       _
*      / ____|                     | |
*     | (___   ___  _   _ _ __   __| |
*      \___ \ / _ \| | | | '_ \ / _` |
*      ____) | (_) | |_| | | | | (_| |
*     |_____/ \___/ \__,_|_| |_|\__,_|
*
*     Music and Sound
*/

  $('audio[data-sound-id]').each(function(event, element){
    var $element = $(element),
        musicID = $element.data('sound-id'),
        audio = $element[0],
        $soundButton = $('.soundTrigger[data-sound-id="'+musicID+'"]');

    if (audio.autoplay){
      $soundButton.addClass('playing');
    } else {
      $soundButton.removeClass('playing');
    }
  });

  $('.soundTrigger').click(function(){
    var musicID = $(this).data('sound-id'),
        $audio = $('audio[data-sound-id="'+musicID+'"]'),
        action = $audio.data('sound-action') ? $audio.data('sound-action') : "toggle",
        fade = (parseInt($audio.data('sound-fade')) >= 0 || $audio.data('sound-fade')) ? parseInt($audio.data('sound-fade')) : 500;

    if ($audio[0].paused && ( action === "toggle" || action === "play")){
      $audio[0].play();
      $audio.animate({volume: 1}, fade);
      $(this).addClass('playing');
    } else if (action === "toggle" || action === "pause"){
      $audio.animate({volume: 0}, fade, function(){
        $audio[0].pause();
      });

      $(this).removeClass('playing');
    }
  });

// end on dom ready
});




/***
*                           _
*         /\               | |
*        /  \   _ __   __ _| |_   _ _______
*       / /\ \ | '_ \ / _` | | | | |_  / _ \
*      / ____ \| | | | (_| | | |_| |/ /  __/
*     /_/    \_\_| |_|\__,_|_|\__, /___\___|
*                              __/ |
*                             |___/
*
*     Analyze Devices and Browsers
*/


window.isMobile = false;
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) { window.isMobile = true; }

//Detect Browser
window.isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
window.isSafari = /^((?!chrome).)*safari/i.test(navigator.userAgent);
window.isChrome = /chrom(e|ium)/.test(navigator.userAgent.toLowerCase());
window.isChromeiOS = navigator.userAgent.match('CriOS');
window.isMSIE = navigator.userAgent.match('MSIE') || navigator.userAgent.match("Windows NT") && navigator.userAgent.match("rv:11.0");
window.isEdge = navigator.userAgent.match('Edge');
window.isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;
window.isiPad = navigator.userAgent.match(/iPad/i) !== null;

//Detect OS
window.isWindows = navigator.platform.toUpperCase().indexOf('WIN')!==-1;
window.isOSX = navigator.platform.toUpperCase().indexOf('MAC')!==-1;
window.isLinux = navigator.platform.toUpperCase().indexOf('LINUX')!==-1;

//iOS13+ Devices with "Request Desktop Website" setting
if (window.isOSX && navigator.maxTouchPoints) window.isMobile = true;

//Prepare for CSS Fixes
if (window.isSafari){$html.addClass('safari');}
if (window.isFirefox){$html.addClass('firefox');}
if (window.isChrome){$html.addClass('chrome');}
if (window.isMSIE){$html.addClass('msie');}
if (window.isEdge){$html.addClass('edge');}
if (window.isAndroid){$html.addClass('android');}
if (window.isWindows){$html.addClass('windows');}
if (window.isOSX){$html.addClass('osx');}
if (window.isLinux){$html.addClass('linux');}

//Detect Mobile
if(window.isMobile){$html.addClass('mobile');}else{$html.addClass('desktop');}

//Retina
window.isRetina = ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 124dpi), only screen and (min-resolution: 1.3dppx), only screen and (min-resolution: 48.8dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (min-device-pixel-ratio: 1.3)').matches)) || (window.devicePixelRatio && window.devicePixelRatio > 1.3));
if (window.isRetina) {
    $html.addClass('retina');
}