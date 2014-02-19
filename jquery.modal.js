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
*	Display Simple Alert Modal:
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

/* ******
*
* Removes the filter attribute from a given DOM object.
* Filters remove font antialiasing in IE
*
****** */
(function($) {
     $.fn.removeFilter = function() {
        if ($.browser.msie) {
            x = this.get(0)
            x.style.removeAttribute("filter");
         }
     }
})(jQuery);



/* ******
*
* animates the Opacity of an object and automatically calls removeFilter()
*
****** */
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


/* ******
*
* $.modal() begin
*
****** */
(function( $ ) {
	
	var $this = $(this),
		ui = {},
		dimensions = {
			_window : { height  : { full : 0, half : 0 }, yOffset : 0 },
			page    : { yOffset : 0, height  : { full : 0, half : 0 } },
			dim     : { height : 0, padding: 0 },
			buttons : { height : 0 },
			content : {
				height  : { full: 0 , half  : 0 },
				width   : { full: 0 , half  : 0 },
				margin  : { top : 0 , bottom: 0 },
				padding : function() {
					padding = ui.wrapper.css('padding-top')
					(padding===null || padding.length === 0) ? 0 : parseInt(padding);
					return padding;
				}
			}
		},
		settings = {
			classes : {
				buttons : {
					cancel : 'ui-button cancel',
					normal : 'ui-button normal'
				},
				type : 'notice'
			},
			ids : {
				dim          : 'modal-message-dim',
				wrapper      : 'modal-message-overlay-wrapper',
				content      : 'modal-message-content',
				close_button : 'close_alert'
			},
			alertCloseTimeout : ''
		},
		default_options  = { header : '', message : '', type : 'notice'  };

	var methods = {

		defaults : { 
			text        : '',
			header      : '',
			message     : '',
			type        : 'notice',
			html        : '',
			focus_first : true,
			has_button  : true,
			is_modal    : false,
			callback    : null,
			on_display  : null,
			on_close    : null,
			url         : undefined,
			button      : { display : true, text : 'Ok', close : '' },
			ContentHTML : '<div id="' + settings.ids.dim + '"><ul class="bokeh"><li></li><li></li><li></li><li></li></ul>'
							+ '<div id="' + settings.ids.wrapper + '">'
							+ '<div id="' + settings.ids.content + '">'
							+ '    <header><h4>%%_HEADER_%%</h4></header>'
							+ '    <section id="modal-message"></section>'
							+ '    <section class="modal-form">%%_CONTENT_HTML_%%</section>'
							+ '</div>'
							+ '</div>'
							+ '</div>',
			MessageHTML : '<section><p>%%_MESSAGE_HTML_%%</p></section>',
			ButtonsHTML : '<p class="buttons">'
							+ '<input type="button" value="%%_CLOSE_BUTTON_TEXT_%%" id="CloseModal" />'
							+ '</p>',
			bokeh : '<ul class="bokeh"><li></li><li></li><li></li><li></li></ul>'
		},

		/* ******
		*
		* Loop through the options passed 
		*
		*/
		init : function(objOptions) {
			options  = default_options;
			defaults = this.defaults;

			if ( typeof(objOptions) == 'object' ) {
				for ( var property in objOptions ) {
					defaults[property] = objOptions[property];
				}
			}
			
			defaults.hasCallback = false;
			if ( typeof defaults.callback == 'function' ) {
				defaults.hasCallback = true;
			}
			options = defaults;

			return options;

		},
		/*
		*
		* END: init 
		*
		****** */




		setUIElements : function() {
			ui.dim     = $('#' + settings.ids.dim);
			ui.wrapper = $('#' + settings.ids.wrapper);
			ui.content = $('#' + settings.ids.content);
			ui.header  = ui.content.find('header> h4');
			ui.form    = ui.content.find('.modal-form');
			ui.buttons = ui.content.find('.buttons');
			ui.message = ui.content.find('#modal-message');
			ui.bokeh   = ui.dim.find('.bokeh').eq(0);
			ui.closeP = $('#modal-message-close-p');
			return ui;
		},





		setDimensions : function(type) {

			switch(type) {
				case "window" :
					dimensions._window.height.full = parseInt($(window).height());
					dimensions._window.height.half = Math.ceil(dimensions._window.height.full/2);
					dimensions._window.yOffset     = window.pageYOffset;
					break;

				case "page" :
					dimensions.page.height  = parseInt($('html').outerHeight());
					break;

				case "dim" :
					dimensions.dim.height  = dimensions.page.height+dimensions._window.yOffset;
					break;

				case "content" :
					dimensions.content.padding = ui.wrapper.css('padding-top');
					dimensions.content.padding = (dimensions.content.padding===null || dimensions.content.padding.length === 0) ? 0 : parseInt(dimensions.content.padding);

					dimensions.content.height.full = parseInt( ui.content.outerHeight() ) + dimensions.content.padding;
					dimensions.content.height.half = Math.ceil( (dimensions.content.height.full/2)+dimensions.content.padding );

					dimensions.content.width.full  = ui.content.outerWidth();
					dimensions.content.width.half  = Math.ceil( dimensions.content.width.full/2 );
					break;

				case "buttons" :
					dimensions.buttons.height = parseInt(ui.buttons.outerHeight());
					break;
			}
			
			return dimensions;

		},




		/* ******
		*
		* Get the basic HTML of the alert modal
		*
		*/
		get_html : function () {
			options = methods.init(methods.defaults);
			html = options.ContentHTML;
			return html;
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
			var self = this;

			var options = defaults;

			options = methods.init(objOptions);

			if ( typeof window['ModalCloseTimeout'] !== 'undefined' ) {
				window.clearTimeout(window['ModalCloseTimeout']);
			}

			if ( typeof(objOptions.button) == 'undefined' ) {
				options.button = { display : true, text : 'Ok' };
			}

			options.button.close = options.ButtonsHTML.replace(/%%_CLOSE_BUTTON_TEXT_%%/, options.button.text).replace(/%%_CANCEL_BUTTON_CLASS_%%/, settings.classes.buttons.cancel);

			if ( options.button.display === false ) {
				options.button.close = '';
			}

			//
			// Clear existing HTML and remove child elements
			$('#' + settings.ids.dim).html('');
			$('#' + settings.ids.dim).remove();
			$('#modal-message-content').html('');

			//
			// Set the HTML for the modal and append it to the body
			// If there's options.url passed, use the options.message property
			if ( typeof options.url === 'undefined' ) {
				$this.html = options.ContentHTML.replace(/%%_HEADER_%%/, options.header).replace(/%%_CONTENT_HTML_%%/, options.message + options.button.close);
			} else {
				$this.html = options.ContentHTML.replace(/%%_HEADER_%%/, options.header).replace(/%%_CONTENT_HTML_%%/, '');
			}

			$('body').prepend($this.html);

			ui = methods.setUIElements();

			ui.content.addClass(options.type);

			ui.content.find('input[type=button][value="Ok"]').addClass('ui-button solid normal');
			ui.content.find('input[type=button][value="Cancel"]').addClass('ui-button solid cancel');
			
			// Because the page height could be greater than the client height,
			// we want to disable scrolling of the client and set the modal
			// directly in the middle on the viewable area
			window.setTimeout(function(event) {

				// set dimensions for dimensions._window
				methods.setDimensions("window");

				$this.window_yoffset = dimensions._window.yOffset;

				// get the body's original margin so we can reset accordingly
				if ( typeof $this.body_margin == 'undefined' ) {
					$this.body_margin  = $('body').css('margin');
				}

				// get the body DOM element
				var $body = $('body');


				// to account for the scroll bar disappearing after the we remove it,
				// we need to adjust the padding-right so things don't shift around
				// also need to set overflow to hidden
				if ( $body.outerHeight() > $(window).height() ) {
					$body.css({ 'overflow' : 'hidden' , 'margin-right' : '18px' });
				} else {
					$body.css({ 'overflow' : 'hidden' });
				}

				// set dimensions for dimensions.page
				methods.setDimensions("page");

				ui.dim.css({
					'position'   : 'absolute',
					'height'     : $(document).height() + 'px',
					'width'      : '100%',
					'top'        : 0,
					'bottom'     : '0'
				});

				ui.bokeh.css({
					'top' : Math.floor($(window).height()/2)+parseInt($(window).scrollTop()) + 'px'
				});
				
				ui.wrapper.css('visibility','hidden');
				
				//
				//
				// after a half second delay (to give things time to draw),
				// add the event listeners to the reg/login content elements
				ui.dim.fadeIn(100, function() {

					if ( typeof options.url !== 'undefined' ) {
						data = $.ajax({
							type  : "GET",
							url   : options.url,
							async : false

						});
						options.message = data.responseText;
						$('#modal-message-content> .modal-form').html(options.message + options.button.close);						
						// ui.content = $('#' + settings.ids.content);
						ui.buttons = ui.content.find('.buttons');
						delete(options.url);
					}

					methods.setDimensions("content");
					methods.setDimensions("buttons");

					ui.content.css({'height' : dimensions.content.height.full+dimensions.buttons.height + 'px' });

					wrapper_height = parseInt( ui.content.outerHeight() );

					ui.wrapper.css({
						'position'    : 'absolute',
						'top'         : Math.floor($(window).height()/2)+parseInt($(window).scrollTop()) + 'px',
						'height'      : wrapper_height+dimensions.buttons.height + 'px!important',
						'margin-left' : '-' + dimensions.content.width.half + 'px',
						'margin-top'  : '-' + dimensions.content.height.half + 'px',
						'display'     : 'none',
						'visibility'  : 'visible',
						'width'       : dimensions.content.width.full+24 + 'px'
					});

					ui.bokeh.fadeOut(200, function(event) {
					
						ui.wrapper.fadeIn(300, function(event) {
							if ( options.focus_first ) {
								methods.focus_first();
								methods.bind_return_key(true);
							}

							ui.content.find('#CloseModal').unbind('click').bind('click', function() {
								window.clearTimeout(window['ModalCloseTimeout']);
								$.modal('close');
							});

							if ( typeof options.after_display == 'function' ) {
								options.after_display(event, ui);
							}

							if ( typeof options.timeout !== 'undefined' ) {
								window['ModalCloseTimeout'] = window.setTimeout(function() { $.modal('close'); }, options.timeout);
							}

						});

						if ( !options.is_modal ) {
							// Set bind to Esc key for closing the alert
							$(document)
								.unbind('keypress')
								.bind('keypress', function(event) {
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
							options.on_display(event, ui);
						}

					});
					
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
			var self   = this,
				ui     = methods.setUIElements(),
				elem   = ui.content.find('input:visible', this).get(0),
				select = ui.content.find('select:visible', this).get(0);

			if (select && elem) {
				if (select.offsetTop < elem.offsetTop) {
					elem = select;
				}
			}
			var textarea = ui.content.find('textarea:visible', this).get(0);
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
		close : function(objOptions) {
			var self = this,
				options = methods.init(objOptions, {
					callback : undefined
				}),
				ui = methods.setUIElements();

			window.clearTimeout(window['ModalCloseTimeout']);
			
			if ( typeof window['ModalCloseTimeout'] !== 'undefined' ) {
				window.clearTimeout(window['ModalCloseTimeout']);
			}
			

			ui.dim.fadeOut(100,function() {
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
				ui.dim.html('').remove();
				if ( typeof (options.callback) == 'function' ) {
					options.callback.call();
				} else if ( typeof ( options.on_close) == 'function' ) {
					options.on_close.call();
				}
					
				if ( typeof(options.on_close) == 'function' ) {
					options.on_close();
				}

				// for (var prop in options ) {
				// 	options[prop] = null;
				// }
			});

		},
		/* 
		*
		* END: Close
		*
		****** */




		redraw : function(options) {
			var self = methods,
				options = self.init(options),
				ui = self.setUIElements(),
				ExistingHeight,
				NewHeight;

			// DOM
			// ModalWrapper = $('#modal-message-overlay-wrapper');
			// ModalContent = $('#modal-message-content');
			// Buttons      = ui.content.find('.buttons');

			// get existing height of modal
			ExistingHeight = ui.content[0].scrollHeight;

			// set buttons position to relative and remove bottom position
			ui.buttons.css({
				'position' : 'relative',
				'bottom'   : ''
			});

			// remove content style attribute so height is elastic
			ui.content.removeAttr('style');

			// get new height after it adjusts
			NewHeight = ui.content[0].scrollHeight;
			ButtonHeight = (ui.closeP.length > 0) ? ui.closeP[0].scrollHeight : 0;

			// set the height of content so it stays
			ui.content.css({ 'height' : (NewHeight+ButtonHeight) + 'px' });

			// set button position to absolute and position at bottom
			ui.buttons.css({
				'position' : 'absolute',
				'bottom'   : '0'
			});

		},




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
			var ui = methods.setUIElements();

			window.clearTimeout(window['ModalCloseTimeout']);

			var defaults = methods.defaults;
			DMoptions = default_options;

			if ( objOptions instanceof Object && !objOptions.hasOwnProperty('button') ) {
				DMoptions.button = { display : true };
			}

			if ( typeof(objOptions) == 'object' ) {
				for ( var property in objOptions ) {
					DMoptions[property] = objOptions[property];
				}
			}
			
			DMoptions.hasCallback = false;
			if ( typeof DMoptions.callback == 'function' ) {
				DMoptions.hasCallback = true;
			}
			
			// var ui.content     = $('#modal-message-content');
			var Header        = ui.content.find('header> h4');
			// var ui.form  = ui.content.find('.modal-form');
			var FormButtons   = ui.content.find('.buttons');
			// var ui.message  = ui.content.find('#modal-message');

			//
			// Add an empty alert message element
			ui.message.html(DMoptions.message);

			if ( DMoptions.hasOwnProperty('type') ) {
				ui.message.addClass(DMoptions.type);
			}

			// var ui.message   = ui.content.find('#modal-message');

			if ( DMoptions.hasOwnProperty('header') && DMoptions.header != '' ) {
				var OldHeaderText = ui.header.text();
				this.OldHeaderText = OldHeaderText;
				ui.header.text(DMoptions.header);
			}

			buttonText = 'Try Again';
			if ( typeof DMoptions.button.text != 'undefined' ) {
				buttonText = DMoptions.button.text;
			}
			DMoptions.button.close = '<p id="modal-message-close-p" class="buttons"><input type="button" value="' + buttonText + '" name="CloseModalMessage" id="CloseModalMessage" class="ui-button normal" /></p>';


			if ( typeof DMoptions.button.html != 'undefined' ) {
				DMoptions.button.close = '<p id="modal-message-close-p" class="buttons">' + DMoptions.button.html + '</p>';
			}

			if ( DMoptions.button.display === false ) {
				DMoptions.button.close = '';
			}

			ui.content.append(DMoptions.button.close);

			var FormHeight     = parseInt(ui.form.outerHeight());
			var HeaderHeight   = parseInt(ui.header.outerHeight());
			var ButtonsHeight  = ( DMoptions.button.display === false ) ? ui.buttons.outerHeight() : parseInt($('#modal-message-close-p').outerHeight());

			FormHeight = FormHeight+ButtonsHeight;

			//ui.message.html(DMoptions.message);
			
			var modal_width = ui.content.width();

			ui.message.css({
				'width' : modal_width + 'px'
			});


			ui.message.find('section').eq(0).css({ 'height' : FormHeight + 'px', 'width' : modal_width + 'px' });
			
			ui.form.fadeOut(150, function() {

				ui.message.fadeIn(150,function() {

					methods.bind_return_key();

					methods.redraw();

					var CloseMessage = ui.content.find('#CloseModalMessage');
					CloseMessage.focus();

					if ( typeof DMoptions.button.callback == 'function' ) {
						CloseMessage.unbind('click').bind('click', function() {
							DMoptions.button.callback(event, ui);
						});

					} else {
						CloseMessage.unbind('click').on('click', function() {
							methods.close_message(objOptions);

						});
						// CloseMessage.click(function() {
						// 	$('#modal-message-close-p').fadeOut(150);
						// 	Header.html(OldHeaderText);
						// 	ui.message.fadeOut(150, function() {
						// 		FormElements.fadeIn(150, function() {
						// 			ui.message.html('');
						// 			FormElements.focus_first();
						// 			$('#modal-message-close-p').remove();
						// 			methods.bind_return_key(true);
						// 		});
						// 	}).attr('class', '');
						// });
					}
						
					if ( typeof(DMoptions.callback) == 'function' ) {
						DMoptions.callback(event, ui);
					}

					if ( DMoptions.hasOwnProperty('timeout') ) {
						window['ModalCloseTimeout'] = window.setTimeout(function() { $.modal('close') }, DMoptions.timeout);
					}

				});// End: ui.message Fade In

			}); // End: FormElements Fade Out
		},
		/*
		*
		* END: display_message 
		*
		****** */




		/* ******
		* 
		* Closes the display_message form 
		*
		*/
		close_message : function(objOptions) {
			options = methods.init(objOptions);

			var ui = methods.setUIElements();
			
			// var ModalForm     = $('#modal-message-content');
			// var Header        = ModalForm.find('header> h4');
			// var FormElements  = ModalForm.find('.modal-form');
			// var FormButtons   = ModalForm.find('.buttons');
			// var AlertMessage  = ModalForm.find('#modal-message');

			ui.closeP.fadeOut(150);
			ui.header.html(this.OldHeaderText);
			ui.message.fadeOut(150, function() {
				ui.form.fadeIn(150, function() {
					ui.message.html('');
					ui.form.focus_first();
					ui.closeP.remove();
					methods.bind_return_key(true);
					methods.redraw();
				});
			}).attr('class', '');
		},
		/*
		*
		* END: close_message
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

						has_input_submit = (typeof(input_submit)==='undefined') ? false : true;
						has_input_button = (typeof(input_button)==='undefined') ? false : true;
						has_button       = (typeof(button)      ==='undefined') ? false : true;
						
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
		},
		/*
		*
		* END: bind_return_key
		*
		****** */



		is_visible : function( objOptions ) {

			options = methods.init(objOptions);

			return ( $('#modal-message-content').length > 0 );

		}


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