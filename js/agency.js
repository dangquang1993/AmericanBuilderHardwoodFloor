/*!
 * Start Bootstrap - Agnecy Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

// jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});

// Highlight the top nav as scrolling occurs
$('body').scrollspy({
    target: '.navbar-fixed-top'
})

// Closes the Responsive Menu on Menu Item Click
$('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
});

$('div.modal').on('show.bs.modal', function() {
	var modal = this;
	var hash = modal.id;
	window.location.hash = hash;
	window.onhashchange = function() {
		if (!location.hash){
			$(modal).modal('hide');
		}
	}
});

// FAQ Accordion Functionality
$(document).ready(function() {
    $('.faq-question').click(function() {
        var faqItem = $(this).parent('.faq-item');
        var isActive = faqItem.hasClass('active');
        
        // Close all other FAQ items
        $('.faq-item').removeClass('active');
        $('.faq-item .faq-answer').slideUp(300);
        $('.faq-item .faq-icon').text('+');
        
        // If this item wasn't active, open it
        if (!isActive) {
            faqItem.addClass('active');
            faqItem.find('.faq-answer').slideDown(400);
            faqItem.find('.faq-icon').text('−');
        }
    });
    
    // Optional: Open first FAQ item by default
    // $('.faq-item:first-child .faq-question').click();
    
    // Scroll-triggered animations for testimonials and FAQs
    function isInViewport(element) {
        var rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    function animateOnScroll() {
        $('.testimonial-card, .faq-item').each(function() {
            if (isInViewport(this) && !$(this).hasClass('animated')) {
                $(this).addClass('animated');
                $(this).css({
                    'opacity': '0',
                    'transform': 'translateY(30px)'
                }).animate({
                    'opacity': '1'
                }, 600).css('transform', 'translateY(0)');
            }
        });
    }

    // Run on scroll and on load
    $(window).on('scroll', animateOnScroll);
    animateOnScroll();
});