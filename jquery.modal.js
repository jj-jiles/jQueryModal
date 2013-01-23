/* ***********************************************************************
* 
* Licensed under the MIT (MIT-LICENSE.txt) licenses.
*
* Copyright (c) 2012-2016
* Justin Jiles (http://jjis.me)
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to
* deal in the Software without restriction, including without limitation the
* rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
* sell copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
* IN THE SOFTWARE.
*
*
* Uses:
*
*
********
*
*	Display Simple Modal:
*		$.modal("<header><h2>Alert Header</h2></header><p>Your Message</p>");
*
*
*******
*
*	Display Custom Alert Modal
*		$.modal({
*			message : "<header><h2>Alert Header</h2></header><p>Your Message</p>", (should be formatted HTML, including the message header)
*			buton  : {
*				display : true|false,            [boolean|optional default=true]
*				text    : "Ok",                  [string|optional default="Ok"]
*			},
*			is_modal   : true|false,             [boolean|optional default=false]
*			callback   : { function() {...} },   [function|optional]               (callback when $.modal is fired, both on display and close)
*			on_display : { function() { ... } }, [function|optional]               (callback fired on $.modal display)
*			on_close   : { function() { ... } }, [function|optional]               (callback fired on $.modal close)
*		});
*
*
*******
*
*	Display Message within existing Modal (login screen error message would slide down login form and display a login error message)
*		$.modal(
*			"display_message",
*			"<p>You have entered an invalid user id or password</p>"
*		);
*
*	Close Alert Modal
*		$.modal('close');
*
*
*	
***** */
(function($) {
     $.fn.removeFilter = function() {
        if ($.browser.msie) {
            x = this.get(0)
            x.style.removeAttribute("filter");
         }
     }
})(jQuery);
 
 
(function($){  
     $.fn.fadeToggle = function(options) {
          options  = typeof(options) != 'undefined'?options:'';
          speed    = typeof(options.speed)!='undefined'?options.speed:'';
          easing   = typeof(options.easing)!='undefined'?options.easing:'';
          callback = typeof(options.callback)!='undefined'?options.callback:'';
          callback = function(callback) {
               $(this).removeFilter();
               callback;
          }
 
          this.animate(
               {opacity: 'toggle'},
               speed,
               easing,
               callback
          );
     }
})(jQuery);
(function( $ ) {
	
	var $this = $(this);

	/* ******
	*
	* Set the basic defaults 
	*
	* Feel free to edit these classes/ids.
	* Make sure you update the CSS file to reflect the changes
	*
	* ****** */
	var settings = {
		classes : {
			buttons : {
				cancel : 'ui-button cancel',
				normal : 'ui-button normal'
			}
		},
		ids : {
			dim          : 'modal-message-dim',
			wrapper      : 'modal-message-overlay-wrapper',
			content      : 'modal-message-content',
			close_button : 'close_alert'
		}
	};
	/* ******
	* END: basic defaults */

	var options  = { header : '', message : '' };
	var defaults = { text : '', type : 'error', html : '', focus_first : true, has_button : true, is_modal : false, callback : null, on_display : null, on_close : null, button : { display : true, text : 'Ok', close : '' } };
	
	var methods = {

		/* ******
		*
		* Loop through the options passed 
		*
		*/
		init : function( objOptions ) {

			// options passed is an object
			// get the properties of the object for a custom $.modal modal
			if ( typeof(objOptions) == 'object' ) {
				for ( var property in objOptions ) {
					defaults[property] = objOptions[property];
				}
				options = defaults;

			// options passed is a string
			// we'll assume this is a basic $.modal modal
			// and the options passed is the HTML content
			} else {
				defaults['message'] = objOptions;
				options = defaults;
			}
		},
		/*
		*
		* END: init 
		*
		****** */




		/* ******
		*
		* Get the basic HTML of the alert modal
		*
		*/
		get_html : function () {
			$this.html = '<div id="' + settings.ids.dim + '"><div id="' + settings.ids.wrapper + '"><div id="' + settings.ids.content + '"></div></div></div>';
			return $this.html;
		},
		/*
		*
		* END: get_html 
		*
		****** */





		create_header : function() {
			var header = '';
			if ( typeof options.header != 'undefined' && options.header != '' && options.header) {
				header = '<header><h4>' + options.header + '</h4></header>';
			}
			return header;
		},




		/* ******
		*
		* Display the $.modal modal 
		*
		*/
		display : function( objOptions ) {

			if ( typeof(objOptions.button) == 'undefined' ) {
				options.button = { display : true, text : 'Ok' };
			}

			methods.init(objOptions);
			
			$this.html    = methods.get_html();
			$this.content = $('#' + settings.ids.content);

			$('#' + settings.ids.dim).html('');
			$('#' + settings.ids.dim).remove();
			$('body').prepend($this.html);

			options.button.close = '<p class="align-right buttons"><input type="button" value="' + options.button.text + '" id="close_alert" class="' + settings.classes.buttons.cancel + '" onclick="$.modal(\'close\');" /></p>';
			if ( options.button.display === false ) {
				options.button.close = '';
			}

			$('#modal-message-content').html('');
			$('#' + settings.ids.content).html( methods.create_header() + options.message + options.button.close );
			
			// Because the page height could be greater than the client height,
			// we want to disable scrolling of the client and set the modal
			// directly in the middle on the viewable area
			window.setTimeout(function() {

				var _window = { height  : { full : 0, half : 0 }, yOffset : 0 }
				var page    = { yOffset : 0, height  : { full : 0, half : 0 } }
				var dim     = { height : 0, padding: 0 }

				_window.height.full = parseInt($(window).height());
				_window.height.half = Math.ceil(_window.height.full/2);
				_window.yOffset     = window.pageYOffset;

				$this.window_yoffset = _window.yOffset;

				// get the body's original margin so we can reset accordingly
				if ( typeof $this.body_margin == 'undefined' ) {
					$this.body_margin  = $('body').css('margin');
				}

				// create some reusable DOM objects
				var $body     = $('body');
				var $dim      = $('#' + settings.ids.dim);
				var $wrapper  = $('#' + settings.ids.wrapper);
				var $content  = $('#' + settings.ids.content);

				var ui = {
					dim : $dim,
					wrapper : $wrapper,
					content : $content
				};


				// to account for the scroll bar disappearing after the we remove it,
				// we need to adjust the padding-right so things don't shift around
				// also need to set overflow to hidden
				if ( $body.outerHeight() > $(window).height() ) {
					$body.css({ 'overflow' : 'hidden' , 'margin-right' : '18px' });
				} else {
					$body.css({ 'overflow' : 'hidden' });
				}

				page.height  = parseInt($('html').outerHeight());

				dim.height  = page.height+_window.yOffset;

				$dim.css({
					'position'   : 'absolute',
					'height'     : '100%',
					'width'      : '100%',
					'top'        : $this.window_yoffset + 'px',
					'bottom'     : '0'
				});
				
				$wrapper.css('visibility','hidden');
				
				//
				//
				// after a half second delay (to give things time to draw),
				// add the event listeners to the reg/login content elements
				$dim.fadeIn('fast', function() {

					
					var content = {
						height  : { full: 0 , half  : 0 },
						width   : { full: 0 , half  : 0 },
						margin  : { top : 0 , bottom: 0 },
						padding : function() {
							padding = $wrapper.css('padding-top')
							(padding===null || padding.length === 0) ? 0 : parseInt(padding);
							return padding;
						}
					};

					content.padding     = $wrapper.css('padding-top');
					content.padding     = (content.padding===null || content.padding.length === 0) ? 0 : parseInt(content.padding);

					content.height.full = parseInt( $content.outerHeight() ) + content.padding;
					content.height.half = Math.ceil( (content.height.full/2)+content.padding );

					content.width.full  = $('#' + settings.ids.content).outerWidth();
					content.width.half  = Math.ceil( content.width.full/2 );

					$content.css({'height' : content.height.full + 'px' });

					wrapper_height = parseInt( $content.outerHeight() );

					$wrapper.css({
						'top'         : '50%',
						'height'      : wrapper_height + 'px!important',
						'margin-left' : '-' + content.width.half + 'px',
						'margin-top'  : '-' + content.height.half + 'px',
						'display'     : 'none',
						'visibility'  : 'visible'
					});
					
					$wrapper.fadeIn('fast', function() {
						if ( options.focus_first ) {
							methods.focus_first();
						}
					});
			
					if ( !options.is_modal ) {
						// Set bind to Esc key for closing the alert
						$(document).unbind('keyup');
						$(document).bind('keyup',function(event) {
							if(event.keyCode == 27){
								$.modal('close');
							}
						});

						$('#' + settings.ids.dim).click(function(event) {
							_desired_id = $(this).attr('id');
							if (event.target.id == _desired_id) {
								$.modal('close');
							}
						});
					}
					
					if ( typeof(options.on_display) == 'function' ) {
						options.on_display(ui);
					}
					
				});
			},300);
			
			return false;
			
		},
		/*
		*
		* END: display 
		*
		****** */




		/* ******
		*
		* Sets focus on the first input/select element in the $.modal modal 
		*
		*/
		focus_first : function() {
			var elem = $('#' + settings.ids.content).find('input:visible', this).get(0);
			var select = $('#' + settings.ids.content).find('select:visible', this).get(0);
			if (select && elem) {
				if (select.offsetTop < elem.offsetTop) {
					elem = select;
				}
			}
			var textarea = $('#' + settings.ids.content).find('textarea:visible', this).get(0);
			if (textarea && elem) {
				if (textarea.offsetTop < elem.offsetTop) {
					elem = textarea;
				}
			}

			if (elem) {
				elem.focus();
			}
			return this;
		},
		/*
		*
		* END: focus_first 
		*
		****** */




		/* ******
		* 
		* Closes the $.modal modal 
		*
		*/
		close : function() {
			var $dim = $('#' + settings.ids.dim);
			$dim.fadeOut('fast',function() {
				scroll_to = $('body').css('margin-top');
				scroll_to = Math.abs(parseInt(scroll_to));

				if ( $('body').outerHeight() > $(window).height() ) {
					$('body').css({
						'overflow' : '',
						'margin' : $this.body_margin
					});
				} else {
					$('body').css({
						'overflow' : ''
					});
				}
				
				window.scrollTo(0,$this.window_yoffset);

				$('#' + settings.ids.content).html('').remove();
				$('#' + settings.ids.wrapper).html('').remove();
				$dim.html('').remove();
				if ( typeof (options.callback) == 'function' ) {
					options.callback.call();
				} else if ( typeof ( options.on_close) == 'function' ) {
					options.on_close.call();
				}

				for (var prop in options ) {
					options[prop] = null;
				}
			});
		},
		/* 
		*
		* END: Close
		*
		****** */




		/* ******
		*
		* Displays a message in the existing $.modal modal
		* This will slide down the current $.modal modal content
		* and display the custom message.
		*
		* Used for things such as login error messages, form validation errors, etc.
		*
		*/
		display_message : function( objOptions ) {

			if ( typeof(objOptions.button) == 'undefined' ) {
				options.button = { display : true };
			}

			methods.init(objOptions);

			var modal_form    = $('#modal-message-content');
			var form_elements = modal_form.find('#form-elements');
			var form_buttons  = modal_form.find('.buttons');
			var alert_message = modal_form.find('#modal-message');
			
			if ( alert_message.length <= 0 ) {
				modal_form.find('header').after('<div id="modal-message"></div>');
				var alert_message = modal_form.find('#modal-message');
			}


			var form_height = parseInt(form_elements.outerHeight());

			alert_message.html(options.message);
			
			var modal_width = modal_form.width();

			alert_message.css({
				'width'     : modal_width + 'px'
			});

			buttonText = 'try again';
			if ( typeof options.button.text != 'undefined' ) {
				buttonText = options.button.text;
			}
			options.button.close = '<p class="buttons"><input type="button" value="' + buttonText + '" name="close-modal-message" id="close-modal-message" class="ui-button normal" /></p>';


			if ( options.button.display === false ) {
				options.button.close = '';
			}

			alert_message.append(options.button.close);


			alert_message.find('section').css({ 'height' : form_height + 'px', 'width' : modal_width + 'px' });
			
			alert_message.slideDown('fast',function() {

				methods.bind_return_key();

				var close_message = alert_message.find('#close-modal-message');
				close_message.focus();

				form_elements.css({ 'display' : 'none' });
				form_buttons.css({ 'display' : 'none' });

				if ( typeof options.button.callback == 'function' ) {
					alert_message.find('#close-modal-message').unbind('click').bind('click', function() {
						options.button.callback();
					});

				} else {
					close_message.click(function() {
						form_elements.css({ 'display' : 'block' });
						form_buttons.css({ 'display' : 'block' });
						alert_message.slideUp('fast', function() {
							alert_message.html('');
							methods.bind_return_key(true);
							methods.focus_first();
						});
					});
				}
					
				if ( typeof(options.callback) == 'function' ) {
					options.callback.call();
				}
			});
		},
		/*
		*
		* END: display_message
		*
		****** */




		/* ******
		*
		* Adds an event listener to catch the return/enter key press
		* It will trigger the click event on the first button found
		*
		*/
		bind_return_key : function(bind) {

			bind = typeof(bind)!='undefined' ? bind : false;
			var modal_form    = $('#modal-message-content');
			var form_buttons  = modal_form.find('.buttons');
			var alert_message = modal_form.find('#modal-message');

			$(document).unbind('keyup');
			
			if ( bind ) {
				// Set bind to Esc key for closing the alert
				$(document).bind('keyup',function(event) {
					if(event.keyCode == 13) {
						var elem = false;
						var input_submit = form_buttons.find('input[type="submit"]').get(0);
						var input_button = form_buttons.find('input[type="button"]').get(0);
						var button       = form_buttons.find('button').get(0);

						has_input_submit = (typeof(input_submit)=='undefined') ? false : true;
						has_input_button = (typeof(input_button)=='undefined') ? false : true;
						has_button       = (typeof(button)      =='undefined') ? false : true;
						
						elem = input_submit;

						if (has_input_button && !has_input_submit && !has_button ) {
							elem = input_button;
						}
						if (has_button && !has_input_button && !has_input_submit ) {
							elem = button;
						}
						if ( elem ) {
							elem.click();
						}
					}
				});
			}
		}
		/*
		*
		* END: bind_return_key
		*
		****** */


	};
	/*
	*
	* END: methods
	*
	****** */





	$.modal = function( method ) {

		// Method calling logic
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.display.apply( this, arguments );
		} else {
			return methods.display.apply(  this, arguments  );
		}

	};

})( jQuery );