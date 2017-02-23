/*! jQuery UI - v1.12.1 - 2016-12-18
* http://jqueryui.com
* Includes: widget.js, position.js, keycode.js, unique-id.js, widgets/autocomplete.js, widgets/menu.js
* Copyright jQuery Foundation and other contributors; Licensed MIT */

(function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define([ "jquery" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}(function( $ ) {

$.ui = $.ui || {};

var version = $.ui.version = "1.12.1";


/*!
 * jQuery UI Widget 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Widget
//>>group: Core
//>>description: Provides a factory for creating stateful widgets with a common API.
//>>docs: http://api.jqueryui.com/jQuery.widget/
//>>demos: http://jqueryui.com/widget/



var widgetUuid = 0;
var widgetSlice = Array.prototype.slice;

$.cleanData = ( function( orig ) {
	return function( elems ) {
		var events, elem, i;
		for ( i = 0; ( elem = elems[ i ] ) != null; i++ ) {
			try {

				// Only trigger remove when necessary to save time
				events = $._data( elem, "events" );
				if ( events && events.remove ) {
					$( elem ).triggerHandler( "remove" );
				}

			// Http://bugs.jquery.com/ticket/8235
			} catch ( e ) {}
		}
		orig( elems );
	};
} )( $.cleanData );

$.widget = function( name, base, prototype ) {
	var existingConstructor, constructor, basePrototype;

	// ProxiedPrototype allows the provided prototype to remain unmodified
	// so that it can be used as a mixin for multiple widgets (#8876)
	var proxiedPrototype = {};

	var namespace = name.split( "." )[ 0 ];
	name = name.split( "." )[ 1 ];
	var fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	if ( $.isArray( prototype ) ) {
		prototype = $.extend.apply( null, [ {} ].concat( prototype ) );
	}

	// Create selector for plugin
	$.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
		return !!$.data( elem, fullName );
	};

	$[ namespace ] = $[ namespace ] || {};
	existingConstructor = $[ namespace ][ name ];
	constructor = $[ namespace ][ name ] = function( options, element ) {

		// Allow instantiation without "new" keyword
		if ( !this._createWidget ) {
			return new constructor( options, element );
		}

		// Allow instantiation without initializing for simple inheritance
		// must use "new" keyword (the code above always passes args)
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};

	// Extend with the existing constructor to carry over any static properties
	$.extend( constructor, existingConstructor, {
		version: prototype.version,

		// Copy the object used to create the prototype in case we need to
		// redefine the widget later
		_proto: $.extend( {}, prototype ),

		// Track widgets that inherit from this widget in case this widget is
		// redefined after a widget inherits from it
		_childConstructors: []
	} );

	basePrototype = new base();

	// We need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
	basePrototype.options = $.widget.extend( {}, basePrototype.options );
	$.each( prototype, function( prop, value ) {
		if ( !$.isFunction( value ) ) {
			proxiedPrototype[ prop ] = value;
			return;
		}
		proxiedPrototype[ prop ] = ( function() {
			function _super() {
				return base.prototype[ prop ].apply( this, arguments );
			}

			function _superApply( args ) {
				return base.prototype[ prop ].apply( this, args );
			}

			return function() {
				var __super = this._super;
				var __superApply = this._superApply;
				var returnValue;

				this._super = _super;
				this._superApply = _superApply;

				returnValue = value.apply( this, arguments );

				this._super = __super;
				this._superApply = __superApply;

				return returnValue;
			};
		} )();
	} );
	constructor.prototype = $.widget.extend( basePrototype, {

		// TODO: remove support for widgetEventPrefix
		// always use the name + a colon as the prefix, e.g., draggable:start
		// don't prefix for widgets that aren't DOM-based
		widgetEventPrefix: existingConstructor ? ( basePrototype.widgetEventPrefix || name ) : name
	}, proxiedPrototype, {
		constructor: constructor,
		namespace: namespace,
		widgetName: name,
		widgetFullName: fullName
	} );

	// If this widget is being redefined then we need to find all widgets that
	// are inheriting from it and redefine all of them so that they inherit from
	// the new version of this widget. We're essentially trying to replace one
	// level in the prototype chain.
	if ( existingConstructor ) {
		$.each( existingConstructor._childConstructors, function( i, child ) {
			var childPrototype = child.prototype;

			// Redefine the child widget using the same prototype that was
			// originally used, but inherit from the new version of the base
			$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor,
				child._proto );
		} );

		// Remove the list of existing child constructors from the old constructor
		// so the old child constructors can be garbage collected
		delete existingConstructor._childConstructors;
	} else {
		base._childConstructors.push( constructor );
	}

	$.widget.bridge( name, constructor );

	return constructor;
};

$.widget.extend = function( target ) {
	var input = widgetSlice.call( arguments, 1 );
	var inputIndex = 0;
	var inputLength = input.length;
	var key;
	var value;

	for ( ; inputIndex < inputLength; inputIndex++ ) {
		for ( key in input[ inputIndex ] ) {
			value = input[ inputIndex ][ key ];
			if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {

				// Clone objects
				if ( $.isPlainObject( value ) ) {
					target[ key ] = $.isPlainObject( target[ key ] ) ?
						$.widget.extend( {}, target[ key ], value ) :

						// Don't extend strings, arrays, etc. with objects
						$.widget.extend( {}, value );

				// Copy everything else by reference
				} else {
					target[ key ] = value;
				}
			}
		}
	}
	return target;
};

$.widget.bridge = function( name, object ) {
	var fullName = object.prototype.widgetFullName || name;
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string";
		var args = widgetSlice.call( arguments, 1 );
		var returnValue = this;

		if ( isMethodCall ) {

			// If this is an empty collection, we need to have the instance method
			// return undefined instead of the jQuery instance
			if ( !this.length && options === "instance" ) {
				returnValue = undefined;
			} else {
				this.each( function() {
					var methodValue;
					var instance = $.data( this, fullName );

					if ( options === "instance" ) {
						returnValue = instance;
						return false;
					}

					if ( !instance ) {
						return $.error( "cannot call methods on " + name +
							" prior to initialization; " +
							"attempted to call method '" + options + "'" );
					}

					if ( !$.isFunction( instance[ options ] ) || options.charAt( 0 ) === "_" ) {
						return $.error( "no such method '" + options + "' for " + name +
							" widget instance" );
					}

					methodValue = instance[ options ].apply( instance, args );

					if ( methodValue !== instance && methodValue !== undefined ) {
						returnValue = methodValue && methodValue.jquery ?
							returnValue.pushStack( methodValue.get() ) :
							methodValue;
						return false;
					}
				} );
			}
		} else {

			// Allow multiple hashes to be passed on init
			if ( args.length ) {
				options = $.widget.extend.apply( null, [ options ].concat( args ) );
			}

			this.each( function() {
				var instance = $.data( this, fullName );
				if ( instance ) {
					instance.option( options || {} );
					if ( instance._init ) {
						instance._init();
					}
				} else {
					$.data( this, fullName, new object( options, this ) );
				}
			} );
		}

		return returnValue;
	};
};

$.Widget = function( /* options, element */ ) {};
$.Widget._childConstructors = [];

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	defaultElement: "<div>",

	options: {
		classes: {},
		disabled: false,

		// Callbacks
		create: null
	},

	_createWidget: function( options, element ) {
		element = $( element || this.defaultElement || this )[ 0 ];
		this.element = $( element );
		this.uuid = widgetUuid++;
		this.eventNamespace = "." + this.widgetName + this.uuid;

		this.bindings = $();
		this.hoverable = $();
		this.focusable = $();
		this.classesElementLookup = {};

		if ( element !== this ) {
			$.data( element, this.widgetFullName, this );
			this._on( true, this.element, {
				remove: function( event ) {
					if ( event.target === element ) {
						this.destroy();
					}
				}
			} );
			this.document = $( element.style ?

				// Element within the document
				element.ownerDocument :

				// Element is window or document
				element.document || element );
			this.window = $( this.document[ 0 ].defaultView || this.document[ 0 ].parentWindow );
		}

		this.options = $.widget.extend( {},
			this.options,
			this._getCreateOptions(),
			options );

		this._create();

		if ( this.options.disabled ) {
			this._setOptionDisabled( this.options.disabled );
		}

		this._trigger( "create", null, this._getCreateEventData() );
		this._init();
	},

	_getCreateOptions: function() {
		return {};
	},

	_getCreateEventData: $.noop,

	_create: $.noop,

	_init: $.noop,

	destroy: function() {
		var that = this;

		this._destroy();
		$.each( this.classesElementLookup, function( key, value ) {
			that._removeClass( value, key );
		} );

		// We can probably remove the unbind calls in 2.0
		// all event bindings should go through this._on()
		this.element
			.off( this.eventNamespace )
			.removeData( this.widgetFullName );
		this.widget()
			.off( this.eventNamespace )
			.removeAttr( "aria-disabled" );

		// Clean up events and states
		this.bindings.off( this.eventNamespace );
	},

	_destroy: $.noop,

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key;
		var parts;
		var curOption;
		var i;

		if ( arguments.length === 0 ) {

			// Don't return a reference to the internal hash
			return $.widget.extend( {}, this.options );
		}

		if ( typeof key === "string" ) {

			// Handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
			options = {};
			parts = key.split( "." );
			key = parts.shift();
			if ( parts.length ) {
				curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
				for ( i = 0; i < parts.length - 1; i++ ) {
					curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
					curOption = curOption[ parts[ i ] ];
				}
				key = parts.pop();
				if ( arguments.length === 1 ) {
					return curOption[ key ] === undefined ? null : curOption[ key ];
				}
				curOption[ key ] = value;
			} else {
				if ( arguments.length === 1 ) {
					return this.options[ key ] === undefined ? null : this.options[ key ];
				}
				options[ key ] = value;
			}
		}

		this._setOptions( options );

		return this;
	},

	_setOptions: function( options ) {
		var key;

		for ( key in options ) {
			this._setOption( key, options[ key ] );
		}

		return this;
	},

	_setOption: function( key, value ) {
		if ( key === "classes" ) {
			this._setOptionClasses( value );
		}

		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this._setOptionDisabled( value );
		}

		return this;
	},

	_setOptionClasses: function( value ) {
		var classKey, elements, currentElements;

		for ( classKey in value ) {
			currentElements = this.classesElementLookup[ classKey ];
			if ( value[ classKey ] === this.options.classes[ classKey ] ||
					!currentElements ||
					!currentElements.length ) {
				continue;
			}

			// We are doing this to create a new jQuery object because the _removeClass() call
			// on the next line is going to destroy the reference to the current elements being
			// tracked. We need to save a copy of this collection so that we can add the new classes
			// below.
			elements = $( currentElements.get() );
			this._removeClass( currentElements, classKey );

			// We don't use _addClass() here, because that uses this.options.classes
			// for generating the string of classes. We want to use the value passed in from
			// _setOption(), this is the new value of the classes option which was passed to
			// _setOption(). We pass this value directly to _classes().
			elements.addClass( this._classes( {
				element: elements,
				keys: classKey,
				classes: value,
				add: true
			} ) );
		}
	},

	_setOptionDisabled: function( value ) {
		this._toggleClass( this.widget(), this.widgetFullName + "-disabled", null, !!value );

		// If the widget is becoming disabled, then nothing is interactive
		if ( value ) {
			this._removeClass( this.hoverable, null, "ui-state-hover" );
			this._removeClass( this.focusable, null, "ui-state-focus" );
		}
	},

	enable: function() {
		return this._setOptions( { disabled: false } );
	},

	disable: function() {
		return this._setOptions( { disabled: true } );
	},

	_classes: function( options ) {
		var full = [];
		var that = this;

		options = $.extend( {
			element: this.element,
			classes: this.options.classes || {}
		}, options );

		function processClassString( classes, checkOption ) {
			var current, i;
			for ( i = 0; i < classes.length; i++ ) {
				current = that.classesElementLookup[ classes[ i ] ] || $();
				if ( options.add ) {
					current = $( $.unique( current.get().concat( options.element.get() ) ) );
				} else {
					current = $( current.not( options.element ).get() );
				}
				that.classesElementLookup[ classes[ i ] ] = current;
				full.push( classes[ i ] );
				if ( checkOption && options.classes[ classes[ i ] ] ) {
					full.push( options.classes[ classes[ i ] ] );
				}
			}
		}

		this._on( options.element, {
			"remove": "_untrackClassesElement"
		} );

		if ( options.keys ) {
			processClassString( options.keys.match( /\S+/g ) || [], true );
		}
		if ( options.extra ) {
			processClassString( options.extra.match( /\S+/g ) || [] );
		}

		return full.join( " " );
	},

	_untrackClassesElement: function( event ) {
		var that = this;
		$.each( that.classesElementLookup, function( key, value ) {
			if ( $.inArray( event.target, value ) !== -1 ) {
				that.classesElementLookup[ key ] = $( value.not( event.target ).get() );
			}
		} );
	},

	_removeClass: function( element, keys, extra ) {
		return this._toggleClass( element, keys, extra, false );
	},

	_addClass: function( element, keys, extra ) {
		return this._toggleClass( element, keys, extra, true );
	},

	_toggleClass: function( element, keys, extra, add ) {
		add = ( typeof add === "boolean" ) ? add : extra;
		var shift = ( typeof element === "string" || element === null ),
			options = {
				extra: shift ? keys : extra,
				keys: shift ? element : keys,
				element: shift ? this.element : element,
				add: add
			};
		options.element.toggleClass( this._classes( options ), add );
		return this;
	},

	_on: function( suppressDisabledCheck, element, handlers ) {
		var delegateElement;
		var instance = this;

		// No suppressDisabledCheck flag, shuffle arguments
		if ( typeof suppressDisabledCheck !== "boolean" ) {
			handlers = element;
			element = suppressDisabledCheck;
			suppressDisabledCheck = false;
		}

		// No element argument, shuffle and use this.element
		if ( !handlers ) {
			handlers = element;
			element = this.element;
			delegateElement = this.widget();
		} else {
			element = delegateElement = $( element );
			this.bindings = this.bindings.add( element );
		}

		$.each( handlers, function( event, handler ) {
			function handlerProxy() {

				// Allow widgets to customize the disabled handling
				// - disabled as an array instead of boolean
				// - disabled class as method for disabling individual parts
				if ( !suppressDisabledCheck &&
						( instance.options.disabled === true ||
						$( this ).hasClass( "ui-state-disabled" ) ) ) {
					return;
				}
				return ( typeof handler === "string" ? instance[ handler ] : handler )
					.apply( instance, arguments );
			}

			// Copy the guid so direct unbinding works
			if ( typeof handler !== "string" ) {
				handlerProxy.guid = handler.guid =
					handler.guid || handlerProxy.guid || $.guid++;
			}

			var match = event.match( /^([\w:-]*)\s*(.*)$/ );
			var eventName = match[ 1 ] + instance.eventNamespace;
			var selector = match[ 2 ];

			if ( selector ) {
				delegateElement.on( eventName, selector, handlerProxy );
			} else {
				element.on( eventName, handlerProxy );
			}
		} );
	},

	_off: function( element, eventName ) {
		eventName = ( eventName || "" ).split( " " ).join( this.eventNamespace + " " ) +
			this.eventNamespace;
		element.off( eventName ).off( eventName );

		// Clear the stack to avoid memory leaks (#10056)
		this.bindings = $( this.bindings.not( element ).get() );
		this.focusable = $( this.focusable.not( element ).get() );
		this.hoverable = $( this.hoverable.not( element ).get() );
	},

	_delay: function( handler, delay ) {
		function handlerProxy() {
			return ( typeof handler === "string" ? instance[ handler ] : handler )
				.apply( instance, arguments );
		}
		var instance = this;
		return setTimeout( handlerProxy, delay || 0 );
	},

	_hoverable: function( element ) {
		this.hoverable = this.hoverable.add( element );
		this._on( element, {
			mouseenter: function( event ) {
				this._addClass( $( event.currentTarget ), null, "ui-state-hover" );
			},
			mouseleave: function( event ) {
				this._removeClass( $( event.currentTarget ), null, "ui-state-hover" );
			}
		} );
	},

	_focusable: function( element ) {
		this.focusable = this.focusable.add( element );
		this._on( element, {
			focusin: function( event ) {
				this._addClass( $( event.currentTarget ), null, "ui-state-focus" );
			},
			focusout: function( event ) {
				this._removeClass( $( event.currentTarget ), null, "ui-state-focus" );
			}
		} );
	},

	_trigger: function( type, event, data ) {
		var prop, orig;
		var callback = this.options[ type ];

		data = data || {};
		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();

		// The original event may come from any element
		// so we need to reset the target on the new event
		event.target = this.element[ 0 ];

		// Copy original event properties over to the new event
		orig = event.originalEvent;
		if ( orig ) {
			for ( prop in orig ) {
				if ( !( prop in event ) ) {
					event[ prop ] = orig[ prop ];
				}
			}
		}

		this.element.trigger( event, data );
		return !( $.isFunction( callback ) &&
			callback.apply( this.element[ 0 ], [ event ].concat( data ) ) === false ||
			event.isDefaultPrevented() );
	}
};

$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
	$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
		if ( typeof options === "string" ) {
			options = { effect: options };
		}

		var hasOptions;
		var effectName = !options ?
			method :
			options === true || typeof options === "number" ?
				defaultEffect :
				options.effect || defaultEffect;

		options = options || {};
		if ( typeof options === "number" ) {
			options = { duration: options };
		}

		hasOptions = !$.isEmptyObject( options );
		options.complete = callback;

		if ( options.delay ) {
			element.delay( options.delay );
		}

		if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
			element[ method ]( options );
		} else if ( effectName !== method && element[ effectName ] ) {
			element[ effectName ]( options.duration, options.easing, callback );
		} else {
			element.queue( function( next ) {
				$( this )[ method ]();
				if ( callback ) {
					callback.call( element[ 0 ] );
				}
				next();
			} );
		}
	};
} );

var widget = $.widget;


/*!
 * jQuery UI Position 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/position/
 */

//>>label: Position
//>>group: Core
//>>description: Positions elements relative to other elements.
//>>docs: http://api.jqueryui.com/position/
//>>demos: http://jqueryui.com/position/


( function() {
var cachedScrollbarWidth,
	max = Math.max,
	abs = Math.abs,
	rhorizontal = /left|center|right/,
	rvertical = /top|center|bottom/,
	roffset = /[\+\-]\d+(\.[\d]+)?%?/,
	rposition = /^\w+/,
	rpercent = /%$/,
	_position = $.fn.position;

function getOffsets( offsets, width, height ) {
	return [
		parseFloat( offsets[ 0 ] ) * ( rpercent.test( offsets[ 0 ] ) ? width / 100 : 1 ),
		parseFloat( offsets[ 1 ] ) * ( rpercent.test( offsets[ 1 ] ) ? height / 100 : 1 )
	];
}

function parseCss( element, property ) {
	return parseInt( $.css( element, property ), 10 ) || 0;
}

function getDimensions( elem ) {
	var raw = elem[ 0 ];
	if ( raw.nodeType === 9 ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: 0, left: 0 }
		};
	}
	if ( $.isWindow( raw ) ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: elem.scrollTop(), left: elem.scrollLeft() }
		};
	}
	if ( raw.preventDefault ) {
		return {
			width: 0,
			height: 0,
			offset: { top: raw.pageY, left: raw.pageX }
		};
	}
	return {
		width: elem.outerWidth(),
		height: elem.outerHeight(),
		offset: elem.offset()
	};
}

$.position = {
	scrollbarWidth: function() {
		if ( cachedScrollbarWidth !== undefined ) {
			return cachedScrollbarWidth;
		}
		var w1, w2,
			div = $( "<div " +
				"style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'>" +
				"<div style='height:100px;width:auto;'></div></div>" ),
			innerDiv = div.children()[ 0 ];

		$( "body" ).append( div );
		w1 = innerDiv.offsetWidth;
		div.css( "overflow", "scroll" );

		w2 = innerDiv.offsetWidth;

		if ( w1 === w2 ) {
			w2 = div[ 0 ].clientWidth;
		}

		div.remove();

		return ( cachedScrollbarWidth = w1 - w2 );
	},
	getScrollInfo: function( within ) {
		var overflowX = within.isWindow || within.isDocument ? "" :
				within.element.css( "overflow-x" ),
			overflowY = within.isWindow || within.isDocument ? "" :
				within.element.css( "overflow-y" ),
			hasOverflowX = overflowX === "scroll" ||
				( overflowX === "auto" && within.width < within.element[ 0 ].scrollWidth ),
			hasOverflowY = overflowY === "scroll" ||
				( overflowY === "auto" && within.height < within.element[ 0 ].scrollHeight );
		return {
			width: hasOverflowY ? $.position.scrollbarWidth() : 0,
			height: hasOverflowX ? $.position.scrollbarWidth() : 0
		};
	},
	getWithinInfo: function( element ) {
		var withinElement = $( element || window ),
			isWindow = $.isWindow( withinElement[ 0 ] ),
			isDocument = !!withinElement[ 0 ] && withinElement[ 0 ].nodeType === 9,
			hasOffset = !isWindow && !isDocument;
		return {
			element: withinElement,
			isWindow: isWindow,
			isDocument: isDocument,
			offset: hasOffset ? $( element ).offset() : { left: 0, top: 0 },
			scrollLeft: withinElement.scrollLeft(),
			scrollTop: withinElement.scrollTop(),
			width: withinElement.outerWidth(),
			height: withinElement.outerHeight()
		};
	}
};

$.fn.position = function( options ) {
	if ( !options || !options.of ) {
		return _position.apply( this, arguments );
	}

	// Make a copy, we don't want to modify arguments
	options = $.extend( {}, options );

	var atOffset, targetWidth, targetHeight, targetOffset, basePosition, dimensions,
		target = $( options.of ),
		within = $.position.getWithinInfo( options.within ),
		scrollInfo = $.position.getScrollInfo( within ),
		collision = ( options.collision || "flip" ).split( " " ),
		offsets = {};

	dimensions = getDimensions( target );
	if ( target[ 0 ].preventDefault ) {

		// Force left top to allow flipping
		options.at = "left top";
	}
	targetWidth = dimensions.width;
	targetHeight = dimensions.height;
	targetOffset = dimensions.offset;

	// Clone to reuse original targetOffset later
	basePosition = $.extend( {}, targetOffset );

	// Force my and at to have valid horizontal and vertical positions
	// if a value is missing or invalid, it will be converted to center
	$.each( [ "my", "at" ], function() {
		var pos = ( options[ this ] || "" ).split( " " ),
			horizontalOffset,
			verticalOffset;

		if ( pos.length === 1 ) {
			pos = rhorizontal.test( pos[ 0 ] ) ?
				pos.concat( [ "center" ] ) :
				rvertical.test( pos[ 0 ] ) ?
					[ "center" ].concat( pos ) :
					[ "center", "center" ];
		}
		pos[ 0 ] = rhorizontal.test( pos[ 0 ] ) ? pos[ 0 ] : "center";
		pos[ 1 ] = rvertical.test( pos[ 1 ] ) ? pos[ 1 ] : "center";

		// Calculate offsets
		horizontalOffset = roffset.exec( pos[ 0 ] );
		verticalOffset = roffset.exec( pos[ 1 ] );
		offsets[ this ] = [
			horizontalOffset ? horizontalOffset[ 0 ] : 0,
			verticalOffset ? verticalOffset[ 0 ] : 0
		];

		// Reduce to just the positions without the offsets
		options[ this ] = [
			rposition.exec( pos[ 0 ] )[ 0 ],
			rposition.exec( pos[ 1 ] )[ 0 ]
		];
	} );

	// Normalize collision option
	if ( collision.length === 1 ) {
		collision[ 1 ] = collision[ 0 ];
	}

	if ( options.at[ 0 ] === "right" ) {
		basePosition.left += targetWidth;
	} else if ( options.at[ 0 ] === "center" ) {
		basePosition.left += targetWidth / 2;
	}

	if ( options.at[ 1 ] === "bottom" ) {
		basePosition.top += targetHeight;
	} else if ( options.at[ 1 ] === "center" ) {
		basePosition.top += targetHeight / 2;
	}

	atOffset = getOffsets( offsets.at, targetWidth, targetHeight );
	basePosition.left += atOffset[ 0 ];
	basePosition.top += atOffset[ 1 ];

	return this.each( function() {
		var collisionPosition, using,
			elem = $( this ),
			elemWidth = elem.outerWidth(),
			elemHeight = elem.outerHeight(),
			marginLeft = parseCss( this, "marginLeft" ),
			marginTop = parseCss( this, "marginTop" ),
			collisionWidth = elemWidth + marginLeft + parseCss( this, "marginRight" ) +
				scrollInfo.width,
			collisionHeight = elemHeight + marginTop + parseCss( this, "marginBottom" ) +
				scrollInfo.height,
			position = $.extend( {}, basePosition ),
			myOffset = getOffsets( offsets.my, elem.outerWidth(), elem.outerHeight() );

		if ( options.my[ 0 ] === "right" ) {
			position.left -= elemWidth;
		} else if ( options.my[ 0 ] === "center" ) {
			position.left -= elemWidth / 2;
		}

		if ( options.my[ 1 ] === "bottom" ) {
			position.top -= elemHeight;
		} else if ( options.my[ 1 ] === "center" ) {
			position.top -= elemHeight / 2;
		}

		position.left += myOffset[ 0 ];
		position.top += myOffset[ 1 ];

		collisionPosition = {
			marginLeft: marginLeft,
			marginTop: marginTop
		};

		$.each( [ "left", "top" ], function( i, dir ) {
			if ( $.ui.position[ collision[ i ] ] ) {
				$.ui.position[ collision[ i ] ][ dir ]( position, {
					targetWidth: targetWidth,
					targetHeight: targetHeight,
					elemWidth: elemWidth,
					elemHeight: elemHeight,
					collisionPosition: collisionPosition,
					collisionWidth: collisionWidth,
					collisionHeight: collisionHeight,
					offset: [ atOffset[ 0 ] + myOffset[ 0 ], atOffset [ 1 ] + myOffset[ 1 ] ],
					my: options.my,
					at: options.at,
					within: within,
					elem: elem
				} );
			}
		} );

		if ( options.using ) {

			// Adds feedback as second argument to using callback, if present
			using = function( props ) {
				var left = targetOffset.left - position.left,
					right = left + targetWidth - elemWidth,
					top = targetOffset.top - position.top,
					bottom = top + targetHeight - elemHeight,
					feedback = {
						target: {
							element: target,
							left: targetOffset.left,
							top: targetOffset.top,
							width: targetWidth,
							height: targetHeight
						},
						element: {
							element: elem,
							left: position.left,
							top: position.top,
							width: elemWidth,
							height: elemHeight
						},
						horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
						vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
					};
				if ( targetWidth < elemWidth && abs( left + right ) < targetWidth ) {
					feedback.horizontal = "center";
				}
				if ( targetHeight < elemHeight && abs( top + bottom ) < targetHeight ) {
					feedback.vertical = "middle";
				}
				if ( max( abs( left ), abs( right ) ) > max( abs( top ), abs( bottom ) ) ) {
					feedback.important = "horizontal";
				} else {
					feedback.important = "vertical";
				}
				options.using.call( this, props, feedback );
			};
		}

		elem.offset( $.extend( position, { using: using } ) );
	} );
};

$.ui.position = {
	fit: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
				outerWidth = within.width,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = withinOffset - collisionPosLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
				newOverRight;

			// Element is wider than within
			if ( data.collisionWidth > outerWidth ) {

				// Element is initially over the left side of within
				if ( overLeft > 0 && overRight <= 0 ) {
					newOverRight = position.left + overLeft + data.collisionWidth - outerWidth -
						withinOffset;
					position.left += overLeft - newOverRight;

				// Element is initially over right side of within
				} else if ( overRight > 0 && overLeft <= 0 ) {
					position.left = withinOffset;

				// Element is initially over both left and right sides of within
				} else {
					if ( overLeft > overRight ) {
						position.left = withinOffset + outerWidth - data.collisionWidth;
					} else {
						position.left = withinOffset;
					}
				}

			// Too far left -> align with left edge
			} else if ( overLeft > 0 ) {
				position.left += overLeft;

			// Too far right -> align with right edge
			} else if ( overRight > 0 ) {
				position.left -= overRight;

			// Adjust based on position and margin
			} else {
				position.left = max( position.left - collisionPosLeft, position.left );
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
				outerHeight = data.within.height,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = withinOffset - collisionPosTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
				newOverBottom;

			// Element is taller than within
			if ( data.collisionHeight > outerHeight ) {

				// Element is initially over the top of within
				if ( overTop > 0 && overBottom <= 0 ) {
					newOverBottom = position.top + overTop + data.collisionHeight - outerHeight -
						withinOffset;
					position.top += overTop - newOverBottom;

				// Element is initially over bottom of within
				} else if ( overBottom > 0 && overTop <= 0 ) {
					position.top = withinOffset;

				// Element is initially over both top and bottom of within
				} else {
					if ( overTop > overBottom ) {
						position.top = withinOffset + outerHeight - data.collisionHeight;
					} else {
						position.top = withinOffset;
					}
				}

			// Too far up -> align with top
			} else if ( overTop > 0 ) {
				position.top += overTop;

			// Too far down -> align with bottom edge
			} else if ( overBottom > 0 ) {
				position.top -= overBottom;

			// Adjust based on position and margin
			} else {
				position.top = max( position.top - collisionPosTop, position.top );
			}
		}
	},
	flip: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.left + within.scrollLeft,
				outerWidth = within.width,
				offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = collisionPosLeft - offsetLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
				myOffset = data.my[ 0 ] === "left" ?
					-data.elemWidth :
					data.my[ 0 ] === "right" ?
						data.elemWidth :
						0,
				atOffset = data.at[ 0 ] === "left" ?
					data.targetWidth :
					data.at[ 0 ] === "right" ?
						-data.targetWidth :
						0,
				offset = -2 * data.offset[ 0 ],
				newOverRight,
				newOverLeft;

			if ( overLeft < 0 ) {
				newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth -
					outerWidth - withinOffset;
				if ( newOverRight < 0 || newOverRight < abs( overLeft ) ) {
					position.left += myOffset + atOffset + offset;
				}
			} else if ( overRight > 0 ) {
				newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset +
					atOffset + offset - offsetLeft;
				if ( newOverLeft > 0 || abs( newOverLeft ) < overRight ) {
					position.left += myOffset + atOffset + offset;
				}
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.top + within.scrollTop,
				outerHeight = within.height,
				offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = collisionPosTop - offsetTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
				top = data.my[ 1 ] === "top",
				myOffset = top ?
					-data.elemHeight :
					data.my[ 1 ] === "bottom" ?
						data.elemHeight :
						0,
				atOffset = data.at[ 1 ] === "top" ?
					data.targetHeight :
					data.at[ 1 ] === "bottom" ?
						-data.targetHeight :
						0,
				offset = -2 * data.offset[ 1 ],
				newOverTop,
				newOverBottom;
			if ( overTop < 0 ) {
				newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight -
					outerHeight - withinOffset;
				if ( newOverBottom < 0 || newOverBottom < abs( overTop ) ) {
					position.top += myOffset + atOffset + offset;
				}
			} else if ( overBottom > 0 ) {
				newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset +
					offset - offsetTop;
				if ( newOverTop > 0 || abs( newOverTop ) < overBottom ) {
					position.top += myOffset + atOffset + offset;
				}
			}
		}
	},
	flipfit: {
		left: function() {
			$.ui.position.flip.left.apply( this, arguments );
			$.ui.position.fit.left.apply( this, arguments );
		},
		top: function() {
			$.ui.position.flip.top.apply( this, arguments );
			$.ui.position.fit.top.apply( this, arguments );
		}
	}
};

} )();

var position = $.ui.position;


/*!
 * jQuery UI Keycode 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Keycode
//>>group: Core
//>>description: Provide keycodes as keynames
//>>docs: http://api.jqueryui.com/jQuery.ui.keyCode/


var keycode = $.ui.keyCode = {
	BACKSPACE: 8,
	COMMA: 188,
	DELETE: 46,
	DOWN: 40,
	END: 35,
	ENTER: 13,
	ESCAPE: 27,
	HOME: 36,
	LEFT: 37,
	PAGE_DOWN: 34,
	PAGE_UP: 33,
	PERIOD: 190,
	RIGHT: 39,
	SPACE: 32,
	TAB: 9,
	UP: 38
};


/*!
 * jQuery UI Unique ID 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: uniqueId
//>>group: Core
//>>description: Functions to generate and remove uniqueId's
//>>docs: http://api.jqueryui.com/uniqueId/



var uniqueId = $.fn.extend( {
	uniqueId: ( function() {
		var uuid = 0;

		return function() {
			return this.each( function() {
				if ( !this.id ) {
					this.id = "ui-id-" + ( ++uuid );
				}
			} );
		};
	} )(),

	removeUniqueId: function() {
		return this.each( function() {
			if ( /^ui-id-\d+$/.test( this.id ) ) {
				$( this ).removeAttr( "id" );
			}
		} );
	}
} );



var safeActiveElement = $.ui.safeActiveElement = function( document ) {
	var activeElement;

	// Support: IE 9 only
	// IE9 throws an "Unspecified error" accessing document.activeElement from an <iframe>
	try {
		activeElement = document.activeElement;
	} catch ( error ) {
		activeElement = document.body;
	}

	// Support: IE 9 - 11 only
	// IE may return null instead of an element
	// Interestingly, this only seems to occur when NOT in an iframe
	if ( !activeElement ) {
		activeElement = document.body;
	}

	// Support: IE 11 only
	// IE11 returns a seemingly empty object in some cases when accessing
	// document.activeElement from an <iframe>
	if ( !activeElement.nodeName ) {
		activeElement = document.body;
	}

	return activeElement;
};


/*!
 * jQuery UI Menu 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Menu
//>>group: Widgets
//>>description: Creates nestable menus.
//>>docs: http://api.jqueryui.com/menu/
//>>demos: http://jqueryui.com/menu/
//>>css.structure: ../../themes/base/core.css
//>>css.structure: ../../themes/base/menu.css
//>>css.theme: ../../themes/base/theme.css



var widgetsMenu = $.widget( "ui.menu", {
	version: "1.12.1",
	defaultElement: "<ul>",
	delay: 300,
	options: {
		icons: {
			submenu: "ui-icon-caret-1-e"
		},
		items: "> *",
		menus: "ul",
		position: {
			my: "left top",
			at: "right top"
		},
		role: "menu",

		// Callbacks
		blur: null,
		focus: null,
		select: null
	},

	_create: function() {
		this.activeMenu = this.element;

		// Flag used to prevent firing of the click handler
		// as the event bubbles up through nested menus
		this.mouseHandled = false;
		this.element
			.uniqueId()
			.attr( {
				role: this.options.role,
				tabIndex: 0
			} );

		this._addClass( "ui-menu", "ui-widget ui-widget-content" );
		this._on( {

			// Prevent focus from sticking to links inside menu after clicking
			// them (focus should always stay on UL during navigation).
			"mousedown .ui-menu-item": function( event ) {
				event.preventDefault();
			},
			"click .ui-menu-item": function( event ) {
				var target = $( event.target );
				var active = $( $.ui.safeActiveElement( this.document[ 0 ] ) );
				if ( !this.mouseHandled && target.not( ".ui-state-disabled" ).length ) {
					this.select( event );

					// Only set the mouseHandled flag if the event will bubble, see #9469.
					if ( !event.isPropagationStopped() ) {
						this.mouseHandled = true;
					}

					// Open submenu on click
					if ( target.has( ".ui-menu" ).length ) {
						this.expand( event );
					} else if ( !this.element.is( ":focus" ) &&
							active.closest( ".ui-menu" ).length ) {

						// Redirect focus to the menu
						this.element.trigger( "focus", [ true ] );

						// If the active item is on the top level, let it stay active.
						// Otherwise, blur the active item since it is no longer visible.
						if ( this.active && this.active.parents( ".ui-menu" ).length === 1 ) {
							clearTimeout( this.timer );
						}
					}
				}
			},
			"mouseenter .ui-menu-item": function( event ) {

				// Ignore mouse events while typeahead is active, see #10458.
				// Prevents focusing the wrong item when typeahead causes a scroll while the mouse
				// is over an item in the menu
				if ( this.previousFilter ) {
					return;
				}

				var actualTarget = $( event.target ).closest( ".ui-menu-item" ),
					target = $( event.currentTarget );

				// Ignore bubbled events on parent items, see #11641
				if ( actualTarget[ 0 ] !== target[ 0 ] ) {
					return;
				}

				// Remove ui-state-active class from siblings of the newly focused menu item
				// to avoid a jump caused by adjacent elements both having a class with a border
				this._removeClass( target.siblings().children( ".ui-state-active" ),
					null, "ui-state-active" );
				this.focus( event, target );
			},
			mouseleave: "collapseAll",
			"mouseleave .ui-menu": "collapseAll",
			focus: function( event, keepActiveItem ) {

				// If there's already an active item, keep it active
				// If not, activate the first item
				var item = this.active || this.element.find( this.options.items ).eq( 0 );

				if ( !keepActiveItem ) {
					this.focus( event, item );
				}
			},
			blur: function( event ) {
				this._delay( function() {
					var notContained = !$.contains(
						this.element[ 0 ],
						$.ui.safeActiveElement( this.document[ 0 ] )
					);
					if ( notContained ) {
						this.collapseAll( event );
					}
				} );
			},
			keydown: "_keydown"
		} );

		this.refresh();

		// Clicks outside of a menu collapse any open menus
		this._on( this.document, {
			click: function( event ) {
				if ( this._closeOnDocumentClick( event ) ) {
					this.collapseAll( event );
				}

				// Reset the mouseHandled flag
				this.mouseHandled = false;
			}
		} );
	},

	_destroy: function() {
		var items = this.element.find( ".ui-menu-item" )
				.removeAttr( "role aria-disabled" ),
			submenus = items.children( ".ui-menu-item-wrapper" )
				.removeUniqueId()
				.removeAttr( "tabIndex role aria-haspopup" );

		// Destroy (sub)menus
		this.element
			.removeAttr( "aria-activedescendant" )
			.find( ".ui-menu" ).addBack()
				.removeAttr( "role aria-labelledby aria-expanded aria-hidden aria-disabled " +
					"tabIndex" )
				.removeUniqueId()
				.show();

		submenus.children().each( function() {
			var elem = $( this );
			if ( elem.data( "ui-menu-submenu-caret" ) ) {
				elem.remove();
			}
		} );
	},

	_keydown: function( event ) {
		var match, prev, character, skip,
			preventDefault = true;

		switch ( event.keyCode ) {
		case $.ui.keyCode.PAGE_UP:
			this.previousPage( event );
			break;
		case $.ui.keyCode.PAGE_DOWN:
			this.nextPage( event );
			break;
		case $.ui.keyCode.HOME:
			this._move( "first", "first", event );
			break;
		case $.ui.keyCode.END:
			this._move( "last", "last", event );
			break;
		case $.ui.keyCode.UP:
			this.previous( event );
			break;
		case $.ui.keyCode.DOWN:
			this.next( event );
			break;
		case $.ui.keyCode.LEFT:
			this.collapse( event );
			break;
		case $.ui.keyCode.RIGHT:
			if ( this.active && !this.active.is( ".ui-state-disabled" ) ) {
				this.expand( event );
			}
			break;
		case $.ui.keyCode.ENTER:
		case $.ui.keyCode.SPACE:
			this._activate( event );
			break;
		case $.ui.keyCode.ESCAPE:
			this.collapse( event );
			break;
		default:
			preventDefault = false;
			prev = this.previousFilter || "";
			skip = false;

			// Support number pad values
			character = event.keyCode >= 96 && event.keyCode <= 105 ?
				( event.keyCode - 96 ).toString() : String.fromCharCode( event.keyCode );

			clearTimeout( this.filterTimer );

			if ( character === prev ) {
				skip = true;
			} else {
				character = prev + character;
			}

			match = this._filterMenuItems( character );
			match = skip && match.index( this.active.next() ) !== -1 ?
				this.active.nextAll( ".ui-menu-item" ) :
				match;

			// If no matches on the current filter, reset to the last character pressed
			// to move down the menu to the first item that starts with that character
			if ( !match.length ) {
				character = String.fromCharCode( event.keyCode );
				match = this._filterMenuItems( character );
			}

			if ( match.length ) {
				this.focus( event, match );
				this.previousFilter = character;
				this.filterTimer = this._delay( function() {
					delete this.previousFilter;
				}, 1000 );
			} else {
				delete this.previousFilter;
			}
		}

		if ( preventDefault ) {
			event.preventDefault();
		}
	},

	_activate: function( event ) {
		if ( this.active && !this.active.is( ".ui-state-disabled" ) ) {
			if ( this.active.children( "[aria-haspopup='true']" ).length ) {
				this.expand( event );
			} else {
				this.select( event );
			}
		}
	},

	refresh: function() {
		var menus, items, newSubmenus, newItems, newWrappers,
			that = this,
			icon = this.options.icons.submenu,
			submenus = this.element.find( this.options.menus );

		this._toggleClass( "ui-menu-icons", null, !!this.element.find( ".ui-icon" ).length );

		// Initialize nested menus
		newSubmenus = submenus.filter( ":not(.ui-menu)" )
			.hide()
			.attr( {
				role: this.options.role,
				"aria-hidden": "true",
				"aria-expanded": "false"
			} )
			.each( function() {
				var menu = $( this ),
					item = menu.prev(),
					submenuCaret = $( "<span>" ).data( "ui-menu-submenu-caret", true );

				that._addClass( submenuCaret, "ui-menu-icon", "ui-icon " + icon );
				item
					.attr( "aria-haspopup", "true" )
					.prepend( submenuCaret );
				menu.attr( "aria-labelledby", item.attr( "id" ) );
			} );

		this._addClass( newSubmenus, "ui-menu", "ui-widget ui-widget-content ui-front" );

		menus = submenus.add( this.element );
		items = menus.find( this.options.items );

		// Initialize menu-items containing spaces and/or dashes only as dividers
		items.not( ".ui-menu-item" ).each( function() {
			var item = $( this );
			if ( that._isDivider( item ) ) {
				that._addClass( item, "ui-menu-divider", "ui-widget-content" );
			}
		} );

		// Don't refresh list items that are already adapted
		newItems = items.not( ".ui-menu-item, .ui-menu-divider" );
		newWrappers = newItems.children()
			.not( ".ui-menu" )
				.uniqueId()
				.attr( {
					tabIndex: -1,
					role: this._itemRole()
				} );
		this._addClass( newItems, "ui-menu-item" )
			._addClass( newWrappers, "ui-menu-item-wrapper" );

		// Add aria-disabled attribute to any disabled menu item
		items.filter( ".ui-state-disabled" ).attr( "aria-disabled", "true" );

		// If the active item has been removed, blur the menu
		if ( this.active && !$.contains( this.element[ 0 ], this.active[ 0 ] ) ) {
			this.blur();
		}
	},

	_itemRole: function() {
		return {
			menu: "menuitem",
			listbox: "option"
		}[ this.options.role ];
	},

	_setOption: function( key, value ) {
		if ( key === "icons" ) {
			var icons = this.element.find( ".ui-menu-icon" );
			this._removeClass( icons, null, this.options.icons.submenu )
				._addClass( icons, null, value.submenu );
		}
		this._super( key, value );
	},

	_setOptionDisabled: function( value ) {
		this._super( value );

		this.element.attr( "aria-disabled", String( value ) );
		this._toggleClass( null, "ui-state-disabled", !!value );
	},

	focus: function( event, item ) {
		var nested, focused, activeParent;
		this.blur( event, event && event.type === "focus" );

		this._scrollIntoView( item );

		this.active = item.first();

		focused = this.active.children( ".ui-menu-item-wrapper" );
		this._addClass( focused, null, "ui-state-active" );

		// Only update aria-activedescendant if there's a role
		// otherwise we assume focus is managed elsewhere
		if ( this.options.role ) {
			this.element.attr( "aria-activedescendant", focused.attr( "id" ) );
		}

		// Highlight active parent menu item, if any
		activeParent = this.active
			.parent()
				.closest( ".ui-menu-item" )
					.children( ".ui-menu-item-wrapper" );
		this._addClass( activeParent, null, "ui-state-active" );

		if ( event && event.type === "keydown" ) {
			this._close();
		} else {
			this.timer = this._delay( function() {
				this._close();
			}, this.delay );
		}

		nested = item.children( ".ui-menu" );
		if ( nested.length && event && ( /^mouse/.test( event.type ) ) ) {
			this._startOpening( nested );
		}
		this.activeMenu = item.parent();

		this._trigger( "focus", event, { item: item } );
	},

	_scrollIntoView: function( item ) {
		var borderTop, paddingTop, offset, scroll, elementHeight, itemHeight;
		if ( this._hasScroll() ) {
			borderTop = parseFloat( $.css( this.activeMenu[ 0 ], "borderTopWidth" ) ) || 0;
			paddingTop = parseFloat( $.css( this.activeMenu[ 0 ], "paddingTop" ) ) || 0;
			offset = item.offset().top - this.activeMenu.offset().top - borderTop - paddingTop;
			scroll = this.activeMenu.scrollTop();
			elementHeight = this.activeMenu.height();
			itemHeight = item.outerHeight();

			if ( offset < 0 ) {
				this.activeMenu.scrollTop( scroll + offset );
			} else if ( offset + itemHeight > elementHeight ) {
				this.activeMenu.scrollTop( scroll + offset - elementHeight + itemHeight );
			}
		}
	},

	blur: function( event, fromFocus ) {
		if ( !fromFocus ) {
			clearTimeout( this.timer );
		}

		if ( !this.active ) {
			return;
		}

		this._removeClass( this.active.children( ".ui-menu-item-wrapper" ),
			null, "ui-state-active" );

		this._trigger( "blur", event, { item: this.active } );
		this.active = null;
	},

	_startOpening: function( submenu ) {
		clearTimeout( this.timer );

		// Don't open if already open fixes a Firefox bug that caused a .5 pixel
		// shift in the submenu position when mousing over the caret icon
		if ( submenu.attr( "aria-hidden" ) !== "true" ) {
			return;
		}

		this.timer = this._delay( function() {
			this._close();
			this._open( submenu );
		}, this.delay );
	},

	_open: function( submenu ) {
		var position = $.extend( {
			of: this.active
		}, this.options.position );

		clearTimeout( this.timer );
		this.element.find( ".ui-menu" ).not( submenu.parents( ".ui-menu" ) )
			.hide()
			.attr( "aria-hidden", "true" );

		submenu
			.show()
			.removeAttr( "aria-hidden" )
			.attr( "aria-expanded", "true" )
			.position( position );
	},

	collapseAll: function( event, all ) {
		clearTimeout( this.timer );
		this.timer = this._delay( function() {

			// If we were passed an event, look for the submenu that contains the event
			var currentMenu = all ? this.element :
				$( event && event.target ).closest( this.element.find( ".ui-menu" ) );

			// If we found no valid submenu ancestor, use the main menu to close all
			// sub menus anyway
			if ( !currentMenu.length ) {
				currentMenu = this.element;
			}

			this._close( currentMenu );

			this.blur( event );

			// Work around active item staying active after menu is blurred
			this._removeClass( currentMenu.find( ".ui-state-active" ), null, "ui-state-active" );

			this.activeMenu = currentMenu;
		}, this.delay );
	},

	// With no arguments, closes the currently active menu - if nothing is active
	// it closes all menus.  If passed an argument, it will search for menus BELOW
	_close: function( startMenu ) {
		if ( !startMenu ) {
			startMenu = this.active ? this.active.parent() : this.element;
		}

		startMenu.find( ".ui-menu" )
			.hide()
			.attr( "aria-hidden", "true" )
			.attr( "aria-expanded", "false" );
	},

	_closeOnDocumentClick: function( event ) {
		return !$( event.target ).closest( ".ui-menu" ).length;
	},

	_isDivider: function( item ) {

		// Match hyphen, em dash, en dash
		return !/[^\-\u2014\u2013\s]/.test( item.text() );
	},

	collapse: function( event ) {
		var newItem = this.active &&
			this.active.parent().closest( ".ui-menu-item", this.element );
		if ( newItem && newItem.length ) {
			this._close();
			this.focus( event, newItem );
		}
	},

	expand: function( event ) {
		var newItem = this.active &&
			this.active
				.children( ".ui-menu " )
					.find( this.options.items )
						.first();

		if ( newItem && newItem.length ) {
			this._open( newItem.parent() );

			// Delay so Firefox will not hide activedescendant change in expanding submenu from AT
			this._delay( function() {
				this.focus( event, newItem );
			} );
		}
	},

	next: function( event ) {
		this._move( "next", "first", event );
	},

	previous: function( event ) {
		this._move( "prev", "last", event );
	},

	isFirstItem: function() {
		return this.active && !this.active.prevAll( ".ui-menu-item" ).length;
	},

	isLastItem: function() {
		return this.active && !this.active.nextAll( ".ui-menu-item" ).length;
	},

	_move: function( direction, filter, event ) {
		var next;
		if ( this.active ) {
			if ( direction === "first" || direction === "last" ) {
				next = this.active
					[ direction === "first" ? "prevAll" : "nextAll" ]( ".ui-menu-item" )
					.eq( -1 );
			} else {
				next = this.active
					[ direction + "All" ]( ".ui-menu-item" )
					.eq( 0 );
			}
		}
		if ( !next || !next.length || !this.active ) {
			next = this.activeMenu.find( this.options.items )[ filter ]();
		}

		this.focus( event, next );
	},

	nextPage: function( event ) {
		var item, base, height;

		if ( !this.active ) {
			this.next( event );
			return;
		}
		if ( this.isLastItem() ) {
			return;
		}
		if ( this._hasScroll() ) {
			base = this.active.offset().top;
			height = this.element.height();
			this.active.nextAll( ".ui-menu-item" ).each( function() {
				item = $( this );
				return item.offset().top - base - height < 0;
			} );

			this.focus( event, item );
		} else {
			this.focus( event, this.activeMenu.find( this.options.items )
				[ !this.active ? "first" : "last" ]() );
		}
	},

	previousPage: function( event ) {
		var item, base, height;
		if ( !this.active ) {
			this.next( event );
			return;
		}
		if ( this.isFirstItem() ) {
			return;
		}
		if ( this._hasScroll() ) {
			base = this.active.offset().top;
			height = this.element.height();
			this.active.prevAll( ".ui-menu-item" ).each( function() {
				item = $( this );
				return item.offset().top - base + height > 0;
			} );

			this.focus( event, item );
		} else {
			this.focus( event, this.activeMenu.find( this.options.items ).first() );
		}
	},

	_hasScroll: function() {
		return this.element.outerHeight() < this.element.prop( "scrollHeight" );
	},

	select: function( event ) {

		// TODO: It should never be possible to not have an active item at this
		// point, but the tests don't trigger mouseenter before click.
		this.active = this.active || $( event.target ).closest( ".ui-menu-item" );
		var ui = { item: this.active };
		if ( !this.active.has( ".ui-menu" ).length ) {
			this.collapseAll( event, true );
		}
		this._trigger( "select", event, ui );
	},

	_filterMenuItems: function( character ) {
		var escapedCharacter = character.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" ),
			regex = new RegExp( "^" + escapedCharacter, "i" );

		return this.activeMenu
			.find( this.options.items )

				// Only match on items, not dividers or other content (#10571)
				.filter( ".ui-menu-item" )
					.filter( function() {
						return regex.test(
							$.trim( $( this ).children( ".ui-menu-item-wrapper" ).text() ) );
					} );
	}
} );


/*!
 * jQuery UI Autocomplete 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Autocomplete
//>>group: Widgets
//>>description: Lists suggested words as the user is typing.
//>>docs: http://api.jqueryui.com/autocomplete/
//>>demos: http://jqueryui.com/autocomplete/
//>>css.structure: ../../themes/base/core.css
//>>css.structure: ../../themes/base/autocomplete.css
//>>css.theme: ../../themes/base/theme.css



$.widget( "ui.autocomplete", {
	version: "1.12.1",
	defaultElement: "<input>",
	options: {
		appendTo: null,
		autoFocus: false,
		delay: 300,
		minLength: 1,
		position: {
			my: "left top",
			at: "left bottom",
			collision: "none"
		},
		source: null,

		// Callbacks
		change: null,
		close: null,
		focus: null,
		open: null,
		response: null,
		search: null,
		select: null
	},

	requestIndex: 0,
	pending: 0,

	_create: function() {

		// Some browsers only repeat keydown events, not keypress events,
		// so we use the suppressKeyPress flag to determine if we've already
		// handled the keydown event. #7269
		// Unfortunately the code for & in keypress is the same as the up arrow,
		// so we use the suppressKeyPressRepeat flag to avoid handling keypress
		// events when we know the keydown event was used to modify the
		// search term. #7799
		var suppressKeyPress, suppressKeyPressRepeat, suppressInput,
			nodeName = this.element[ 0 ].nodeName.toLowerCase(),
			isTextarea = nodeName === "textarea",
			isInput = nodeName === "input";

		// Textareas are always multi-line
		// Inputs are always single-line, even if inside a contentEditable element
		// IE also treats inputs as contentEditable
		// All other element types are determined by whether or not they're contentEditable
		this.isMultiLine = isTextarea || !isInput && this._isContentEditable( this.element );

		this.valueMethod = this.element[ isTextarea || isInput ? "val" : "text" ];
		this.isNewMenu = true;

		this._addClass( "ui-autocomplete-input" );
		this.element.attr( "autocomplete", "off" );

		this._on( this.element, {
			keydown: function( event ) {
				if ( this.element.prop( "readOnly" ) ) {
					suppressKeyPress = true;
					suppressInput = true;
					suppressKeyPressRepeat = true;
					return;
				}

				suppressKeyPress = false;
				suppressInput = false;
				suppressKeyPressRepeat = false;
				var keyCode = $.ui.keyCode;
				switch ( event.keyCode ) {
				case keyCode.PAGE_UP:
					suppressKeyPress = true;
					this._move( "previousPage", event );
					break;
				case keyCode.PAGE_DOWN:
					suppressKeyPress = true;
					this._move( "nextPage", event );
					break;
				case keyCode.UP:
					suppressKeyPress = true;
					this._keyEvent( "previous", event );
					break;
				case keyCode.DOWN:
					suppressKeyPress = true;
					this._keyEvent( "next", event );
					break;
				case keyCode.ENTER:

					// when menu is open and has focus
					if ( this.menu.active ) {

						// #6055 - Opera still allows the keypress to occur
						// which causes forms to submit
						suppressKeyPress = true;
						event.preventDefault();
						this.menu.select( event );
					}
					break;
				case keyCode.TAB:
					if ( this.menu.active ) {
						this.menu.select( event );
					}
					break;
				case keyCode.ESCAPE:
					if ( this.menu.element.is( ":visible" ) ) {
						if ( !this.isMultiLine ) {
							this._value( this.term );
						}
						this.close( event );

						// Different browsers have different default behavior for escape
						// Single press can mean undo or clear
						// Double press in IE means clear the whole form
						event.preventDefault();
					}
					break;
				default:
					suppressKeyPressRepeat = true;

					// search timeout should be triggered before the input value is changed
					this._searchTimeout( event );
					break;
				}
			},
			keypress: function( event ) {
				if ( suppressKeyPress ) {
					suppressKeyPress = false;
					if ( !this.isMultiLine || this.menu.element.is( ":visible" ) ) {
						event.preventDefault();
					}
					return;
				}
				if ( suppressKeyPressRepeat ) {
					return;
				}

				// Replicate some key handlers to allow them to repeat in Firefox and Opera
				var keyCode = $.ui.keyCode;
				switch ( event.keyCode ) {
				case keyCode.PAGE_UP:
					this._move( "previousPage", event );
					break;
				case keyCode.PAGE_DOWN:
					this._move( "nextPage", event );
					break;
				case keyCode.UP:
					this._keyEvent( "previous", event );
					break;
				case keyCode.DOWN:
					this._keyEvent( "next", event );
					break;
				}
			},
			input: function( event ) {
				if ( suppressInput ) {
					suppressInput = false;
					event.preventDefault();
					return;
				}
				this._searchTimeout( event );
			},
			focus: function() {
				this.selectedItem = null;
				this.previous = this._value();
			},
			blur: function( event ) {
				if ( this.cancelBlur ) {
					delete this.cancelBlur;
					return;
				}

				clearTimeout( this.searching );
				this.close( event );
				this._change( event );
			}
		} );

		this._initSource();
		this.menu = $( "<ul>" )
			.appendTo( this._appendTo() )
			.menu( {

				// disable ARIA support, the live region takes care of that
				role: null
			} )
			.hide()
			.menu( "instance" );

		this._addClass( this.menu.element, "ui-autocomplete", "ui-front" );
		this._on( this.menu.element, {
			mousedown: function( event ) {

				// prevent moving focus out of the text field
				event.preventDefault();

				// IE doesn't prevent moving focus even with event.preventDefault()
				// so we set a flag to know when we should ignore the blur event
				this.cancelBlur = true;
				this._delay( function() {
					delete this.cancelBlur;

					// Support: IE 8 only
					// Right clicking a menu item or selecting text from the menu items will
					// result in focus moving out of the input. However, we've already received
					// and ignored the blur event because of the cancelBlur flag set above. So
					// we restore focus to ensure that the menu closes properly based on the user's
					// next actions.
					if ( this.element[ 0 ] !== $.ui.safeActiveElement( this.document[ 0 ] ) ) {
						this.element.trigger( "focus" );
					}
				} );
			},
			menufocus: function( event, ui ) {
				var label, item;

				// support: Firefox
				// Prevent accidental activation of menu items in Firefox (#7024 #9118)
				if ( this.isNewMenu ) {
					this.isNewMenu = false;
					if ( event.originalEvent && /^mouse/.test( event.originalEvent.type ) ) {
						this.menu.blur();

						this.document.one( "mousemove", function() {
							$( event.target ).trigger( event.originalEvent );
						} );

						return;
					}
				}

				item = ui.item.data( "ui-autocomplete-item" );
				if ( false !== this._trigger( "focus", event, { item: item } ) ) {

					// use value to match what will end up in the input, if it was a key event
					if ( event.originalEvent && /^key/.test( event.originalEvent.type ) ) {
						this._value( item.value );
					}
				}

				// Announce the value in the liveRegion
				label = ui.item.attr( "aria-label" ) || item.value;
				if ( label && $.trim( label ).length ) {
					this.liveRegion.children().hide();
					$( "<div>" ).text( label ).appendTo( this.liveRegion );
				}
			},
			menuselect: function( event, ui ) {
				var item = ui.item.data( "ui-autocomplete-item" ),
					previous = this.previous;

				// Only trigger when focus was lost (click on menu)
				if ( this.element[ 0 ] !== $.ui.safeActiveElement( this.document[ 0 ] ) ) {
					this.element.trigger( "focus" );
					this.previous = previous;

					// #6109 - IE triggers two focus events and the second
					// is asynchronous, so we need to reset the previous
					// term synchronously and asynchronously :-(
					this._delay( function() {
						this.previous = previous;
						this.selectedItem = item;
					} );
				}

				if ( false !== this._trigger( "select", event, { item: item } ) ) {
					this._value( item.value );
				}

				// reset the term after the select event
				// this allows custom select handling to work properly
				this.term = this._value();

				this.close( event );
				this.selectedItem = item;
			}
		} );

		this.liveRegion = $( "<div>", {
			role: "status",
			"aria-live": "assertive",
			"aria-relevant": "additions"
		} )
			.appendTo( this.document[ 0 ].body );

		this._addClass( this.liveRegion, null, "ui-helper-hidden-accessible" );

		// Turning off autocomplete prevents the browser from remembering the
		// value when navigating through history, so we re-enable autocomplete
		// if the page is unloaded before the widget is destroyed. #7790
		this._on( this.window, {
			beforeunload: function() {
				this.element.removeAttr( "autocomplete" );
			}
		} );
	},

	_destroy: function() {
		clearTimeout( this.searching );
		this.element.removeAttr( "autocomplete" );
		this.menu.element.remove();
		this.liveRegion.remove();
	},

	_setOption: function( key, value ) {
		this._super( key, value );
		if ( key === "source" ) {
			this._initSource();
		}
		if ( key === "appendTo" ) {
			this.menu.element.appendTo( this._appendTo() );
		}
		if ( key === "disabled" && value && this.xhr ) {
			this.xhr.abort();
		}
	},

	_isEventTargetInWidget: function( event ) {
		var menuElement = this.menu.element[ 0 ];

		return event.target === this.element[ 0 ] ||
			event.target === menuElement ||
			$.contains( menuElement, event.target );
	},

	_closeOnClickOutside: function( event ) {
		if ( !this._isEventTargetInWidget( event ) ) {
			this.close();
		}
	},

	_appendTo: function() {
		var element = this.options.appendTo;

		if ( element ) {
			element = element.jquery || element.nodeType ?
				$( element ) :
				this.document.find( element ).eq( 0 );
		}

		if ( !element || !element[ 0 ] ) {
			element = this.element.closest( ".ui-front, dialog" );
		}

		if ( !element.length ) {
			element = this.document[ 0 ].body;
		}

		return element;
	},

	_initSource: function() {
		var array, url,
			that = this;
		if ( $.isArray( this.options.source ) ) {
			array = this.options.source;
			this.source = function( request, response ) {
				response( $.ui.autocomplete.filter( array, request.term ) );
			};
		} else if ( typeof this.options.source === "string" ) {
			url = this.options.source;
			this.source = function( request, response ) {
				if ( that.xhr ) {
					that.xhr.abort();
				}
				that.xhr = $.ajax( {
					url: url,
					data: request,
					dataType: "json",
					success: function( data ) {
						response( data );
					},
					error: function() {
						response( [] );
					}
				} );
			};
		} else {
			this.source = this.options.source;
		}
	},

	_searchTimeout: function( event ) {
		clearTimeout( this.searching );
		this.searching = this._delay( function() {

			// Search if the value has changed, or if the user retypes the same value (see #7434)
			var equalValues = this.term === this._value(),
				menuVisible = this.menu.element.is( ":visible" ),
				modifierKey = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

			if ( !equalValues || ( equalValues && !menuVisible && !modifierKey ) ) {
				this.selectedItem = null;
				this.search( null, event );
			}
		}, this.options.delay );
	},

	search: function( value, event ) {
		value = value != null ? value : this._value();

		// Always save the actual value, not the one passed as an argument
		this.term = this._value();

		if ( value.length < this.options.minLength ) {
			return this.close( event );
		}

		if ( this._trigger( "search", event ) === false ) {
			return;
		}

		return this._search( value );
	},

	_search: function( value ) {
		this.pending++;
		this._addClass( "ui-autocomplete-loading" );
		this.cancelSearch = false;

		this.source( { term: value }, this._response() );
	},

	_response: function() {
		var index = ++this.requestIndex;

		return $.proxy( function( content ) {
			if ( index === this.requestIndex ) {
				this.__response( content );
			}

			this.pending--;
			if ( !this.pending ) {
				this._removeClass( "ui-autocomplete-loading" );
			}
		}, this );
	},

	__response: function( content ) {
		if ( content ) {
			content = this._normalize( content );
		}
		this._trigger( "response", null, { content: content } );
		if ( !this.options.disabled && content && content.length && !this.cancelSearch ) {
			this._suggest( content );
			this._trigger( "open" );
		} else {

			// use ._close() instead of .close() so we don't cancel future searches
			this._close();
		}
	},

	close: function( event ) {
		this.cancelSearch = true;
		this._close( event );
	},

	_close: function( event ) {

		// Remove the handler that closes the menu on outside clicks
		this._off( this.document, "mousedown" );

		if ( this.menu.element.is( ":visible" ) ) {
			this.menu.element.hide();
			this.menu.blur();
			this.isNewMenu = true;
			this._trigger( "close", event );
		}
	},

	_change: function( event ) {
		if ( this.previous !== this._value() ) {
			this._trigger( "change", event, { item: this.selectedItem } );
		}
	},

	_normalize: function( items ) {

		// assume all items have the right format when the first item is complete
		if ( items.length && items[ 0 ].label && items[ 0 ].value ) {
			return items;
		}
		return $.map( items, function( item ) {
			if ( typeof item === "string" ) {
				return {
					label: item,
					value: item
				};
			}
			return $.extend( {}, item, {
				label: item.label || item.value,
				value: item.value || item.label
			} );
		} );
	},

	_suggest: function( items ) {
		var ul = this.menu.element.empty();
		this._renderMenu( ul, items );
		this.isNewMenu = true;
		this.menu.refresh();

		// Size and position menu
		ul.show();
		this._resizeMenu();
		ul.position( $.extend( {
			of: this.element
		}, this.options.position ) );

		if ( this.options.autoFocus ) {
			this.menu.next();
		}

		// Listen for interactions outside of the widget (#6642)
		this._on( this.document, {
			mousedown: "_closeOnClickOutside"
		} );
	},

	_resizeMenu: function() {
		var ul = this.menu.element;
		ul.outerWidth( Math.max(

			// Firefox wraps long text (possibly a rounding bug)
			// so we add 1px to avoid the wrapping (#7513)
			ul.width( "" ).outerWidth() + 1,
			this.element.outerWidth()
		) );
	},

	_renderMenu: function( ul, items ) {
		var that = this;
		$.each( items, function( index, item ) {
			that._renderItemData( ul, item );
		} );
	},

	_renderItemData: function( ul, item ) {
		return this._renderItem( ul, item ).data( "ui-autocomplete-item", item );
	},

	_renderItem: function( ul, item ) {
		return $( "<li>" )
			.append( $( "<div>" ).text( item.label ) )
			.appendTo( ul );
	},

	_move: function( direction, event ) {
		if ( !this.menu.element.is( ":visible" ) ) {
			this.search( null, event );
			return;
		}
		if ( this.menu.isFirstItem() && /^previous/.test( direction ) ||
				this.menu.isLastItem() && /^next/.test( direction ) ) {

			if ( !this.isMultiLine ) {
				this._value( this.term );
			}

			this.menu.blur();
			return;
		}
		this.menu[ direction ]( event );
	},

	widget: function() {
		return this.menu.element;
	},

	_value: function() {
		return this.valueMethod.apply( this.element, arguments );
	},

	_keyEvent: function( keyEvent, event ) {
		if ( !this.isMultiLine || this.menu.element.is( ":visible" ) ) {
			this._move( keyEvent, event );

			// Prevents moving cursor to beginning/end of the text field in some browsers
			event.preventDefault();
		}
	},

	// Support: Chrome <=50
	// We should be able to just use this.element.prop( "isContentEditable" )
	// but hidden elements always report false in Chrome.
	// https://code.google.com/p/chromium/issues/detail?id=313082
	_isContentEditable: function( element ) {
		if ( !element.length ) {
			return false;
		}

		var editable = element.prop( "contentEditable" );

		if ( editable === "inherit" ) {
		  return this._isContentEditable( element.parent() );
		}

		return editable === "true";
	}
} );

$.extend( $.ui.autocomplete, {
	escapeRegex: function( value ) {
		return value.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" );
	},
	filter: function( array, term ) {
		var matcher = new RegExp( $.ui.autocomplete.escapeRegex( term ), "i" );
		return $.grep( array, function( value ) {
			return matcher.test( value.label || value.value || value );
		} );
	}
} );

// Live region extension, adding a `messages` option
// NOTE: This is an experimental API. We are still investigating
// a full solution for string manipulation and internationalization.
$.widget( "ui.autocomplete", $.ui.autocomplete, {
	options: {
		messages: {
			noResults: "No search results.",
			results: function( amount ) {
				return amount + ( amount > 1 ? " results are" : " result is" ) +
					" available, use up and down arrow keys to navigate.";
			}
		}
	},

	__response: function( content ) {
		var message;
		this._superApply( arguments );
		if ( this.options.disabled || this.cancelSearch ) {
			return;
		}
		if ( content && content.length ) {
			message = this.options.messages.results( content.length );
		} else {
			message = this.options.messages.noResults;
		}
		this.liveRegion.children().hide();
		$( "<div>" ).text( message ).appendTo( this.liveRegion );
	}
} );

var widgetsAutocomplete = $.ui.autocomplete;




}));
(function ($) {

  $.fn.customScrollbar = function (options, args) {

    var defaultOptions = {
      skin: undefined,
      hScroll: true,
      vScroll: true,
      updateOnWindowResize: false,
      animationSpeed: 300,
      onCustomScroll: undefined,
      swipeSpeed: 1,
      wheelSpeed: 40,
      fixedThumbWidth: undefined,
      fixedThumbHeight: undefined,
      preventDefaultScroll: false
    }

    var Scrollable = function (element, options) {
      this.$element = $(element);
      this.options = options;
      this.addScrollableClass();
      this.addSkinClass();
      this.addScrollBarComponents();
      if (this.options.vScroll)
        this.vScrollbar = new Scrollbar(this, new VSizing());
      if (this.options.hScroll)
        this.hScrollbar = new Scrollbar(this, new HSizing());
      this.$element.data("scrollable", this);
      this.initKeyboardScrolling();
      this.bindEvents();
    }

    Scrollable.prototype = {

      addScrollableClass: function () {
        if (!this.$element.hasClass("scrollable")) {
          this.scrollableAdded = true;
          this.$element.addClass("scrollable");
        }
      },

      removeScrollableClass: function () {
        if (this.scrollableAdded)
          this.$element.removeClass("scrollable");
      },

      addSkinClass: function () {
        if (typeof(this.options.skin) == "string" && !this.$element.hasClass(this.options.skin)) {
          this.skinClassAdded = true;
          this.$element.addClass(this.options.skin);
        }
      },

      removeSkinClass: function () {
        if (this.skinClassAdded)
          this.$element.removeClass(this.options.skin);
      },

      addScrollBarComponents: function () {
        this.assignViewPort();
        if (this.$viewPort.length == 0) {
          this.$element.wrapInner("<div class=\"viewport\" />");
          this.assignViewPort();
          this.viewPortAdded = true;
        }
        this.assignOverview();
        if (this.$overview.length == 0) {
          this.$viewPort.wrapInner("<div class=\"overview\" />");
          this.assignOverview();
          this.overviewAdded = true;
        }
        this.addScrollBar("vertical", "prepend");
        this.addScrollBar("horizontal", "append");
      },

      removeScrollbarComponents: function () {
        this.removeScrollbar("vertical");
        this.removeScrollbar("horizontal");
        if (this.overviewAdded)
          this.$element.unwrap();
        if (this.viewPortAdded)
          this.$element.unwrap();
      },

      removeScrollbar: function (orientation) {
        if (this[orientation + "ScrollbarAdded"])
          this.$element.find(".scroll-bar." + orientation).remove();
      },

      assignViewPort: function () {
        this.$viewPort = this.$element.find(".viewport");
      },

      assignOverview: function () {
        this.$overview = this.$viewPort.find(".overview");
      },

      addScrollBar: function (orientation, fun) {
        if (this.$element.find(".scroll-bar." + orientation).length == 0) {
          this.$element[fun]("<div class='scroll-bar " + orientation + "'><div class='thumb'></div></div>")
          this[orientation + "ScrollbarAdded"] = true;
        }
      },

      resize: function (keepPosition) {
        if (this.vScrollbar)
          this.vScrollbar.resize(keepPosition);
        if (this.hScrollbar)
          this.hScrollbar.resize(keepPosition);
      },

      scrollTo: function (element) {
        if (this.vScrollbar)
          this.vScrollbar.scrollToElement(element);
        if (this.hScrollbar)
          this.hScrollbar.scrollToElement(element);
      },

      scrollToXY: function (x, y) {
        this.scrollToX(x);
        this.scrollToY(y);
      },

      scrollToX: function (x) {
        if (this.hScrollbar)
          this.hScrollbar.scrollOverviewTo(x, true);
      },

      scrollToY: function (y) {
        if (this.vScrollbar)
          this.vScrollbar.scrollOverviewTo(y, true);
      },

      scrollByX: function (x) {
        if (this.hScrollbar)
          this.scrollToX(this.hScrollbar.overviewPosition() + x);
      },

      scrollByY: function (y) {
        if (this.vScrollbar)
          this.scrollToY(this.vScrollbar.overviewPosition() + y);
      },

      remove: function () {
        this.removeScrollableClass();
        this.removeSkinClass();
        this.removeScrollbarComponents();
        this.$element.data("scrollable", null);
        this.removeKeyboardScrolling();
        if (this.vScrollbar)
          this.vScrollbar.remove();
        if (this.hScrollbar)
          this.hScrollbar.remove();
      },

      setAnimationSpeed: function (speed) {
        this.options.animationSpeed = speed;
      },

      isInside: function (element, wrappingElement) {
        var $element = $(element);
        var $wrappingElement = $(wrappingElement);
        var elementOffset = $element.offset();
        var wrappingElementOffset = $wrappingElement.offset();
        return (elementOffset.top >= wrappingElementOffset.top) && (elementOffset.left >= wrappingElementOffset.left) &&
          (elementOffset.top + $element.height() <= wrappingElementOffset.top + $wrappingElement.height()) &&
          (elementOffset.left + $element.width() <= wrappingElementOffset.left + $wrappingElement.width())
      },

      initKeyboardScrolling: function () {
        var _this = this;

        this.elementKeydown = function (event) {
          if (document.activeElement === _this.$element[0]) {
            if (_this.vScrollbar)
              _this.vScrollbar.keyScroll(event);
            if (_this.hScrollbar)
              _this.hScrollbar.keyScroll(event);
          }
        }

        this.$element
          .attr('tabindex', '-1')
          .keydown(this.elementKeydown);
      },

      removeKeyboardScrolling: function () {
        this.$element
          .removeAttr('tabindex')
          .unbind("keydown", this.elementKeydown);
      },

      bindEvents: function () {
        if (this.options.onCustomScroll)
          this.$element.on("customScroll", this.options.onCustomScroll);
      }

    }

    var Scrollbar = function (scrollable, sizing) {
      this.scrollable = scrollable;
      this.sizing = sizing
      this.$scrollBar = this.sizing.scrollBar(this.scrollable.$element);
      this.$thumb = this.$scrollBar.find(".thumb");
      this.setScrollPosition(0, 0);
      this.resize();
      this.initMouseMoveScrolling();
      this.initMouseWheelScrolling();
      this.initTouchScrolling();
      this.initMouseClickScrolling();
      this.initWindowResize();
    }

    Scrollbar.prototype = {

      resize: function (keepPosition) {
        this.overviewSize = this.sizing.size(this.scrollable.$overview);
        this.calculateViewPortSize();
        this.sizing.size(this.scrollable.$viewPort, this.viewPortSize);
        this.ratio = this.viewPortSize / this.overviewSize;
        this.sizing.size(this.$scrollBar, this.viewPortSize);
        this.thumbSize = this.calculateThumbSize();
        this.sizing.size(this.$thumb, this.thumbSize);
        this.maxThumbPosition = this.calculateMaxThumbPosition();
        this.maxOverviewPosition = this.calculateMaxOverviewPosition();
        this.enabled = (this.overviewSize > this.viewPortSize);
        if (this.scrollPercent === undefined)
          this.scrollPercent = 0.0;
        if (this.enabled)
          this.rescroll(keepPosition);
        else
          this.setScrollPosition(0, 0);
        this.$scrollBar.toggle(this.enabled);
      },

      calculateViewPortSize: function () {
        var elementSize = this.sizing.size(this.scrollable.$element);
        if (elementSize > 0 && !this.maxSizeUsed) {
          this.viewPortSize = elementSize;
          this.maxSizeUsed = false;
        }
        else {
          var maxSize = this.sizing.maxSize(this.scrollable.$element);
          this.viewPortSize = Math.min(maxSize, this.overviewSize);
          this.maxSizeUsed = true;
        }
      },

      calculateThumbSize: function () {
        var fixedSize = this.sizing.fixedThumbSize(this.scrollable.options)
        var size;
        if (fixedSize)
          size = fixedSize;
        else
          size = this.ratio * this.viewPortSize
        return Math.max(size, this.sizing.minSize(this.$thumb));
      },

      initMouseMoveScrolling: function () {
        var _this = this;
        this.$thumb.mousedown(function (event) {
          if (_this.enabled)
            _this.startMouseMoveScrolling(event);
        });
        this.documentMouseup = function (event) {
          _this.stopMouseMoveScrolling(event);
        };
        $(document).mouseup(this.documentMouseup);
        this.documentMousemove = function (event) {
          _this.mouseMoveScroll(event);
        };
        $(document).mousemove(this.documentMousemove);
        this.$thumb.click(function (event) {
          event.stopPropagation();
        });
      },

      removeMouseMoveScrolling: function () {
        this.$thumb.unbind();
        $(document).unbind("mouseup", this.documentMouseup);
        $(document).unbind("mousemove", this.documentMousemove);
      },

      initMouseWheelScrolling: function () {
        var _this = this;
        this.scrollable.$element.mousewheel(function (event, delta, deltaX, deltaY) {
          if (_this.enabled) {
            var scrolled = _this.mouseWheelScroll(deltaX, deltaY);
            _this.stopEventConditionally(event, scrolled);
          }
        });
      },

      removeMouseWheelScrolling: function () {
        this.scrollable.$element.unbind("mousewheel");
      },

      initTouchScrolling: function () {
        if (document.addEventListener) {
          var _this = this;
          this.elementTouchstart = function (event) {
            if (_this.enabled)
              _this.startTouchScrolling(event);
          }
          this.scrollable.$element[0].addEventListener("touchstart", this.elementTouchstart);
          this.documentTouchmove = function (event) {
            _this.touchScroll(event);
          }
          this.scrollable.$element[0].addEventListener("touchmove", this.documentTouchmove);
          this.elementTouchend = function (event) {
            _this.stopTouchScrolling(event);
          }
          this.scrollable.$element[0].addEventListener("touchend", this.elementTouchend);
        }
      },

      removeTouchScrolling: function () {
        if (document.addEventListener) {
          this.scrollable.$element[0].removeEventListener("touchstart", this.elementTouchstart);
          document.removeEventListener("touchmove", this.documentTouchmove);
          this.scrollable.$element[0].removeEventListener("touchend", this.elementTouchend);
        }
      },

      initMouseClickScrolling: function () {
        var _this = this;
        this.scrollBarClick = function (event) {
          _this.mouseClickScroll(event);
        };
        this.$scrollBar.click(this.scrollBarClick);
      },

      removeMouseClickScrolling: function () {
        this.$scrollBar.unbind("click", this.scrollBarClick);
      },

      initWindowResize: function () {
        if (this.scrollable.options.updateOnWindowResize) {
          var _this = this;
          this.windowResize = function () {
            _this.resize();
          };
          $(window).resize(this.windowResize);
        }
      },

      removeWindowResize: function () {
        $(window).unbind("resize", this.windowResize);
      },

      isKeyScrolling: function (key) {
        return this.keyScrollDelta(key) != null;
      },

      keyScrollDelta: function (key) {
        for (var scrollingKey in this.sizing.scrollingKeys)
          if (scrollingKey == key)
            return this.sizing.scrollingKeys[key](this.viewPortSize);
        return null;
      },

      startMouseMoveScrolling: function (event) {
        this.mouseMoveScrolling = true;
        $("body").addClass("not-selectable");
        this.setUnselectable($("body"), "on");
        this.setScrollEvent(event);
        event.preventDefault();
      },

      stopMouseMoveScrolling: function (event) {
        this.mouseMoveScrolling = false;
        $("body").removeClass("not-selectable");
        this.setUnselectable($("body"), null);
      },

      setUnselectable: function (element, value) {
        if (element.attr("unselectable") != value) {
          element.attr("unselectable", value);
          element.find(':not(input)').attr('unselectable', value);
        }
      },

      mouseMoveScroll: function (event) {
        if (this.mouseMoveScrolling) {
          var delta = this.sizing.mouseDelta(this.scrollEvent, event);
          this.scrollThumbBy(delta);
          this.setScrollEvent(event);
        }
      },

      startTouchScrolling: function (event) {
        if (event.touches && event.touches.length == 1) {
          this.setScrollEvent(event.touches[0]);
          this.touchScrolling = true;
          event.stopPropagation();
        }
      },

      touchScroll: function (event) {
        if (this.touchScrolling && event.touches && event.touches.length == 1) {
          var delta = -this.sizing.mouseDelta(this.scrollEvent, event.touches[0]) * this.scrollable.options.swipeSpeed;
          var scrolled = this.scrollOverviewBy(delta);
          if (scrolled)
            this.setScrollEvent(event.touches[0]);
          this.stopEventConditionally(event, scrolled);
        }
      },

      stopTouchScrolling: function (event) {
        this.touchScrolling = false;
        event.stopPropagation();
      },

      mouseWheelScroll: function (deltaX, deltaY) {
        var delta = -this.sizing.wheelDelta(deltaX, deltaY) * this.scrollable.options.wheelSpeed;
        if (delta != 0)
          return this.scrollOverviewBy(delta);
      },

      mouseClickScroll: function (event) {
        var delta = this.viewPortSize - 20;
        if (event["page" + this.sizing.scrollAxis()] < this.$thumb.offset()[this.sizing.offsetComponent()])
        // mouse click over thumb
          delta = -delta;
        this.scrollOverviewBy(delta);
      },

      keyScroll: function (event) {
        var keyDown = event.which;
        if (this.enabled && this.isKeyScrolling(keyDown)) {
          var scrolled = this.scrollOverviewBy(this.keyScrollDelta(keyDown));
          this.stopEventConditionally(event, scrolled);
        }
      },

      scrollThumbBy: function (delta) {
        var thumbPosition = this.thumbPosition();
        thumbPosition += delta;
        thumbPosition = this.positionOrMax(thumbPosition, this.maxThumbPosition);
        var oldScrollPercent = this.scrollPercent;
        this.scrollPercent = thumbPosition / this.maxThumbPosition;
        if (oldScrollPercent != this.scrollPercent) {
          var overviewPosition = (thumbPosition * this.maxOverviewPosition) / this.maxThumbPosition;
          this.setScrollPosition(overviewPosition, thumbPosition);
          this.triggerCustomScroll(oldScrollPercent);
          return true
        }
        else
          return false;
      },

      thumbPosition: function () {
        return this.$thumb.position()[this.sizing.offsetComponent()];
      },

      scrollOverviewBy: function (delta) {
        var overviewPosition = this.overviewPosition() + delta;
        return this.scrollOverviewTo(overviewPosition, false);
      },

      overviewPosition: function () {
        return -this.scrollable.$overview.position()[this.sizing.offsetComponent()];
      },

      scrollOverviewTo: function (overviewPosition, animate) {
        overviewPosition = this.positionOrMax(overviewPosition, this.maxOverviewPosition);
        var oldScrollPercent = this.scrollPercent;
        this.scrollPercent = overviewPosition / this.maxOverviewPosition;
        if (oldScrollPercent != this.scrollPercent) {
          var thumbPosition = this.scrollPercent * this.maxThumbPosition;
          if (animate)
            this.setScrollPositionWithAnimation(overviewPosition, thumbPosition);
          else
            this.setScrollPosition(overviewPosition, thumbPosition);
          this.triggerCustomScroll(oldScrollPercent);
          return true;
        }
        else
          return false;
      },

      positionOrMax: function (p, max) {
        if (p < 0)
          return 0;
        else if (p > max)
          return max;
        else
          return p;
      },

      triggerCustomScroll: function (oldScrollPercent) {
        this.scrollable.$element.trigger("customScroll", {
            scrollAxis: this.sizing.scrollAxis(),
            direction: this.sizing.scrollDirection(oldScrollPercent, this.scrollPercent),
            scrollPercent: this.scrollPercent * 100
          }
        );
      },

      rescroll: function (keepPosition) {
        if (keepPosition) {
          var overviewPosition = this.positionOrMax(this.overviewPosition(), this.maxOverviewPosition);
          this.scrollPercent = overviewPosition / this.maxOverviewPosition;
          var thumbPosition = this.scrollPercent * this.maxThumbPosition;
          this.setScrollPosition(overviewPosition, thumbPosition);
        }
        else {
          var thumbPosition = this.scrollPercent * this.maxThumbPosition;
          var overviewPosition = this.scrollPercent * this.maxOverviewPosition;
          this.setScrollPosition(overviewPosition, thumbPosition);
        }
      },

      setScrollPosition: function (overviewPosition, thumbPosition) {
        this.$thumb.css(this.sizing.offsetComponent(), thumbPosition + "px");
        this.scrollable.$overview.css(this.sizing.offsetComponent(), -overviewPosition + "px");
      },

      setScrollPositionWithAnimation: function (overviewPosition, thumbPosition) {
        var thumbAnimationOpts = {};
        var overviewAnimationOpts = {};
        thumbAnimationOpts[this.sizing.offsetComponent()] = thumbPosition + "px";
        this.$thumb.animate(thumbAnimationOpts, this.scrollable.options.animationSpeed);
        overviewAnimationOpts[this.sizing.offsetComponent()] = -overviewPosition + "px";
        this.scrollable.$overview.animate(overviewAnimationOpts, this.scrollable.options.animationSpeed);
      },

      calculateMaxThumbPosition: function () {
        return Math.max(0, this.sizing.size(this.$scrollBar) - this.thumbSize);
      },

      calculateMaxOverviewPosition: function () {
        return Math.max(0, this.sizing.size(this.scrollable.$overview) - this.sizing.size(this.scrollable.$viewPort));
      },

      setScrollEvent: function (event) {
        var attr = "page" + this.sizing.scrollAxis();
        if (!this.scrollEvent || this.scrollEvent[attr] != event[attr])
          this.scrollEvent = {pageX: event.pageX, pageY: event.pageY};
      },

      scrollToElement: function (element) {
        var $element = $(element);
        if (this.sizing.isInside($element, this.scrollable.$overview) && !this.sizing.isInside($element, this.scrollable.$viewPort)) {
          var elementOffset = $element.offset();
          var overviewOffset = this.scrollable.$overview.offset();
          var viewPortOffset = this.scrollable.$viewPort.offset();
          this.scrollOverviewTo(elementOffset[this.sizing.offsetComponent()] - overviewOffset[this.sizing.offsetComponent()], true);
        }
      },

      remove: function () {
        this.removeMouseMoveScrolling();
        this.removeMouseWheelScrolling();
        this.removeTouchScrolling();
        this.removeMouseClickScrolling();
        this.removeWindowResize();
      },

      stopEventConditionally: function (event, condition) {
        if (condition || this.scrollable.options.preventDefaultScroll) {
          event.preventDefault();
          event.stopPropagation();
        }
      }

    }

    var HSizing = function () {
    }

    HSizing.prototype = {
      size: function ($el, arg) {
        if (arg)
          return $el.width(arg);
        else
          return $el.width();
      },

      minSize: function ($el) {
        return parseInt($el.css("min-width")) || 0;
      },

      maxSize: function ($el) {
        return parseInt($el.css("max-width")) || 0;
      },

      fixedThumbSize: function (options) {
        return options.fixedThumbWidth;
      },

      scrollBar: function ($el) {
        return $el.find(".scroll-bar.horizontal");
      },

      mouseDelta: function (event1, event2) {
        return event2.pageX - event1.pageX;
      },

      offsetComponent: function () {
        return "left";
      },

      wheelDelta: function (deltaX, deltaY) {
        return deltaX;
      },

      scrollAxis: function () {
        return "X";
      },

      scrollDirection: function (oldPercent, newPercent) {
        return oldPercent < newPercent ? "right" : "left";
      },

      scrollingKeys: {
        37: function (viewPortSize) {
          return -10; //arrow left
        },
        39: function (viewPortSize) {
          return 10; //arrow right
        }
      },

      isInside: function (element, wrappingElement) {
        var $element = $(element);
        var $wrappingElement = $(wrappingElement);
        var elementOffset = $element.offset();
        var wrappingElementOffset = $wrappingElement.offset();
        return (elementOffset.left >= wrappingElementOffset.left) &&
          (elementOffset.left + $element.width() <= wrappingElementOffset.left + $wrappingElement.width());
      }

    }

    var VSizing = function () {
    }

    VSizing.prototype = {

      size: function ($el, arg) {
        if (arg)
          return $el.height(arg);
        else
          return $el.height();
      },

      minSize: function ($el) {
        return parseInt($el.css("min-height")) || 0;
      },

      maxSize: function ($el) {
        return parseInt($el.css("max-height")) || 0;
      },

      fixedThumbSize: function (options) {
        return options.fixedThumbHeight;
      },

      scrollBar: function ($el) {
        return $el.find(".scroll-bar.vertical");
      },

      mouseDelta: function (event1, event2) {
        return event2.pageY - event1.pageY;
      },

      offsetComponent: function () {
        return "top";
      },

      wheelDelta: function (deltaX, deltaY) {
        return deltaY;
      },

      scrollAxis: function () {
        return "Y";
      },

      scrollDirection: function (oldPercent, newPercent) {
        return oldPercent < newPercent ? "down" : "up";
      },

      scrollingKeys: {
        38: function (viewPortSize) {
          return -10; //arrow up
        },
        40: function (viewPortSize) {
          return 10; //arrow down
        },
        33: function (viewPortSize) {
          return -(viewPortSize - 20); //page up
        },
        34: function (viewPortSize) {
          return viewPortSize - 20; //page down
        }
      },

      isInside: function (element, wrappingElement) {
        var $element = $(element);
        var $wrappingElement = $(wrappingElement);
        var elementOffset = $element.offset();
        var wrappingElementOffset = $wrappingElement.offset();
        return (elementOffset.top >= wrappingElementOffset.top) &&
          (elementOffset.top + $element.height() <= wrappingElementOffset.top + $wrappingElement.height());
      }

    }

    return this.each(function () {
      if (options == undefined)
        options = defaultOptions;
      if (typeof(options) == "string") {
        var scrollable = $(this).data("scrollable");
        if (scrollable)
          scrollable[options](args);
      }
      else if (typeof(options) == "object") {
        options = $.extend(defaultOptions, options);
        new Scrollable($(this), options);
      }
      else
        throw "Invalid type of options";
    });

  }
  ;

})
  (jQuery);

(function ($) {

  var types = ['DOMMouseScroll', 'mousewheel'];

  if ($.event.fixHooks) {
    for (var i = types.length; i;) {
      $.event.fixHooks[ types[--i] ] = $.event.mouseHooks;
    }
  }

  $.event.special.mousewheel = {
    setup: function () {
      if (this.addEventListener) {
        for (var i = types.length; i;) {
          this.addEventListener(types[--i], handler, false);
        }
      } else {
        this.onmousewheel = handler;
      }
    },

    teardown: function () {
      if (this.removeEventListener) {
        for (var i = types.length; i;) {
          this.removeEventListener(types[--i], handler, false);
        }
      } else {
        this.onmousewheel = null;
      }
    }
  };

  $.fn.extend({
    mousewheel: function (fn) {
      return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
    },

    unmousewheel: function (fn) {
      return this.unbind("mousewheel", fn);
    }
  });


  function handler(event) {
    var orgEvent = event || window.event, args = [].slice.call(arguments, 1), delta = 0, returnValue = true, deltaX = 0, deltaY = 0;
    event = $.event.fix(orgEvent);
    event.type = "mousewheel";

    // Old school scrollwheel delta
    if (orgEvent.wheelDelta) {
      delta = orgEvent.wheelDelta / 120;
    }
    if (orgEvent.detail) {
      delta = -orgEvent.detail / 3;
    }

    // New school multidimensional scroll (touchpads) deltas
    deltaY = delta;

    // Gecko
    if (orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS) {
      deltaY = 0;
      deltaX = delta;
    }

    // Webkit
    if (orgEvent.wheelDeltaY !== undefined) {
      deltaY = orgEvent.wheelDeltaY / 120;
    }
    if (orgEvent.wheelDeltaX !== undefined) {
      deltaX = orgEvent.wheelDeltaX / 120;
    }

    // Add event and delta to the front of the arguments
    args.unshift(event, delta, deltaX, deltaY);

    return ($.event.dispatch || $.event.handle).apply(this, args);
  }

})(jQuery);

/*
 * jQuery Form Styler v1.7.6
 * https://github.com/Dimox/jQueryFormStyler
 *
 * Copyright 2012-2016 Dimox (http://dimox.name/)
 * Released under the MIT license.
 *
 * Date: 2016.06.05
 *
 */

;(function(factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		// CommonJS
		module.exports = factory(require('jquery'));
	} else {
		factory(jQuery);
	}
}(function($) {

	'use strict';

	var pluginName = 'styler',
			defaults = {
				idSuffix: '-styler',
				filePlaceholder: 'Файл не выбран',
				fileBrowse: 'Обзор...',
				fileNumber: 'Выбрано файлов: %s',
				selectPlaceholder: 'Выберите...',
				selectSearch: false,
				selectSearchLimit: 10,
				selectSearchNotFound: 'Совпадений не найдено',
				selectSearchPlaceholder: 'Поиск...',
				selectVisibleOptions: 0,
				singleSelectzIndex: '100',
				selectSmartPositioning: true,
				onSelectOpened: function() {},
				onSelectClosed: function() {},
				onFormStyled: function() {}
			};

	function Plugin(element, options) {
		this.element = element;
		this.options = $.extend({}, defaults, options);
		this.init();
	}

	Plugin.prototype = {

		// инициализация
		init: function() {

			var el = $(this.element);
			var opt = this.options;

			var iOS = (navigator.userAgent.match(/(iPad|iPhone|iPod)/i) && !navigator.userAgent.match(/(Windows\sPhone)/i)) ? true : false;
			var Android = (navigator.userAgent.match(/Android/i) && !navigator.userAgent.match(/(Windows\sPhone)/i)) ? true : false;

			function Attributes() {
				if (el.attr('id') !== undefined && el.attr('id') !== '') {
					this.id = el.attr('id') + opt.idSuffix;
				}
				this.title = el.attr('title');
				this.classes = el.attr('class');
				this.data = el.data();
			}

			// checkbox
			if (el.is(':checkbox')) {

				var checkboxOutput = function() {

					var att = new Attributes();
					var checkbox = $('<div class="jq-checkbox"><div class="jq-checkbox__div"></div></div>')
						.attr({
							id: att.id,
							title: att.title
						})
						.addClass(att.classes)
						.data(att.data)
					;

					// прячем оригинальный чекбокс
					el.css({
						position: 'absolute',
						zIndex: '-1',
						opacity: 0,
						margin: 0,
						padding: 0
					}).after(checkbox).prependTo(checkbox);

					checkbox.attr('unselectable', 'on').css({
						'-webkit-user-select': 'none',
						'-moz-user-select': 'none',
						'-ms-user-select': 'none',
						'-o-user-select': 'none',
						'user-select': 'none',
						display: 'inline-block',
						position: 'relative',
						overflow: 'hidden'
					});

					if (el.is(':checked')) checkbox.addClass('checked');
					if (el.is(':disabled')) checkbox.addClass('disabled');

					// клик на псевдочекбокс
					checkbox.click(function(e) {
						e.preventDefault();
						if (!checkbox.is('.disabled')) {
							if (el.is(':checked')) {
								el.prop('checked', false);
								checkbox.removeClass('checked');
							} else {
								el.prop('checked', true);
								checkbox.addClass('checked');
							}
							el.focus().change();
						}
					});
					// клик на label
					el.closest('label').add('label[for="' + el.attr('id') + '"]').on('click.styler', function(e) {
						if (!$(e.target).is('a') && !$(e.target).closest(checkbox).length) {
							checkbox.triggerHandler('click');
							e.preventDefault();
						}
					});
					// переключение по Space или Enter
					el.on('change.styler', function() {
						if (el.is(':checked')) checkbox.addClass('checked');
						else checkbox.removeClass('checked');
					})
					// чтобы переключался чекбокс, который находится в теге label
					.on('keydown.styler', function(e) {
						if (e.which == 32) checkbox.click();
					})
					.on('focus.styler', function() {
						if (!checkbox.is('.disabled')) checkbox.addClass('focused');
					})
					.on('blur.styler', function() {
						checkbox.removeClass('focused');
					});

				}; // end checkboxOutput()

				checkboxOutput();

				// обновление при динамическом изменении
				el.on('refresh', function() {
					el.closest('label').add('label[for="' + el.attr('id') + '"]').off('.styler');
					el.off('.styler').parent().before(el).remove();
					checkboxOutput();
				});

			// end checkbox

			// radio
			} else if (el.is(':radio')) {

				var radioOutput = function() {

					var att = new Attributes();
					var radio = $('<div class="jq-radio"><div class="jq-radio__div"></div></div>')
						.attr({
							id: att.id,
							title: att.title
						})
						.addClass(att.classes)
						.data(att.data)
					;

					// прячем оригинальную радиокнопку
					el.css({
						position: 'absolute',
						zIndex: '-1',
						opacity: 0,
						margin: 0,
						padding: 0
					}).after(radio).prependTo(radio);

					radio.attr('unselectable', 'on').css({
						'-webkit-user-select': 'none',
						'-moz-user-select': 'none',
						'-ms-user-select': 'none',
						'-o-user-select': 'none',
						'user-select': 'none',
						display: 'inline-block',
						position: 'relative'
					});

					if (el.is(':checked')) radio.addClass('checked');
					if (el.is(':disabled')) radio.addClass('disabled');

					// определяем общего родителя у радиокнопок с одинаковым name
					// http://stackoverflow.com/a/27733847
					$.fn.commonParents = function (){
						var cachedThis = this;
						return cachedThis.first().parents().filter(function () {
							return $(this).find(cachedThis).length === cachedThis.length;
						});
					};
					$.fn.commonParent = function (){
						return $(this).commonParents().first();
					};

					// клик на псевдорадиокнопке
					radio.click(function(e) {
						e.preventDefault();
						if (!radio.is('.disabled')) {
							var inputName = $('input[name="' + el.attr('name') + '"]');
							inputName.commonParent().find(inputName).prop('checked', false).parent().removeClass('checked');
							el.prop('checked', true).parent().addClass('checked');
							el.focus().change();
						}
					});
					// клик на label
					el.closest('label').add('label[for="' + el.attr('id') + '"]').on('click.styler', function(e) {
						if (!$(e.target).is('a') && !$(e.target).closest(radio).length) {
							radio.triggerHandler('click');
							e.preventDefault();
						}
					});
					// переключение стрелками
					el.on('change.styler', function() {
						el.parent().addClass('checked');
					})
					.on('focus.styler', function() {
						if (!radio.is('.disabled')) radio.addClass('focused');
					})
					.on('blur.styler', function() {
						radio.removeClass('focused');
					});

				}; // end radioOutput()

				radioOutput();

				// обновление при динамическом изменении
				el.on('refresh', function() {
					el.closest('label').add('label[for="' + el.attr('id') + '"]').off('.styler');
					el.off('.styler').parent().before(el).remove();
					radioOutput();
				});

			// end radio

			// file
			} else if (el.is(':file')) {

				// прячем оригинальное поле
				el.css({
					position: 'absolute',
					top: 0,
					right: 0,
					margin: 0,
					padding: 0,
					opacity: 0,
					fontSize: '100px'
				});

				var fileOutput = function() {

					var att = new Attributes();
					var placeholder = el.data('placeholder');
					if (placeholder === undefined) placeholder = opt.filePlaceholder;
					var browse = el.data('browse');
					if (browse === undefined || browse === '') browse = opt.fileBrowse;

					var file =
						$('<div class="jq-file">' +
								'<div class="jq-file__name">' + placeholder + '</div>' +
								'<div class="jq-file__browse">' + browse + '</div>' +
							'</div>')
						.css({
							display: 'inline-block',
							position: 'relative',
							overflow: 'hidden'
						})
						.attr({
							id: att.id,
							title: att.title
						})
						.addClass(att.classes)
						.data(att.data)
					;

					el.after(file).appendTo(file);
					if (el.is(':disabled')) file.addClass('disabled');

					el.on('change.styler', function() {
						var value = el.val();
						var name = $('div.jq-file__name', file);
						if (el.is('[multiple]')) {
							value = '';
							var files = el[0].files.length;
							if (files > 0) {
								var number = el.data('number');
								if (number === undefined) number = opt.fileNumber;
								number = number.replace('%s', files);
								value = number;
							}
						}
						name.text(value.replace(/.+[\\\/]/, ''));
						if (value === '') {
							name.text(placeholder);
							file.removeClass('changed');
						} else {
							file.addClass('changed');
						}
					})
					.on('focus.styler', function() {
						file.addClass('focused');
					})
					.on('blur.styler', function() {
						file.removeClass('focused');
					})
					.on('click.styler', function() {
						file.removeClass('focused');
					});

				}; // end fileOutput()

				fileOutput();

				// обновление при динамическом изменении
				el.on('refresh', function() {
					el.off('.styler').parent().before(el).remove();
					fileOutput();
				});

			// end file

			} else if (el.is('input[type="number"]')) {

				var numberOutput = function() {

					var att = new Attributes();
					var number =
						$('<div class="jq-number">' +
								'<div class="jq-number__spin minus"></div>' +
								'<div class="jq-number__spin plus"></div>' +
							'</div>')
						.attr({
							id: att.id,
							title: att.title
						})
						.addClass(att.classes)
						.data(att.data)
					;

					el.after(number).prependTo(number).wrap('<div class="jq-number__field"></div>');
					if (el.is(':disabled')) number.addClass('disabled');

					var min,
							max,
							step,
							timeout = null,
							interval = null;
					if (el.attr('min') !== undefined) min = el.attr('min');
					if (el.attr('max') !== undefined) max = el.attr('max');
					if (el.attr('step') !== undefined && $.isNumeric(el.attr('step')))
						step = Number(el.attr('step'));
					else
						step = Number(1);

					var changeValue = function(spin) {
						var value = el.val(),
								newValue;

						if (!$.isNumeric(value)) {
							value = 0;
							el.val('0');
						}

						if (spin.is('.minus')) {
							newValue = Number(value) - step;
						} else if (spin.is('.plus')) {
							newValue = Number(value) + step;
						}

						// определяем количество десятичных знаков после запятой в step
						var decimals = (step.toString().split('.')[1] || []).length;
						if (decimals > 0) {
							var multiplier = '1';
							while (multiplier.length <= decimals) multiplier = multiplier + '0';
							// избегаем появления лишних знаков после запятой
							newValue = Math.round(newValue * multiplier) / multiplier;
						}

						if ($.isNumeric(min) && $.isNumeric(max)) {
							if (newValue >= min && newValue <= max) el.val(newValue);
						} else if ($.isNumeric(min) && !$.isNumeric(max)) {
							if (newValue >= min) el.val(newValue);
						} else if (!$.isNumeric(min) && $.isNumeric(max)) {
							if (newValue <= max) el.val(newValue);
						} else {
							el.val(newValue);
						}
					};

					if (!number.is('.disabled')) {
						number.on('mousedown', 'div.jq-number__spin', function() {
							var spin = $(this);
							changeValue(spin);
							timeout = setTimeout(function(){
								interval = setInterval(function(){ changeValue(spin); }, 40);
							}, 350);
						}).on('mouseup mouseout', 'div.jq-number__spin', function() {
							clearTimeout(timeout);
							clearInterval(interval);
						}).on('mouseup', 'div.jq-number__spin', function() {
							el.change();
						});
						el.on('focus.styler', function() {
							number.addClass('focused');
						})
						.on('blur.styler', function() {
							number.removeClass('focused');
						});
					}

				}; // end numberOutput()

				numberOutput();

				// обновление при динамическом изменении
				el.on('refresh', function() {
					el.off('.styler').closest('.jq-number').before(el).remove();
					numberOutput();
				});

			// end number

			// select
			} else if (el.is('select')) {

				var selectboxOutput = function() {

					// запрещаем прокрутку страницы при прокрутке селекта
					function preventScrolling(selector) {
						selector.off('mousewheel DOMMouseScroll').on('mousewheel DOMMouseScroll', function(e) {
							var scrollTo = null;
							if (e.type == 'mousewheel') { scrollTo = (e.originalEvent.wheelDelta * -1); }
							else if (e.type == 'DOMMouseScroll') { scrollTo = 40 * e.originalEvent.detail; }
							if (scrollTo) {
								e.stopPropagation();
								e.preventDefault();
								$(this).scrollTop(scrollTo + $(this).scrollTop());
							}
						});
					}

					var option = $('option', el);
					var list = '';
					// формируем список селекта
					function makeList() {
						for (var i = 0; i < option.length; i++) {
							var op = option.eq(i);
							var li = '',
									liClass = '',
									liClasses = '',
									id = '',
									title = '',
									dataList = '',
									optionClass = '',
									optgroupClass = '',
									dataJqfsClass = '';
							var disabled = 'disabled';
							var selDis = 'selected sel disabled';
							if (op.prop('selected')) liClass = 'selected sel';
							if (op.is(':disabled')) liClass = disabled;
							if (op.is(':selected:disabled')) liClass = selDis;
							if (op.attr('id') !== undefined && op.attr('id') !== '') id = ' id="' + op.attr('id') + opt.idSuffix + '"';
							if (op.attr('title') !== undefined && option.attr('title') !== '') title = ' title="' + op.attr('title') + '"';
							if (op.attr('class') !== undefined) {
								optionClass = ' ' + op.attr('class');
								dataJqfsClass = ' data-jqfs-class="' + op.attr('class') + '"';
							}

							var data = op.data();
							for (var k in data) {
								if (data[k] !== '') dataList += ' data-' + k + '="' + data[k] + '"';
							}

							if ( (liClass + optionClass) !== '' )   liClasses = ' class="' + liClass + optionClass + '"';
							li = '<li' + dataJqfsClass + dataList + liClasses + title + id + '>'+ op.html() +'</li>';

							// если есть optgroup
							if (op.parent().is('optgroup')) {
								if (op.parent().attr('class') !== undefined) optgroupClass = ' ' + op.parent().attr('class');
								li = '<li' + dataJqfsClass + dataList + ' class="' + liClass + optionClass + ' option' + optgroupClass + '"' + title + id + '>'+ op.html() +'</li>';
								if (op.is(':first-child')) {
									li = '<li class="optgroup' + optgroupClass + '">' + op.parent().attr('label') + '</li>' + li;
								}
							}

							list += li;
						}
					} // end makeList()

					// одиночный селект
					function doSelect() {

						var att = new Attributes();
						var searchHTML = '';
						var selectPlaceholder = el.data('placeholder');
						var selectSearch = el.data('search');
						var selectSearchLimit = el.data('search-limit');
						var selectSearchNotFound = el.data('search-not-found');
						var selectSearchPlaceholder = el.data('search-placeholder');
						var singleSelectzIndex = el.data('z-index');
						var selectSmartPositioning = el.data('smart-positioning');

						if (selectPlaceholder === undefined) selectPlaceholder = opt.selectPlaceholder;
						if (selectSearch === undefined || selectSearch === '') selectSearch = opt.selectSearch;
						if (selectSearchLimit === undefined || selectSearchLimit === '') selectSearchLimit = opt.selectSearchLimit;
						if (selectSearchNotFound === undefined || selectSearchNotFound === '') selectSearchNotFound = opt.selectSearchNotFound;
						if (selectSearchPlaceholder === undefined) selectSearchPlaceholder = opt.selectSearchPlaceholder;
						if (singleSelectzIndex === undefined || singleSelectzIndex === '') singleSelectzIndex = opt.singleSelectzIndex;
						if (selectSmartPositioning === undefined || selectSmartPositioning === '') selectSmartPositioning = opt.selectSmartPositioning;

						var selectbox =
							$('<div class="jq-selectbox jqselect">' +
									'<div class="jq-selectbox__select" style="position: relative">' +
										'<div class="jq-selectbox__select-text"></div>' +
										'<div class="jq-selectbox__trigger">' +
											'<div class="jq-selectbox__trigger-arrow"></div></div>' +
									'</div>' +
								'</div>')
							.css({
								display: 'inline-block',
								position: 'relative',
								zIndex: singleSelectzIndex
							})
							.attr({
								id: att.id,
								title: att.title
							})
							.addClass(att.classes)
							.data(att.data)
						;

						el.css({margin: 0, padding: 0}).after(selectbox).prependTo(selectbox);

						var divSelect = $('div.jq-selectbox__select', selectbox);
						var divText = $('div.jq-selectbox__select-text', selectbox);
						var optionSelected = option.filter(':selected');

						makeList();

						if (selectSearch) searchHTML =
							'<div class="jq-selectbox__search"><input type="search" autocomplete="off" placeholder="' + selectSearchPlaceholder + '"></div>' +
							'<div class="jq-selectbox__not-found">' + selectSearchNotFound + '</div>';
						var dropdown =
							$('<div class="jq-selectbox__dropdown" style="position: absolute">' +
									searchHTML +
									'<ul style="position: relative; list-style: none; overflow: auto; overflow-x: hidden">' + list + '</ul>' +
								'</div>');
						selectbox.append(dropdown);
						var ul = $('ul', dropdown);
						var li = $('li', dropdown);
						var search = $('input', dropdown);
						var notFound = $('div.jq-selectbox__not-found', dropdown).hide();
						if (li.length < selectSearchLimit) search.parent().hide();

						// показываем опцию по умолчанию
						// если у 1-й опции нет текста и она выбрана по умолчанию, то показываем плейсхолдер
						if (option.first().text() === '' && option.first().is(':selected')) {
							divText.text(selectPlaceholder).addClass('placeholder');
						} else {
							divText.text(optionSelected.text());
						}

						// определяем самый широкий пункт селекта
						var liWidthInner = 0,
								liWidth = 0;
						li.css({'display': 'inline-block'});
						li.each(function() {
							var l = $(this);
							if (l.innerWidth() > liWidthInner) {
								liWidthInner = l.innerWidth();
								liWidth = l.width();
							}
						});
						li.css({'display': ''});

						// подстраиваем ширину свернутого селекта в зависимости
						// от ширины плейсхолдера или самого широкого пункта
						if (divText.is('.placeholder') && (divText.width() > liWidthInner)) {
							divText.width(divText.width());
						} else {
							var selClone = selectbox.clone().appendTo('body').width('auto');
							var selCloneWidth = selClone.outerWidth();
							selClone.remove();
							if (selCloneWidth == selectbox.outerWidth()) {
								divText.width(liWidth);
							}
						}

						// подстраиваем ширину выпадающего списка в зависимости от самого широкого пункта
						if (liWidthInner > selectbox.width()) dropdown.width(liWidthInner);

						// прячем 1-ю пустую опцию, если она есть и если атрибут data-placeholder не пустой
						// если все же нужно, чтобы первая пустая опция отображалась, то указываем у селекта: data-placeholder=""
						if (option.first().text() === '' && el.data('placeholder') !== '') {
							li.first().hide();
						}

						// прячем оригинальный селект
						el.css({
							position: 'absolute',
							left: 0,
							top: 0,
							width: '100%',
							height: '100%',
							opacity: 0
						});

						var selectHeight = selectbox.outerHeight(true);
						var searchHeight = search.parent().outerHeight(true);
						var isMaxHeight = ul.css('max-height');
						var liSelected = li.filter('.selected');
						if (liSelected.length < 1) li.first().addClass('selected sel');
						if (li.data('li-height') === undefined) li.data('li-height', li.outerHeight());
						var position = dropdown.css('top');
						if (dropdown.css('left') == 'auto') dropdown.css({left: 0});
						if (dropdown.css('top') == 'auto') {
							dropdown.css({top: selectHeight});
							position = selectHeight;
						}
						dropdown.hide();

						// если выбран не дефолтный пункт
						if (liSelected.length) {
							// добавляем класс, показывающий изменение селекта
							if (option.first().text() != optionSelected.text()) {
								selectbox.addClass('changed');
							}
							// передаем селекту класс выбранного пункта
							selectbox.data('jqfs-class', liSelected.data('jqfs-class'));
							selectbox.addClass(liSelected.data('jqfs-class'));
						}

						// если селект неактивный
						if (el.is(':disabled')) {
							selectbox.addClass('disabled');
							return false;
						}

						// при клике на псевдоселекте
						divSelect.click(function() {

							// колбек при закрытии селекта
							if ($('div.jq-selectbox').filter('.opened').length) {
								opt.onSelectClosed.call($('div.jq-selectbox').filter('.opened'));
							}

							el.focus();

							// если iOS, то не показываем выпадающий список,
							// т.к. отображается нативный и неизвестно, как его спрятать
							if (iOS) return;

							// умное позиционирование
							var win = $(window);
							var liHeight = li.data('li-height');
							var topOffset = selectbox.offset().top;
							var bottomOffset = win.height() - selectHeight - (topOffset - win.scrollTop());
							var visible = el.data('visible-options');
							if (visible === undefined || visible === '') visible = opt.selectVisibleOptions;
							var minHeight = liHeight * 5;
							var newHeight = liHeight * visible;
							if (visible > 0 && visible < 6) minHeight = newHeight;
							if (visible === 0) newHeight = 'auto';

							var dropDown = function() {
								dropdown.height('auto').css({bottom: 'auto', top: position});
								var maxHeightBottom = function() {
									ul.css('max-height', Math.floor((bottomOffset - 20 - searchHeight) / liHeight) * liHeight);
								};
								maxHeightBottom();
								ul.css('max-height', newHeight);
								if (isMaxHeight != 'none') {
									ul.css('max-height', isMaxHeight);
								}
								if (bottomOffset < (dropdown.outerHeight() + 20)) {
									maxHeightBottom();
								}
							};

							var dropUp = function() {
								dropdown.height('auto').css({top: 'auto', bottom: position});
								var maxHeightTop = function() {
									ul.css('max-height', Math.floor((topOffset - win.scrollTop() - 20 - searchHeight) / liHeight) * liHeight);
								};
								maxHeightTop();
								ul.css('max-height', newHeight);
								if (isMaxHeight != 'none') {
									ul.css('max-height', isMaxHeight);
								}
								if ((topOffset - win.scrollTop() - 20) < (dropdown.outerHeight() + 20)) {
									maxHeightTop();
								}
							};

							if (selectSmartPositioning === true || selectSmartPositioning === 1) {
								// раскрытие вниз
								if (bottomOffset > (minHeight + searchHeight + 20)) {
									dropDown();
									selectbox.removeClass('dropup').addClass('dropdown');
								// раскрытие вверх
								} else {
									dropUp();
									selectbox.removeClass('dropdown').addClass('dropup');
								}
							} else if (selectSmartPositioning === false || selectSmartPositioning === 0) {
								// раскрытие вниз
								if (bottomOffset > (minHeight + searchHeight + 20)) {
									dropDown();
									selectbox.removeClass('dropup').addClass('dropdown');
								}
							}

							// если выпадающий список выходит за правый край окна браузера,
							// то меняем позиционирование с левого на правое
							if (selectbox.offset().left + dropdown.outerWidth() > win.width()) {
								dropdown.css({left: 'auto', right: 0});
							}
							// конец умного позиционирования

							$('div.jqselect').css({zIndex: (singleSelectzIndex - 1)}).removeClass('opened');
							selectbox.css({zIndex: singleSelectzIndex});
							if (dropdown.is(':hidden')) {
								$('div.jq-selectbox__dropdown:visible').hide();
								dropdown.show();
								selectbox.addClass('opened focused');
								// колбек при открытии селекта
								opt.onSelectOpened.call(selectbox);
							} else {
								dropdown.hide();
								selectbox.removeClass('opened dropup dropdown');
								// колбек при закрытии селекта
								if ($('div.jq-selectbox').filter('.opened').length) {
									opt.onSelectClosed.call(selectbox);
								}
							}

							// поисковое поле
							if (search.length) {
								search.val('').keyup();
								notFound.hide();
								search.keyup(function() {
									var query = $(this).val();
									li.each(function() {
										if (!$(this).html().match(new RegExp('.*?' + query + '.*?', 'i'))) {
											$(this).hide();
										} else {
											$(this).show();
										}
									});
									// прячем 1-ю пустую опцию
									if (option.first().text() === '' && el.data('placeholder') !== '') {
										li.first().hide();
									}
									if (li.filter(':visible').length < 1) {
										notFound.show();
									} else {
										notFound.hide();
									}
								});
							}

							// прокручиваем до выбранного пункта при открытии списка
							if (li.filter('.selected').length) {
								if (el.val() === '') {
									ul.scrollTop(0);
								} else {
									// если нечетное количество видимых пунктов,
									// то высоту пункта делим пополам для последующего расчета
									if ( (ul.innerHeight() / liHeight) % 2 !== 0 ) liHeight = liHeight / 2;
									ul.scrollTop(ul.scrollTop() + li.filter('.selected').position().top - ul.innerHeight() / 2 + liHeight);
								}
							}

							preventScrolling(ul);

						}); // end divSelect.click()

						// при наведении курсора на пункт списка
						li.hover(function() {
							$(this).siblings().removeClass('selected');
						});
						var selectedText = li.filter('.selected').text();

						// при клике на пункт списка
						li.filter(':not(.disabled):not(.optgroup)').click(function() {
							el.focus();
							var t = $(this);
							var liText = t.text();
							if (!t.is('.selected')) {
								var index = t.index();
								index -= t.prevAll('.optgroup').length;
								t.addClass('selected sel').siblings().removeClass('selected sel');
								option.prop('selected', false).eq(index).prop('selected', true);
								selectedText = liText;
								divText.text(liText);

								// передаем селекту класс выбранного пункта
								if (selectbox.data('jqfs-class')) selectbox.removeClass(selectbox.data('jqfs-class'));
								selectbox.data('jqfs-class', t.data('jqfs-class'));
								selectbox.addClass(t.data('jqfs-class'));

								el.change();
							}
							dropdown.hide();
							selectbox.removeClass('opened dropup dropdown');
							// колбек при закрытии селекта
							opt.onSelectClosed.call(selectbox);

						});
						dropdown.mouseout(function() {
							$('li.sel', dropdown).addClass('selected');
						});

						// изменение селекта
						el.on('change.styler', function() {
							divText.text(option.filter(':selected').text()).removeClass('placeholder');
							li.removeClass('selected sel').not('.optgroup').eq(el[0].selectedIndex).addClass('selected sel');
							// добавляем класс, показывающий изменение селекта
							if (option.first().text() != li.filter('.selected').text()) {
								selectbox.addClass('changed');
							} else {
								selectbox.removeClass('changed');
							}
						})
						.on('focus.styler', function() {
							selectbox.addClass('focused');
							$('div.jqselect').not('.focused').removeClass('opened dropup dropdown').find('div.jq-selectbox__dropdown').hide();
						})
						.on('blur.styler', function() {
							selectbox.removeClass('focused');
						})
						// изменение селекта с клавиатуры
						.on('keydown.styler keyup.styler', function(e) {
							var liHeight = li.data('li-height');
							if (el.val() === '') {
								divText.text(selectPlaceholder).addClass('placeholder');
							} else {
								divText.text(option.filter(':selected').text());
							}
							li.removeClass('selected sel').not('.optgroup').eq(el[0].selectedIndex).addClass('selected sel');
							// вверх, влево, Page Up, Home
							if (e.which == 38 || e.which == 37 || e.which == 33 || e.which == 36) {
								if (el.val() === '') {
									ul.scrollTop(0);
								} else {
									ul.scrollTop(ul.scrollTop() + li.filter('.selected').position().top);
								}
							}
							// вниз, вправо, Page Down, End
							if (e.which == 40 || e.which == 39 || e.which == 34 || e.which == 35) {
								ul.scrollTop(ul.scrollTop() + li.filter('.selected').position().top - ul.innerHeight() + liHeight);
							}
							// закрываем выпадающий список при нажатии Enter
							if (e.which == 13) {
								e.preventDefault();
								dropdown.hide();
								selectbox.removeClass('opened dropup dropdown');
								// колбек при закрытии селекта
								opt.onSelectClosed.call(selectbox);
							}
						}).on('keydown.styler', function(e) {
							// открываем выпадающий список при нажатии Space
							if (e.which == 32) {
								e.preventDefault();
								divSelect.click();
							}
						});

						// прячем выпадающий список при клике за пределами селекта
						if (!onDocumentClick.registered) {
							$(document).on('click', onDocumentClick);
							onDocumentClick.registered = true;
						}

					} // end doSelect()

					// мультиселект
					function doMultipleSelect() {

						var att = new Attributes();
						var selectbox =
							$('<div class="jq-select-multiple jqselect"></div>')
							.css({
								display: 'inline-block',
								position: 'relative'
							})
							.attr({
								id: att.id,
								title: att.title
							})
							.addClass(att.classes)
							.data(att.data)
						;

						el.css({margin: 0, padding: 0}).after(selectbox);

						makeList();
						selectbox.append('<ul>' + list + '</ul>');
						var ul = $('ul', selectbox).css({
							'position': 'relative',
							'overflow-x': 'hidden',
							'-webkit-overflow-scrolling': 'touch'
						});
						var li = $('li', selectbox).attr('unselectable', 'on');
						var size = el.attr('size');
						var ulHeight = ul.outerHeight();
						var liHeight = li.outerHeight();
						if (size !== undefined && size > 0) {
							ul.css({'height': liHeight * size});
						} else {
							ul.css({'height': liHeight * 4});
						}
						if (ulHeight > selectbox.height()) {
							ul.css('overflowY', 'scroll');
							preventScrolling(ul);
							// прокручиваем до выбранного пункта
							if (li.filter('.selected').length) {
								ul.scrollTop(ul.scrollTop() + li.filter('.selected').position().top);
							}
						}

						// прячем оригинальный селект
						el.prependTo(selectbox).css({
							position: 'absolute',
							left: 0,
							top: 0,
							width: '100%',
							height: '100%',
							opacity: 0
						});

						// если селект неактивный
						if (el.is(':disabled')) {
							selectbox.addClass('disabled');
							option.each(function() {
								if ($(this).is(':selected')) li.eq($(this).index()).addClass('selected');
							});

						// если селект активный
						} else {

							// при клике на пункт списка
							li.filter(':not(.disabled):not(.optgroup)').click(function(e) {
								el.focus();
								var clkd = $(this);
								if(!e.ctrlKey && !e.metaKey) clkd.addClass('selected');
								if(!e.shiftKey) clkd.addClass('first');
								if(!e.ctrlKey && !e.metaKey && !e.shiftKey) clkd.siblings().removeClass('selected first');

								// выделение пунктов при зажатом Ctrl
								if(e.ctrlKey || e.metaKey) {
									if (clkd.is('.selected')) clkd.removeClass('selected first');
										else clkd.addClass('selected first');
									clkd.siblings().removeClass('first');
								}

								// выделение пунктов при зажатом Shift
								if(e.shiftKey) {
									var prev = false,
											next = false;
									clkd.siblings().removeClass('selected').siblings('.first').addClass('selected');
									clkd.prevAll().each(function() {
										if ($(this).is('.first')) prev = true;
									});
									clkd.nextAll().each(function() {
										if ($(this).is('.first')) next = true;
									});
									if (prev) {
										clkd.prevAll().each(function() {
											if ($(this).is('.selected')) return false;
												else $(this).not('.disabled, .optgroup').addClass('selected');
										});
									}
									if (next) {
										clkd.nextAll().each(function() {
											if ($(this).is('.selected')) return false;
												else $(this).not('.disabled, .optgroup').addClass('selected');
										});
									}
									if (li.filter('.selected').length == 1) clkd.addClass('first');
								}

								// отмечаем выбранные мышью
								option.prop('selected', false);
								li.filter('.selected').each(function() {
									var t = $(this);
									var index = t.index();
									if (t.is('.option')) index -= t.prevAll('.optgroup').length;
									option.eq(index).prop('selected', true);
								});
								el.change();

							});

							// отмечаем выбранные с клавиатуры
							option.each(function(i) {
								$(this).data('optionIndex', i);
							});
							el.on('change.styler', function() {
								li.removeClass('selected');
								var arrIndexes = [];
								option.filter(':selected').each(function() {
									arrIndexes.push($(this).data('optionIndex'));
								});
								li.not('.optgroup').filter(function(i) {
									return $.inArray(i, arrIndexes) > -1;
								}).addClass('selected');
							})
							.on('focus.styler', function() {
								selectbox.addClass('focused');
							})
							.on('blur.styler', function() {
								selectbox.removeClass('focused');
							});

							// прокручиваем с клавиатуры
							if (ulHeight > selectbox.height()) {
								el.on('keydown.styler', function(e) {
									// вверх, влево, PageUp
									if (e.which == 38 || e.which == 37 || e.which == 33) {
										ul.scrollTop(ul.scrollTop() + li.filter('.selected').position().top - liHeight);
									}
									// вниз, вправо, PageDown
									if (e.which == 40 || e.which == 39 || e.which == 34) {
										ul.scrollTop(ul.scrollTop() + li.filter('.selected:last').position().top - ul.innerHeight() + liHeight * 2);
									}
								});
							}

						}
					} // end doMultipleSelect()

					if (el.is('[multiple]')) {

						// если Android или iOS, то мультиселект не стилизуем
						// причина для Android - в стилизованном селекте нет возможности выбрать несколько пунктов
						// причина для iOS - в стилизованном селекте неправильно отображаются выбранные пункты
						if (Android || iOS) return;

						doMultipleSelect();
					} else {
						doSelect();
					}

				}; // end selectboxOutput()

				selectboxOutput();

				// обновление при динамическом изменении
				el.on('refresh', function() {
					el.off('.styler').parent().before(el).remove();
					selectboxOutput();
				});

			// end select

			// reset
			} else if (el.is(':reset')) {
				el.on('click', function() {
					setTimeout(function() {
						el.closest('form').find('input, select').trigger('refresh');
					}, 1);
				});
			} // end reset

		}, // init: function()

		// деструктор
		destroy: function() {

			var el = $(this.element);

			if (el.is(':checkbox') || el.is(':radio')) {
				el.removeData('_' + pluginName).off('.styler refresh').removeAttr('style').parent().before(el).remove();
				el.closest('label').add('label[for="' + el.attr('id') + '"]').off('.styler');
			} else if (el.is('input[type="number"]')) {
				el.removeData('_' + pluginName).off('.styler refresh').closest('.jq-number').before(el).remove();
			} else if (el.is(':file') || el.is('select')) {
				el.removeData('_' + pluginName).off('.styler refresh').removeAttr('style').parent().before(el).remove();
			}

		} // destroy: function()

	}; // Plugin.prototype

	$.fn[pluginName] = function(options) {
		var args = arguments;
		if (options === undefined || typeof options === 'object') {
			this.each(function() {
				if (!$.data(this, '_' + pluginName)) {
					$.data(this, '_' + pluginName, new Plugin(this, options));
				}
			})
			// колбек после выполнения плагина
			.promise()
			.done(function() {
				var opt = $(this[0]).data('_' + pluginName);
				if (opt) opt.options.onFormStyled.call();
			});
			return this;
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
			var returns;
			this.each(function() {
				var instance = $.data(this, '_' + pluginName);
				if (instance instanceof Plugin && typeof instance[options] === 'function') {
					returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
				}
			});
			return returns !== undefined ? returns : this;
		}
	};

	// прячем выпадающий список при клике за пределами селекта
	function onDocumentClick(e) {
		// e.target.nodeName != 'OPTION' - добавлено для обхода бага в Opera на движке Presto
		// (при изменении селекта с клавиатуры срабатывает событие onclick)
		if (!$(e.target).parents().hasClass('jq-selectbox') && e.target.nodeName != 'OPTION') {
			if ($('div.jq-selectbox.opened').length) {
				var selectbox = $('div.jq-selectbox.opened'),
						search = $('div.jq-selectbox__search input', selectbox),
						dropdown = $('div.jq-selectbox__dropdown', selectbox),
						opt = selectbox.find('select').data('_' + pluginName).options;

				// колбек при закрытии селекта
				opt.onSelectClosed.call(selectbox);

				if (search.length) search.val('').keyup();
				dropdown.hide().find('li.sel').addClass('selected');
				selectbox.removeClass('focused opened dropup dropdown');
			}
		}
	}
	onDocumentClick.registered = false;

}));
$(document).ready(function () {

    /*SLIDER*/
    $('.slider').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: true,
        prevArrow: '<span type="button" class="slick-prev"></span>',
        nextArrow: '<span type="button" class="slick-next"></span>',
    });

    var topSales = $('.top-sales__cover'),
        countSlidesTop = topSales.find('.sale__item').length,
        slidesToShowTop = null;

    if(countSlidesTop > 3 || countSlidesTop > 1 && $(window).width() < 480 || countSlidesTop > 2 && $(window).width() < 720) {
        if($(window).width() < 480) {
            slidesToShowTop = 1;
        }
        if($(window).width() < 720 && $(window).width() >= 480) {
            slidesToShowTop = 2;
        }
        if(countSlidesTop > 3) {
            slidesToShowTop = 3;
        }
        $('.top-sales__cover').slick({
            slidesToShow: 4,
            slidesToScroll: 1,
            dots: 'true',
            variableWidth: true,
            infinite: true,
            prevArrow: '<span type="button" class="slick-prev"></span>',
            nextArrow: '<span type="button" class="slick-next"></span>',
            responsive: [{
                breakpoint: 321,
                settings: {
                    slidesToShow: 1,
                    centerMode: true
                }
            }, {
                breakpoint: 960,
                settings: {
                    slidesToShow: slidesToShowTop || 3,
                    centerMode: true
                }
            }]
        });
    } else {
        topSales.css({'display': 'flex', 'justify-content': 'center'}).find('.sale__item').css({'margin': '0 15px'});
    }



    var thisSlider = $('.looked-items__cover'),
        countSlidesLooked = thisSlider.find('.sale__item').length,
        slidesToShowLooked = null;

    if(countSlidesLooked > 3 || countSlidesLooked > 1 && $(window).width() < 480 || countSlidesLooked > 2 && $(window).width() < 720) {
        if($(window).width() < 480) {
            slidesToShowLooked = 1;
        }
        if($(window).width() < 720 && $(window).width() >= 480) {
            slidesToShowLooked = 2;
        }
        if(countSlidesLooked > 3) {
            slidesToShowLooked = 3;
        }

        $('.looked-items__cover').slick({
            slidesToShow: 4,
            slidesToScroll: 1,
            dots: 'true',
            adaptiveHeight: false,
            infinite: true,
            variableWidth: true,
            prevArrow: '<span type="button" class="slick-prev"></span>',
            nextArrow: '<span type="button" class="slick-next"></span>',
            responsive: [{
                breakpoint: 960,
                settings: {
                    slidesToShow: slidesToShowLooked || 3,
                    centerMode: true
                }
            }]
        });
    } else {
        thisSlider.css({'display': 'flex', 'justify-content': 'center'}).find('.sale__item').css({'margin': '0 15px'});
    }



    $('.big-slider').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        infinite: true,
        dots: 'false',
        asNavFor: '.small-slider'
        //variableWidth: true
      });

    $('.small-slider').slick({
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        dots: 'false',
        asNavFor: '.big-slider',
        focusOnSelect: true,
        prevArrow: '<span type="button" class="slick-prev"></span>',
        nextArrow: '<span type="button" class="slick-next"></span>',
        variableWidth: true,
        responsive: [{
            breakpoint: 950,
            settings: {
                centerMode: true
            }
        }, {
            breakpoint: 670,
            settings: {
                arrows: false,
                centerMode: true
            }
        }]
    });
}); /**
 * Created by Вячеслав on 22.11.2016.
 */

/**
 * Swiper 3.4.1
 * Most modern mobile touch slider and framework with hardware accelerated transitions
 * 
 * http://www.idangero.us/swiper/
 * 
 * Copyright 2016, Vladimir Kharlampidi
 * The iDangero.us
 * http://www.idangero.us/
 * 
 * Licensed under MIT
 * 
 * Released on: December 13, 2016
 */
!function(){"use strict";function e(e){e.fn.swiper=function(a){var s;return e(this).each(function(){var e=new t(this,a);s||(s=e)}),s}}var a,t=function(e,i){function r(e){return Math.floor(e)}function n(){var e=b.params.autoplay,a=b.slides.eq(b.activeIndex);a.attr("data-swiper-autoplay")&&(e=a.attr("data-swiper-autoplay")||b.params.autoplay),b.autoplayTimeoutId=setTimeout(function(){b.params.loop?(b.fixLoop(),b._slideNext(),b.emit("onAutoplay",b)):b.isEnd?i.autoplayStopOnLast?b.stopAutoplay():(b._slideTo(0),b.emit("onAutoplay",b)):(b._slideNext(),b.emit("onAutoplay",b))},e)}function o(e,t){var s=a(e.target);if(!s.is(t))if("string"==typeof t)s=s.parents(t);else if(t.nodeType){var i;return s.parents().each(function(e,a){a===t&&(i=t)}),i?t:void 0}if(0!==s.length)return s[0]}function l(e,a){a=a||{};var t=window.MutationObserver||window.WebkitMutationObserver,s=new t(function(e){e.forEach(function(e){b.onResize(!0),b.emit("onObserverUpdate",b,e)})});s.observe(e,{attributes:"undefined"==typeof a.attributes||a.attributes,childList:"undefined"==typeof a.childList||a.childList,characterData:"undefined"==typeof a.characterData||a.characterData}),b.observers.push(s)}function p(e){e.originalEvent&&(e=e.originalEvent);var a=e.keyCode||e.charCode;if(!b.params.allowSwipeToNext&&(b.isHorizontal()&&39===a||!b.isHorizontal()&&40===a))return!1;if(!b.params.allowSwipeToPrev&&(b.isHorizontal()&&37===a||!b.isHorizontal()&&38===a))return!1;if(!(e.shiftKey||e.altKey||e.ctrlKey||e.metaKey||document.activeElement&&document.activeElement.nodeName&&("input"===document.activeElement.nodeName.toLowerCase()||"textarea"===document.activeElement.nodeName.toLowerCase()))){if(37===a||39===a||38===a||40===a){var t=!1;if(b.container.parents("."+b.params.slideClass).length>0&&0===b.container.parents("."+b.params.slideActiveClass).length)return;var s={left:window.pageXOffset,top:window.pageYOffset},i=window.innerWidth,r=window.innerHeight,n=b.container.offset();b.rtl&&(n.left=n.left-b.container[0].scrollLeft);for(var o=[[n.left,n.top],[n.left+b.width,n.top],[n.left,n.top+b.height],[n.left+b.width,n.top+b.height]],l=0;l<o.length;l++){var p=o[l];p[0]>=s.left&&p[0]<=s.left+i&&p[1]>=s.top&&p[1]<=s.top+r&&(t=!0)}if(!t)return}b.isHorizontal()?(37!==a&&39!==a||(e.preventDefault?e.preventDefault():e.returnValue=!1),(39===a&&!b.rtl||37===a&&b.rtl)&&b.slideNext(),(37===a&&!b.rtl||39===a&&b.rtl)&&b.slidePrev()):(38!==a&&40!==a||(e.preventDefault?e.preventDefault():e.returnValue=!1),40===a&&b.slideNext(),38===a&&b.slidePrev())}}function d(){var e="onwheel",a=e in document;if(!a){var t=document.createElement("div");t.setAttribute(e,"return;"),a="function"==typeof t[e]}return!a&&document.implementation&&document.implementation.hasFeature&&document.implementation.hasFeature("","")!==!0&&(a=document.implementation.hasFeature("Events.wheel","3.0")),a}function u(e){e.originalEvent&&(e=e.originalEvent);var a=0,t=b.rtl?-1:1,s=c(e);if(b.params.mousewheelForceToAxis)if(b.isHorizontal()){if(!(Math.abs(s.pixelX)>Math.abs(s.pixelY)))return;a=s.pixelX*t}else{if(!(Math.abs(s.pixelY)>Math.abs(s.pixelX)))return;a=s.pixelY}else a=Math.abs(s.pixelX)>Math.abs(s.pixelY)?-s.pixelX*t:-s.pixelY;if(0!==a){if(b.params.mousewheelInvert&&(a=-a),b.params.freeMode){var i=b.getWrapperTranslate()+a*b.params.mousewheelSensitivity,r=b.isBeginning,n=b.isEnd;if(i>=b.minTranslate()&&(i=b.minTranslate()),i<=b.maxTranslate()&&(i=b.maxTranslate()),b.setWrapperTransition(0),b.setWrapperTranslate(i),b.updateProgress(),b.updateActiveIndex(),(!r&&b.isBeginning||!n&&b.isEnd)&&b.updateClasses(),b.params.freeModeSticky?(clearTimeout(b.mousewheel.timeout),b.mousewheel.timeout=setTimeout(function(){b.slideReset()},300)):b.params.lazyLoading&&b.lazy&&b.lazy.load(),b.emit("onScroll",b,e),b.params.autoplay&&b.params.autoplayDisableOnInteraction&&b.stopAutoplay(),0===i||i===b.maxTranslate())return}else{if((new window.Date).getTime()-b.mousewheel.lastScrollTime>60)if(a<0)if(b.isEnd&&!b.params.loop||b.animating){if(b.params.mousewheelReleaseOnEdges)return!0}else b.slideNext(),b.emit("onScroll",b,e);else if(b.isBeginning&&!b.params.loop||b.animating){if(b.params.mousewheelReleaseOnEdges)return!0}else b.slidePrev(),b.emit("onScroll",b,e);b.mousewheel.lastScrollTime=(new window.Date).getTime()}return e.preventDefault?e.preventDefault():e.returnValue=!1,!1}}function c(e){var a=10,t=40,s=800,i=0,r=0,n=0,o=0;return"detail"in e&&(r=e.detail),"wheelDelta"in e&&(r=-e.wheelDelta/120),"wheelDeltaY"in e&&(r=-e.wheelDeltaY/120),"wheelDeltaX"in e&&(i=-e.wheelDeltaX/120),"axis"in e&&e.axis===e.HORIZONTAL_AXIS&&(i=r,r=0),n=i*a,o=r*a,"deltaY"in e&&(o=e.deltaY),"deltaX"in e&&(n=e.deltaX),(n||o)&&e.deltaMode&&(1===e.deltaMode?(n*=t,o*=t):(n*=s,o*=s)),n&&!i&&(i=n<1?-1:1),o&&!r&&(r=o<1?-1:1),{spinX:i,spinY:r,pixelX:n,pixelY:o}}function m(e,t){e=a(e);var s,i,r,n=b.rtl?-1:1;s=e.attr("data-swiper-parallax")||"0",i=e.attr("data-swiper-parallax-x"),r=e.attr("data-swiper-parallax-y"),i||r?(i=i||"0",r=r||"0"):b.isHorizontal()?(i=s,r="0"):(r=s,i="0"),i=i.indexOf("%")>=0?parseInt(i,10)*t*n+"%":i*t*n+"px",r=r.indexOf("%")>=0?parseInt(r,10)*t+"%":r*t+"px",e.transform("translate3d("+i+", "+r+",0px)")}function h(e){return 0!==e.indexOf("on")&&(e=e[0]!==e[0].toUpperCase()?"on"+e[0].toUpperCase()+e.substring(1):"on"+e),e}if(!(this instanceof t))return new t(e,i);var g={direction:"horizontal",touchEventsTarget:"container",initialSlide:0,speed:300,autoplay:!1,autoplayDisableOnInteraction:!0,autoplayStopOnLast:!1,iOSEdgeSwipeDetection:!1,iOSEdgeSwipeThreshold:20,freeMode:!1,freeModeMomentum:!0,freeModeMomentumRatio:1,freeModeMomentumBounce:!0,freeModeMomentumBounceRatio:1,freeModeMomentumVelocityRatio:1,freeModeSticky:!1,freeModeMinimumVelocity:.02,autoHeight:!1,setWrapperSize:!1,virtualTranslate:!1,effect:"slide",coverflow:{rotate:50,stretch:0,depth:100,modifier:1,slideShadows:!0},flip:{slideShadows:!0,limitRotation:!0},cube:{slideShadows:!0,shadow:!0,shadowOffset:20,shadowScale:.94},fade:{crossFade:!1},parallax:!1,zoom:!1,zoomMax:3,zoomMin:1,zoomToggle:!0,scrollbar:null,scrollbarHide:!0,scrollbarDraggable:!1,scrollbarSnapOnRelease:!1,keyboardControl:!1,mousewheelControl:!1,mousewheelReleaseOnEdges:!1,mousewheelInvert:!1,mousewheelForceToAxis:!1,mousewheelSensitivity:1,mousewheelEventsTarged:"container",hashnav:!1,hashnavWatchState:!1,history:!1,replaceState:!1,breakpoints:void 0,spaceBetween:0,slidesPerView:1,slidesPerColumn:1,slidesPerColumnFill:"column",slidesPerGroup:1,centeredSlides:!1,slidesOffsetBefore:0,slidesOffsetAfter:0,roundLengths:!1,touchRatio:1,touchAngle:45,simulateTouch:!0,shortSwipes:!0,longSwipes:!0,longSwipesRatio:.5,longSwipesMs:300,followFinger:!0,onlyExternal:!1,threshold:0,touchMoveStopPropagation:!0,touchReleaseOnEdges:!1,uniqueNavElements:!0,pagination:null,paginationElement:"span",paginationClickable:!1,paginationHide:!1,paginationBulletRender:null,paginationProgressRender:null,paginationFractionRender:null,paginationCustomRender:null,paginationType:"bullets",resistance:!0,resistanceRatio:.85,nextButton:null,prevButton:null,watchSlidesProgress:!1,watchSlidesVisibility:!1,grabCursor:!1,preventClicks:!0,preventClicksPropagation:!0,slideToClickedSlide:!1,lazyLoading:!1,lazyLoadingInPrevNext:!1,lazyLoadingInPrevNextAmount:1,lazyLoadingOnTransitionStart:!1,preloadImages:!0,updateOnImagesReady:!0,loop:!1,loopAdditionalSlides:0,loopedSlides:null,control:void 0,controlInverse:!1,controlBy:"slide",normalizeSlideIndex:!0,allowSwipeToPrev:!0,allowSwipeToNext:!0,swipeHandler:null,noSwiping:!0,noSwipingClass:"swiper-no-swiping",passiveListeners:!0,containerModifierClass:"swiper-container-",slideClass:"swiper-slide",slideActiveClass:"swiper-slide-active",slideDuplicateActiveClass:"swiper-slide-duplicate-active",slideVisibleClass:"swiper-slide-visible",slideDuplicateClass:"swiper-slide-duplicate",slideNextClass:"swiper-slide-next",slideDuplicateNextClass:"swiper-slide-duplicate-next",slidePrevClass:"swiper-slide-prev",slideDuplicatePrevClass:"swiper-slide-duplicate-prev",wrapperClass:"swiper-wrapper",bulletClass:"swiper-pagination-bullet",bulletActiveClass:"swiper-pagination-bullet-active",buttonDisabledClass:"swiper-button-disabled",paginationCurrentClass:"swiper-pagination-current",paginationTotalClass:"swiper-pagination-total",paginationHiddenClass:"swiper-pagination-hidden",paginationProgressbarClass:"swiper-pagination-progressbar",paginationClickableClass:"swiper-pagination-clickable",paginationModifierClass:"swiper-pagination-",lazyLoadingClass:"swiper-lazy",lazyStatusLoadingClass:"swiper-lazy-loading",lazyStatusLoadedClass:"swiper-lazy-loaded",lazyPreloaderClass:"swiper-lazy-preloader",notificationClass:"swiper-notification",preloaderClass:"preloader",zoomContainerClass:"swiper-zoom-container",observer:!1,observeParents:!1,a11y:!1,prevSlideMessage:"Previous slide",nextSlideMessage:"Next slide",firstSlideMessage:"This is the first slide",lastSlideMessage:"This is the last slide",paginationBulletMessage:"Go to slide {{index}}",runCallbacksOnInit:!0},f=i&&i.virtualTranslate;i=i||{};var v={};for(var w in i)if("object"!=typeof i[w]||null===i[w]||(i[w].nodeType||i[w]===window||i[w]===document||"undefined"!=typeof s&&i[w]instanceof s||"undefined"!=typeof jQuery&&i[w]instanceof jQuery))v[w]=i[w];else{v[w]={};for(var y in i[w])v[w][y]=i[w][y]}for(var x in g)if("undefined"==typeof i[x])i[x]=g[x];else if("object"==typeof i[x])for(var T in g[x])"undefined"==typeof i[x][T]&&(i[x][T]=g[x][T]);var b=this;if(b.params=i,b.originalParams=v,b.classNames=[],"undefined"!=typeof a&&"undefined"!=typeof s&&(a=s),("undefined"!=typeof a||(a="undefined"==typeof s?window.Dom7||window.Zepto||window.jQuery:s))&&(b.$=a,b.currentBreakpoint=void 0,b.getActiveBreakpoint=function(){if(!b.params.breakpoints)return!1;var e,a=!1,t=[];for(e in b.params.breakpoints)b.params.breakpoints.hasOwnProperty(e)&&t.push(e);t.sort(function(e,a){return parseInt(e,10)>parseInt(a,10)});for(var s=0;s<t.length;s++)e=t[s],e>=window.innerWidth&&!a&&(a=e);return a||"max"},b.setBreakpoint=function(){var e=b.getActiveBreakpoint();if(e&&b.currentBreakpoint!==e){var a=e in b.params.breakpoints?b.params.breakpoints[e]:b.originalParams,t=b.params.loop&&a.slidesPerView!==b.params.slidesPerView;for(var s in a)b.params[s]=a[s];b.currentBreakpoint=e,t&&b.destroyLoop&&b.reLoop(!0)}},b.params.breakpoints&&b.setBreakpoint(),b.container=a(e),0!==b.container.length)){if(b.container.length>1){var S=[];return b.container.each(function(){S.push(new t(this,i))}),S}b.container[0].swiper=b,b.container.data("swiper",b),b.classNames.push(b.params.containerModifierClass+b.params.direction),b.params.freeMode&&b.classNames.push(b.params.containerModifierClass+"free-mode"),b.support.flexbox||(b.classNames.push(b.params.containerModifierClass+"no-flexbox"),b.params.slidesPerColumn=1),b.params.autoHeight&&b.classNames.push(b.params.containerModifierClass+"autoheight"),(b.params.parallax||b.params.watchSlidesVisibility)&&(b.params.watchSlidesProgress=!0),b.params.touchReleaseOnEdges&&(b.params.resistanceRatio=0),["cube","coverflow","flip"].indexOf(b.params.effect)>=0&&(b.support.transforms3d?(b.params.watchSlidesProgress=!0,b.classNames.push(b.params.containerModifierClass+"3d")):b.params.effect="slide"),"slide"!==b.params.effect&&b.classNames.push(b.params.containerModifierClass+b.params.effect),"cube"===b.params.effect&&(b.params.resistanceRatio=0,b.params.slidesPerView=1,b.params.slidesPerColumn=1,b.params.slidesPerGroup=1,b.params.centeredSlides=!1,b.params.spaceBetween=0,b.params.virtualTranslate=!0,b.params.setWrapperSize=!1),"fade"!==b.params.effect&&"flip"!==b.params.effect||(b.params.slidesPerView=1,b.params.slidesPerColumn=1,b.params.slidesPerGroup=1,b.params.watchSlidesProgress=!0,b.params.spaceBetween=0,b.params.setWrapperSize=!1,"undefined"==typeof f&&(b.params.virtualTranslate=!0)),b.params.grabCursor&&b.support.touch&&(b.params.grabCursor=!1),b.wrapper=b.container.children("."+b.params.wrapperClass),b.params.pagination&&(b.paginationContainer=a(b.params.pagination),b.params.uniqueNavElements&&"string"==typeof b.params.pagination&&b.paginationContainer.length>1&&1===b.container.find(b.params.pagination).length&&(b.paginationContainer=b.container.find(b.params.pagination)),"bullets"===b.params.paginationType&&b.params.paginationClickable?b.paginationContainer.addClass(b.params.paginationModifierClass+"clickable"):b.params.paginationClickable=!1,b.paginationContainer.addClass(b.params.paginationModifierClass+b.params.paginationType)),(b.params.nextButton||b.params.prevButton)&&(b.params.nextButton&&(b.nextButton=a(b.params.nextButton),b.params.uniqueNavElements&&"string"==typeof b.params.nextButton&&b.nextButton.length>1&&1===b.container.find(b.params.nextButton).length&&(b.nextButton=b.container.find(b.params.nextButton))),b.params.prevButton&&(b.prevButton=a(b.params.prevButton),b.params.uniqueNavElements&&"string"==typeof b.params.prevButton&&b.prevButton.length>1&&1===b.container.find(b.params.prevButton).length&&(b.prevButton=b.container.find(b.params.prevButton)))),b.isHorizontal=function(){return"horizontal"===b.params.direction},b.rtl=b.isHorizontal()&&("rtl"===b.container[0].dir.toLowerCase()||"rtl"===b.container.css("direction")),b.rtl&&b.classNames.push(b.params.containerModifierClass+"rtl"),b.rtl&&(b.wrongRTL="-webkit-box"===b.wrapper.css("display")),b.params.slidesPerColumn>1&&b.classNames.push(b.params.containerModifierClass+"multirow"),b.device.android&&b.classNames.push(b.params.containerModifierClass+"android"),b.container.addClass(b.classNames.join(" ")),b.translate=0,b.progress=0,b.velocity=0,b.lockSwipeToNext=function(){b.params.allowSwipeToNext=!1,b.params.allowSwipeToPrev===!1&&b.params.grabCursor&&b.unsetGrabCursor()},b.lockSwipeToPrev=function(){b.params.allowSwipeToPrev=!1,b.params.allowSwipeToNext===!1&&b.params.grabCursor&&b.unsetGrabCursor()},b.lockSwipes=function(){b.params.allowSwipeToNext=b.params.allowSwipeToPrev=!1,b.params.grabCursor&&b.unsetGrabCursor()},b.unlockSwipeToNext=function(){b.params.allowSwipeToNext=!0,b.params.allowSwipeToPrev===!0&&b.params.grabCursor&&b.setGrabCursor()},b.unlockSwipeToPrev=function(){b.params.allowSwipeToPrev=!0,b.params.allowSwipeToNext===!0&&b.params.grabCursor&&b.setGrabCursor()},b.unlockSwipes=function(){b.params.allowSwipeToNext=b.params.allowSwipeToPrev=!0,b.params.grabCursor&&b.setGrabCursor()},b.setGrabCursor=function(e){b.container[0].style.cursor="move",b.container[0].style.cursor=e?"-webkit-grabbing":"-webkit-grab",b.container[0].style.cursor=e?"-moz-grabbin":"-moz-grab",b.container[0].style.cursor=e?"grabbing":"grab"},b.unsetGrabCursor=function(){b.container[0].style.cursor=""},b.params.grabCursor&&b.setGrabCursor(),b.imagesToLoad=[],b.imagesLoaded=0,b.loadImage=function(e,a,t,s,i,r){function n(){r&&r()}var o;e.complete&&i?n():a?(o=new window.Image,o.onload=n,o.onerror=n,s&&(o.sizes=s),t&&(o.srcset=t),a&&(o.src=a)):n()},b.preloadImages=function(){function e(){"undefined"!=typeof b&&null!==b&&b&&(void 0!==b.imagesLoaded&&b.imagesLoaded++,b.imagesLoaded===b.imagesToLoad.length&&(b.params.updateOnImagesReady&&b.update(),b.emit("onImagesReady",b)))}b.imagesToLoad=b.container.find("img");for(var a=0;a<b.imagesToLoad.length;a++)b.loadImage(b.imagesToLoad[a],b.imagesToLoad[a].currentSrc||b.imagesToLoad[a].getAttribute("src"),b.imagesToLoad[a].srcset||b.imagesToLoad[a].getAttribute("srcset"),b.imagesToLoad[a].sizes||b.imagesToLoad[a].getAttribute("sizes"),!0,e)},b.autoplayTimeoutId=void 0,b.autoplaying=!1,b.autoplayPaused=!1,b.startAutoplay=function(){return"undefined"==typeof b.autoplayTimeoutId&&(!!b.params.autoplay&&(!b.autoplaying&&(b.autoplaying=!0,b.emit("onAutoplayStart",b),void n())))},b.stopAutoplay=function(e){b.autoplayTimeoutId&&(b.autoplayTimeoutId&&clearTimeout(b.autoplayTimeoutId),b.autoplaying=!1,b.autoplayTimeoutId=void 0,b.emit("onAutoplayStop",b))},b.pauseAutoplay=function(e){b.autoplayPaused||(b.autoplayTimeoutId&&clearTimeout(b.autoplayTimeoutId),b.autoplayPaused=!0,0===e?(b.autoplayPaused=!1,n()):b.wrapper.transitionEnd(function(){b&&(b.autoplayPaused=!1,b.autoplaying?n():b.stopAutoplay())}))},b.minTranslate=function(){return-b.snapGrid[0]},b.maxTranslate=function(){return-b.snapGrid[b.snapGrid.length-1]},b.updateAutoHeight=function(){var e,a=[],t=0;if("auto"!==b.params.slidesPerView&&b.params.slidesPerView>1)for(e=0;e<Math.ceil(b.params.slidesPerView);e++){var s=b.activeIndex+e;if(s>b.slides.length)break;a.push(b.slides.eq(s)[0])}else a.push(b.slides.eq(b.activeIndex)[0]);for(e=0;e<a.length;e++)if("undefined"!=typeof a[e]){var i=a[e].offsetHeight;t=i>t?i:t}t&&b.wrapper.css("height",t+"px")},b.updateContainerSize=function(){var e,a;e="undefined"!=typeof b.params.width?b.params.width:b.container[0].clientWidth,a="undefined"!=typeof b.params.height?b.params.height:b.container[0].clientHeight,0===e&&b.isHorizontal()||0===a&&!b.isHorizontal()||(e=e-parseInt(b.container.css("padding-left"),10)-parseInt(b.container.css("padding-right"),10),a=a-parseInt(b.container.css("padding-top"),10)-parseInt(b.container.css("padding-bottom"),10),b.width=e,b.height=a,b.size=b.isHorizontal()?b.width:b.height)},b.updateSlidesSize=function(){b.slides=b.wrapper.children("."+b.params.slideClass),b.snapGrid=[],b.slidesGrid=[],b.slidesSizesGrid=[];var e,a=b.params.spaceBetween,t=-b.params.slidesOffsetBefore,s=0,i=0;if("undefined"!=typeof b.size){"string"==typeof a&&a.indexOf("%")>=0&&(a=parseFloat(a.replace("%",""))/100*b.size),b.virtualSize=-a,b.rtl?b.slides.css({marginLeft:"",marginTop:""}):b.slides.css({marginRight:"",marginBottom:""});var n;b.params.slidesPerColumn>1&&(n=Math.floor(b.slides.length/b.params.slidesPerColumn)===b.slides.length/b.params.slidesPerColumn?b.slides.length:Math.ceil(b.slides.length/b.params.slidesPerColumn)*b.params.slidesPerColumn,"auto"!==b.params.slidesPerView&&"row"===b.params.slidesPerColumnFill&&(n=Math.max(n,b.params.slidesPerView*b.params.slidesPerColumn)));var o,l=b.params.slidesPerColumn,p=n/l,d=p-(b.params.slidesPerColumn*p-b.slides.length);for(e=0;e<b.slides.length;e++){o=0;var u=b.slides.eq(e);if(b.params.slidesPerColumn>1){var c,m,h;"column"===b.params.slidesPerColumnFill?(m=Math.floor(e/l),h=e-m*l,(m>d||m===d&&h===l-1)&&++h>=l&&(h=0,m++),c=m+h*n/l,u.css({"-webkit-box-ordinal-group":c,"-moz-box-ordinal-group":c,"-ms-flex-order":c,"-webkit-order":c,order:c})):(h=Math.floor(e/p),m=e-h*p),u.css("margin-"+(b.isHorizontal()?"top":"left"),0!==h&&b.params.spaceBetween&&b.params.spaceBetween+"px").attr("data-swiper-column",m).attr("data-swiper-row",h)}"none"!==u.css("display")&&("auto"===b.params.slidesPerView?(o=b.isHorizontal()?u.outerWidth(!0):u.outerHeight(!0),b.params.roundLengths&&(o=r(o))):(o=(b.size-(b.params.slidesPerView-1)*a)/b.params.slidesPerView,b.params.roundLengths&&(o=r(o)),b.isHorizontal()?b.slides[e].style.width=o+"px":b.slides[e].style.height=o+"px"),b.slides[e].swiperSlideSize=o,b.slidesSizesGrid.push(o),b.params.centeredSlides?(t=t+o/2+s/2+a,0===e&&(t=t-b.size/2-a),Math.abs(t)<.001&&(t=0),i%b.params.slidesPerGroup===0&&b.snapGrid.push(t),b.slidesGrid.push(t)):(i%b.params.slidesPerGroup===0&&b.snapGrid.push(t),b.slidesGrid.push(t),t=t+o+a),b.virtualSize+=o+a,s=o,i++)}b.virtualSize=Math.max(b.virtualSize,b.size)+b.params.slidesOffsetAfter;var g;if(b.rtl&&b.wrongRTL&&("slide"===b.params.effect||"coverflow"===b.params.effect)&&b.wrapper.css({width:b.virtualSize+b.params.spaceBetween+"px"}),b.support.flexbox&&!b.params.setWrapperSize||(b.isHorizontal()?b.wrapper.css({width:b.virtualSize+b.params.spaceBetween+"px"}):b.wrapper.css({height:b.virtualSize+b.params.spaceBetween+"px"})),b.params.slidesPerColumn>1&&(b.virtualSize=(o+b.params.spaceBetween)*n,b.virtualSize=Math.ceil(b.virtualSize/b.params.slidesPerColumn)-b.params.spaceBetween,b.isHorizontal()?b.wrapper.css({width:b.virtualSize+b.params.spaceBetween+"px"}):b.wrapper.css({height:b.virtualSize+b.params.spaceBetween+"px"}),b.params.centeredSlides)){for(g=[],e=0;e<b.snapGrid.length;e++)b.snapGrid[e]<b.virtualSize+b.snapGrid[0]&&g.push(b.snapGrid[e]);b.snapGrid=g}if(!b.params.centeredSlides){for(g=[],e=0;e<b.snapGrid.length;e++)b.snapGrid[e]<=b.virtualSize-b.size&&g.push(b.snapGrid[e]);b.snapGrid=g,Math.floor(b.virtualSize-b.size)-Math.floor(b.snapGrid[b.snapGrid.length-1])>1&&b.snapGrid.push(b.virtualSize-b.size)}0===b.snapGrid.length&&(b.snapGrid=[0]),0!==b.params.spaceBetween&&(b.isHorizontal()?b.rtl?b.slides.css({marginLeft:a+"px"}):b.slides.css({marginRight:a+"px"}):b.slides.css({marginBottom:a+"px"})),b.params.watchSlidesProgress&&b.updateSlidesOffset()}},b.updateSlidesOffset=function(){for(var e=0;e<b.slides.length;e++)b.slides[e].swiperSlideOffset=b.isHorizontal()?b.slides[e].offsetLeft:b.slides[e].offsetTop},b.currentSlidesPerView=function(){var e,a,t=1;if(b.params.centeredSlides){var s,i=b.slides[b.activeIndex].swiperSlideSize;for(e=b.activeIndex+1;e<b.slides.length;e++)b.slides[e]&&!s&&(i+=b.slides[e].swiperSlideSize,t++,i>b.size&&(s=!0));for(a=b.activeIndex-1;a>=0;a--)b.slides[a]&&!s&&(i+=b.slides[a].swiperSlideSize,t++,i>b.size&&(s=!0))}else for(e=b.activeIndex+1;e<b.slides.length;e++)b.slidesGrid[e]-b.slidesGrid[b.activeIndex]<b.size&&t++;return t},b.updateSlidesProgress=function(e){if("undefined"==typeof e&&(e=b.translate||0),0!==b.slides.length){"undefined"==typeof b.slides[0].swiperSlideOffset&&b.updateSlidesOffset();var a=-e;b.rtl&&(a=e),b.slides.removeClass(b.params.slideVisibleClass);for(var t=0;t<b.slides.length;t++){var s=b.slides[t],i=(a+(b.params.centeredSlides?b.minTranslate():0)-s.swiperSlideOffset)/(s.swiperSlideSize+b.params.spaceBetween);if(b.params.watchSlidesVisibility){var r=-(a-s.swiperSlideOffset),n=r+b.slidesSizesGrid[t],o=r>=0&&r<b.size||n>0&&n<=b.size||r<=0&&n>=b.size;o&&b.slides.eq(t).addClass(b.params.slideVisibleClass)}s.progress=b.rtl?-i:i}}},b.updateProgress=function(e){"undefined"==typeof e&&(e=b.translate||0);var a=b.maxTranslate()-b.minTranslate(),t=b.isBeginning,s=b.isEnd;0===a?(b.progress=0,b.isBeginning=b.isEnd=!0):(b.progress=(e-b.minTranslate())/a,b.isBeginning=b.progress<=0,b.isEnd=b.progress>=1),b.isBeginning&&!t&&b.emit("onReachBeginning",b),b.isEnd&&!s&&b.emit("onReachEnd",b),b.params.watchSlidesProgress&&b.updateSlidesProgress(e),b.emit("onProgress",b,b.progress)},b.updateActiveIndex=function(){var e,a,t,s=b.rtl?b.translate:-b.translate;for(a=0;a<b.slidesGrid.length;a++)"undefined"!=typeof b.slidesGrid[a+1]?s>=b.slidesGrid[a]&&s<b.slidesGrid[a+1]-(b.slidesGrid[a+1]-b.slidesGrid[a])/2?e=a:s>=b.slidesGrid[a]&&s<b.slidesGrid[a+1]&&(e=a+1):s>=b.slidesGrid[a]&&(e=a);b.params.normalizeSlideIndex&&(e<0||"undefined"==typeof e)&&(e=0),t=Math.floor(e/b.params.slidesPerGroup),t>=b.snapGrid.length&&(t=b.snapGrid.length-1),e!==b.activeIndex&&(b.snapIndex=t,b.previousIndex=b.activeIndex,b.activeIndex=e,b.updateClasses(),b.updateRealIndex())},b.updateRealIndex=function(){b.realIndex=parseInt(b.slides.eq(b.activeIndex).attr("data-swiper-slide-index")||b.activeIndex,10)},b.updateClasses=function(){b.slides.removeClass(b.params.slideActiveClass+" "+b.params.slideNextClass+" "+b.params.slidePrevClass+" "+b.params.slideDuplicateActiveClass+" "+b.params.slideDuplicateNextClass+" "+b.params.slideDuplicatePrevClass);var e=b.slides.eq(b.activeIndex);e.addClass(b.params.slideActiveClass),i.loop&&(e.hasClass(b.params.slideDuplicateClass)?b.wrapper.children("."+b.params.slideClass+":not(."+b.params.slideDuplicateClass+')[data-swiper-slide-index="'+b.realIndex+'"]').addClass(b.params.slideDuplicateActiveClass):b.wrapper.children("."+b.params.slideClass+"."+b.params.slideDuplicateClass+'[data-swiper-slide-index="'+b.realIndex+'"]').addClass(b.params.slideDuplicateActiveClass));var t=e.next("."+b.params.slideClass).addClass(b.params.slideNextClass);b.params.loop&&0===t.length&&(t=b.slides.eq(0),t.addClass(b.params.slideNextClass));var s=e.prev("."+b.params.slideClass).addClass(b.params.slidePrevClass);if(b.params.loop&&0===s.length&&(s=b.slides.eq(-1),s.addClass(b.params.slidePrevClass)),i.loop&&(t.hasClass(b.params.slideDuplicateClass)?b.wrapper.children("."+b.params.slideClass+":not(."+b.params.slideDuplicateClass+')[data-swiper-slide-index="'+t.attr("data-swiper-slide-index")+'"]').addClass(b.params.slideDuplicateNextClass):b.wrapper.children("."+b.params.slideClass+"."+b.params.slideDuplicateClass+'[data-swiper-slide-index="'+t.attr("data-swiper-slide-index")+'"]').addClass(b.params.slideDuplicateNextClass),s.hasClass(b.params.slideDuplicateClass)?b.wrapper.children("."+b.params.slideClass+":not(."+b.params.slideDuplicateClass+')[data-swiper-slide-index="'+s.attr("data-swiper-slide-index")+'"]').addClass(b.params.slideDuplicatePrevClass):b.wrapper.children("."+b.params.slideClass+"."+b.params.slideDuplicateClass+'[data-swiper-slide-index="'+s.attr("data-swiper-slide-index")+'"]').addClass(b.params.slideDuplicatePrevClass)),b.paginationContainer&&b.paginationContainer.length>0){var r,n=b.params.loop?Math.ceil((b.slides.length-2*b.loopedSlides)/b.params.slidesPerGroup):b.snapGrid.length;if(b.params.loop?(r=Math.ceil((b.activeIndex-b.loopedSlides)/b.params.slidesPerGroup),r>b.slides.length-1-2*b.loopedSlides&&(r-=b.slides.length-2*b.loopedSlides),r>n-1&&(r-=n),r<0&&"bullets"!==b.params.paginationType&&(r=n+r)):r="undefined"!=typeof b.snapIndex?b.snapIndex:b.activeIndex||0,"bullets"===b.params.paginationType&&b.bullets&&b.bullets.length>0&&(b.bullets.removeClass(b.params.bulletActiveClass),b.paginationContainer.length>1?b.bullets.each(function(){a(this).index()===r&&a(this).addClass(b.params.bulletActiveClass)}):b.bullets.eq(r).addClass(b.params.bulletActiveClass)),"fraction"===b.params.paginationType&&(b.paginationContainer.find("."+b.params.paginationCurrentClass).text(r+1),b.paginationContainer.find("."+b.params.paginationTotalClass).text(n)),"progress"===b.params.paginationType){var o=(r+1)/n,l=o,p=1;b.isHorizontal()||(p=o,l=1),b.paginationContainer.find("."+b.params.paginationProgressbarClass).transform("translate3d(0,0,0) scaleX("+l+") scaleY("+p+")").transition(b.params.speed)}"custom"===b.params.paginationType&&b.params.paginationCustomRender&&(b.paginationContainer.html(b.params.paginationCustomRender(b,r+1,n)),b.emit("onPaginationRendered",b,b.paginationContainer[0]))}b.params.loop||(b.params.prevButton&&b.prevButton&&b.prevButton.length>0&&(b.isBeginning?(b.prevButton.addClass(b.params.buttonDisabledClass),b.params.a11y&&b.a11y&&b.a11y.disable(b.prevButton)):(b.prevButton.removeClass(b.params.buttonDisabledClass),b.params.a11y&&b.a11y&&b.a11y.enable(b.prevButton))),b.params.nextButton&&b.nextButton&&b.nextButton.length>0&&(b.isEnd?(b.nextButton.addClass(b.params.buttonDisabledClass),b.params.a11y&&b.a11y&&b.a11y.disable(b.nextButton)):(b.nextButton.removeClass(b.params.buttonDisabledClass),b.params.a11y&&b.a11y&&b.a11y.enable(b.nextButton))))},b.updatePagination=function(){if(b.params.pagination&&b.paginationContainer&&b.paginationContainer.length>0){var e="";if("bullets"===b.params.paginationType){for(var a=b.params.loop?Math.ceil((b.slides.length-2*b.loopedSlides)/b.params.slidesPerGroup):b.snapGrid.length,t=0;t<a;t++)e+=b.params.paginationBulletRender?b.params.paginationBulletRender(b,t,b.params.bulletClass):"<"+b.params.paginationElement+' class="'+b.params.bulletClass+'"></'+b.params.paginationElement+">";b.paginationContainer.html(e),b.bullets=b.paginationContainer.find("."+b.params.bulletClass),b.params.paginationClickable&&b.params.a11y&&b.a11y&&b.a11y.initPagination()}"fraction"===b.params.paginationType&&(e=b.params.paginationFractionRender?b.params.paginationFractionRender(b,b.params.paginationCurrentClass,b.params.paginationTotalClass):'<span class="'+b.params.paginationCurrentClass+'"></span> / <span class="'+b.params.paginationTotalClass+'"></span>',b.paginationContainer.html(e)),"progress"===b.params.paginationType&&(e=b.params.paginationProgressRender?b.params.paginationProgressRender(b,b.params.paginationProgressbarClass):'<span class="'+b.params.paginationProgressbarClass+'"></span>',b.paginationContainer.html(e)),"custom"!==b.params.paginationType&&b.emit("onPaginationRendered",b,b.paginationContainer[0])}},b.update=function(e){function a(){b.rtl?-b.translate:b.translate;s=Math.min(Math.max(b.translate,b.maxTranslate()),b.minTranslate()),b.setWrapperTranslate(s),b.updateActiveIndex(),b.updateClasses()}if(b)if(b.updateContainerSize(),b.updateSlidesSize(),b.updateProgress(),b.updatePagination(),b.updateClasses(),b.params.scrollbar&&b.scrollbar&&b.scrollbar.set(),e){var t,s;b.controller&&b.controller.spline&&(b.controller.spline=void 0),b.params.freeMode?(a(),b.params.autoHeight&&b.updateAutoHeight()):(t=("auto"===b.params.slidesPerView||b.params.slidesPerView>1)&&b.isEnd&&!b.params.centeredSlides?b.slideTo(b.slides.length-1,0,!1,!0):b.slideTo(b.activeIndex,0,!1,!0),t||a())}else b.params.autoHeight&&b.updateAutoHeight()},b.onResize=function(e){b.params.breakpoints&&b.setBreakpoint();var a=b.params.allowSwipeToPrev,t=b.params.allowSwipeToNext;b.params.allowSwipeToPrev=b.params.allowSwipeToNext=!0,b.updateContainerSize(),b.updateSlidesSize(),("auto"===b.params.slidesPerView||b.params.freeMode||e)&&b.updatePagination(),b.params.scrollbar&&b.scrollbar&&b.scrollbar.set(),b.controller&&b.controller.spline&&(b.controller.spline=void 0);var s=!1;if(b.params.freeMode){var i=Math.min(Math.max(b.translate,b.maxTranslate()),b.minTranslate());b.setWrapperTranslate(i),b.updateActiveIndex(),b.updateClasses(),b.params.autoHeight&&b.updateAutoHeight()}else b.updateClasses(),s=("auto"===b.params.slidesPerView||b.params.slidesPerView>1)&&b.isEnd&&!b.params.centeredSlides?b.slideTo(b.slides.length-1,0,!1,!0):b.slideTo(b.activeIndex,0,!1,!0);b.params.lazyLoading&&!s&&b.lazy&&b.lazy.load(),b.params.allowSwipeToPrev=a,b.params.allowSwipeToNext=t},b.touchEventsDesktop={start:"mousedown",move:"mousemove",end:"mouseup"},window.navigator.pointerEnabled?b.touchEventsDesktop={start:"pointerdown",move:"pointermove",end:"pointerup"}:window.navigator.msPointerEnabled&&(b.touchEventsDesktop={start:"MSPointerDown",move:"MSPointerMove",end:"MSPointerUp"}),b.touchEvents={start:b.support.touch||!b.params.simulateTouch?"touchstart":b.touchEventsDesktop.start,move:b.support.touch||!b.params.simulateTouch?"touchmove":b.touchEventsDesktop.move,end:b.support.touch||!b.params.simulateTouch?"touchend":b.touchEventsDesktop.end},(window.navigator.pointerEnabled||window.navigator.msPointerEnabled)&&("container"===b.params.touchEventsTarget?b.container:b.wrapper).addClass("swiper-wp8-"+b.params.direction),b.initEvents=function(e){var a=e?"off":"on",t=e?"removeEventListener":"addEventListener",s="container"===b.params.touchEventsTarget?b.container[0]:b.wrapper[0],r=b.support.touch?s:document,n=!!b.params.nested;if(b.browser.ie)s[t](b.touchEvents.start,b.onTouchStart,!1),r[t](b.touchEvents.move,b.onTouchMove,n),r[t](b.touchEvents.end,b.onTouchEnd,!1);else{if(b.support.touch){var o=!("touchstart"!==b.touchEvents.start||!b.support.passiveListener||!b.params.passiveListeners)&&{passive:!0,capture:!1};s[t](b.touchEvents.start,b.onTouchStart,o),s[t](b.touchEvents.move,b.onTouchMove,n),s[t](b.touchEvents.end,b.onTouchEnd,o)}(i.simulateTouch&&!b.device.ios&&!b.device.android||i.simulateTouch&&!b.support.touch&&b.device.ios)&&(s[t]("mousedown",b.onTouchStart,!1),document[t]("mousemove",b.onTouchMove,n),document[t]("mouseup",b.onTouchEnd,!1))}window[t]("resize",b.onResize),b.params.nextButton&&b.nextButton&&b.nextButton.length>0&&(b.nextButton[a]("click",b.onClickNext),b.params.a11y&&b.a11y&&b.nextButton[a]("keydown",b.a11y.onEnterKey)),b.params.prevButton&&b.prevButton&&b.prevButton.length>0&&(b.prevButton[a]("click",b.onClickPrev),b.params.a11y&&b.a11y&&b.prevButton[a]("keydown",b.a11y.onEnterKey)),b.params.pagination&&b.params.paginationClickable&&(b.paginationContainer[a]("click","."+b.params.bulletClass,b.onClickIndex),b.params.a11y&&b.a11y&&b.paginationContainer[a]("keydown","."+b.params.bulletClass,b.a11y.onEnterKey)),(b.params.preventClicks||b.params.preventClicksPropagation)&&s[t]("click",b.preventClicks,!0);
},b.attachEvents=function(){b.initEvents()},b.detachEvents=function(){b.initEvents(!0)},b.allowClick=!0,b.preventClicks=function(e){b.allowClick||(b.params.preventClicks&&e.preventDefault(),b.params.preventClicksPropagation&&b.animating&&(e.stopPropagation(),e.stopImmediatePropagation()))},b.onClickNext=function(e){e.preventDefault(),b.isEnd&&!b.params.loop||b.slideNext()},b.onClickPrev=function(e){e.preventDefault(),b.isBeginning&&!b.params.loop||b.slidePrev()},b.onClickIndex=function(e){e.preventDefault();var t=a(this).index()*b.params.slidesPerGroup;b.params.loop&&(t+=b.loopedSlides),b.slideTo(t)},b.updateClickedSlide=function(e){var t=o(e,"."+b.params.slideClass),s=!1;if(t)for(var i=0;i<b.slides.length;i++)b.slides[i]===t&&(s=!0);if(!t||!s)return b.clickedSlide=void 0,void(b.clickedIndex=void 0);if(b.clickedSlide=t,b.clickedIndex=a(t).index(),b.params.slideToClickedSlide&&void 0!==b.clickedIndex&&b.clickedIndex!==b.activeIndex){var r,n=b.clickedIndex,l="auto"===b.params.slidesPerView?b.currentSlidesPerView():b.params.slidesPerView;if(b.params.loop){if(b.animating)return;r=parseInt(a(b.clickedSlide).attr("data-swiper-slide-index"),10),b.params.centeredSlides?n<b.loopedSlides-l/2||n>b.slides.length-b.loopedSlides+l/2?(b.fixLoop(),n=b.wrapper.children("."+b.params.slideClass+'[data-swiper-slide-index="'+r+'"]:not(.'+b.params.slideDuplicateClass+")").eq(0).index(),setTimeout(function(){b.slideTo(n)},0)):b.slideTo(n):n>b.slides.length-l?(b.fixLoop(),n=b.wrapper.children("."+b.params.slideClass+'[data-swiper-slide-index="'+r+'"]:not(.'+b.params.slideDuplicateClass+")").eq(0).index(),setTimeout(function(){b.slideTo(n)},0)):b.slideTo(n)}else b.slideTo(n)}};var C,z,M,E,P,I,k,L,D,B,H="input, select, textarea, button, video",G=Date.now(),X=[];b.animating=!1,b.touches={startX:0,startY:0,currentX:0,currentY:0,diff:0};var Y,A;b.onTouchStart=function(e){if(e.originalEvent&&(e=e.originalEvent),Y="touchstart"===e.type,Y||!("which"in e)||3!==e.which){if(b.params.noSwiping&&o(e,"."+b.params.noSwipingClass))return void(b.allowClick=!0);if(!b.params.swipeHandler||o(e,b.params.swipeHandler)){var t=b.touches.currentX="touchstart"===e.type?e.targetTouches[0].pageX:e.pageX,s=b.touches.currentY="touchstart"===e.type?e.targetTouches[0].pageY:e.pageY;if(!(b.device.ios&&b.params.iOSEdgeSwipeDetection&&t<=b.params.iOSEdgeSwipeThreshold)){if(C=!0,z=!1,M=!0,P=void 0,A=void 0,b.touches.startX=t,b.touches.startY=s,E=Date.now(),b.allowClick=!0,b.updateContainerSize(),b.swipeDirection=void 0,b.params.threshold>0&&(L=!1),"touchstart"!==e.type){var i=!0;a(e.target).is(H)&&(i=!1),document.activeElement&&a(document.activeElement).is(H)&&document.activeElement.blur(),i&&e.preventDefault()}b.emit("onTouchStart",b,e)}}}},b.onTouchMove=function(e){if(e.originalEvent&&(e=e.originalEvent),!Y||"mousemove"!==e.type){if(e.preventedByNestedSwiper)return b.touches.startX="touchmove"===e.type?e.targetTouches[0].pageX:e.pageX,void(b.touches.startY="touchmove"===e.type?e.targetTouches[0].pageY:e.pageY);if(b.params.onlyExternal)return b.allowClick=!1,void(C&&(b.touches.startX=b.touches.currentX="touchmove"===e.type?e.targetTouches[0].pageX:e.pageX,b.touches.startY=b.touches.currentY="touchmove"===e.type?e.targetTouches[0].pageY:e.pageY,E=Date.now()));if(Y&&b.params.touchReleaseOnEdges&&!b.params.loop)if(b.isHorizontal()){if(b.touches.currentX<b.touches.startX&&b.translate<=b.maxTranslate()||b.touches.currentX>b.touches.startX&&b.translate>=b.minTranslate())return}else if(b.touches.currentY<b.touches.startY&&b.translate<=b.maxTranslate()||b.touches.currentY>b.touches.startY&&b.translate>=b.minTranslate())return;if(Y&&document.activeElement&&e.target===document.activeElement&&a(e.target).is(H))return z=!0,void(b.allowClick=!1);if(M&&b.emit("onTouchMove",b,e),!(e.targetTouches&&e.targetTouches.length>1)){if(b.touches.currentX="touchmove"===e.type?e.targetTouches[0].pageX:e.pageX,b.touches.currentY="touchmove"===e.type?e.targetTouches[0].pageY:e.pageY,"undefined"==typeof P){var t;b.isHorizontal()&&b.touches.currentY===b.touches.startY||!b.isHorizontal()&&b.touches.currentX===b.touches.startX?P=!1:(t=180*Math.atan2(Math.abs(b.touches.currentY-b.touches.startY),Math.abs(b.touches.currentX-b.touches.startX))/Math.PI,P=b.isHorizontal()?t>b.params.touchAngle:90-t>b.params.touchAngle)}if(P&&b.emit("onTouchMoveOpposite",b,e),"undefined"==typeof A&&b.browser.ieTouch&&(b.touches.currentX===b.touches.startX&&b.touches.currentY===b.touches.startY||(A=!0)),C){if(P)return void(C=!1);if(A||!b.browser.ieTouch){b.allowClick=!1,b.emit("onSliderMove",b,e),e.preventDefault(),b.params.touchMoveStopPropagation&&!b.params.nested&&e.stopPropagation(),z||(i.loop&&b.fixLoop(),k=b.getWrapperTranslate(),b.setWrapperTransition(0),b.animating&&b.wrapper.trigger("webkitTransitionEnd transitionend oTransitionEnd MSTransitionEnd msTransitionEnd"),b.params.autoplay&&b.autoplaying&&(b.params.autoplayDisableOnInteraction?b.stopAutoplay():b.pauseAutoplay()),B=!1,!b.params.grabCursor||b.params.allowSwipeToNext!==!0&&b.params.allowSwipeToPrev!==!0||b.setGrabCursor(!0)),z=!0;var s=b.touches.diff=b.isHorizontal()?b.touches.currentX-b.touches.startX:b.touches.currentY-b.touches.startY;s*=b.params.touchRatio,b.rtl&&(s=-s),b.swipeDirection=s>0?"prev":"next",I=s+k;var r=!0;if(s>0&&I>b.minTranslate()?(r=!1,b.params.resistance&&(I=b.minTranslate()-1+Math.pow(-b.minTranslate()+k+s,b.params.resistanceRatio))):s<0&&I<b.maxTranslate()&&(r=!1,b.params.resistance&&(I=b.maxTranslate()+1-Math.pow(b.maxTranslate()-k-s,b.params.resistanceRatio))),r&&(e.preventedByNestedSwiper=!0),!b.params.allowSwipeToNext&&"next"===b.swipeDirection&&I<k&&(I=k),!b.params.allowSwipeToPrev&&"prev"===b.swipeDirection&&I>k&&(I=k),b.params.threshold>0){if(!(Math.abs(s)>b.params.threshold||L))return void(I=k);if(!L)return L=!0,b.touches.startX=b.touches.currentX,b.touches.startY=b.touches.currentY,I=k,void(b.touches.diff=b.isHorizontal()?b.touches.currentX-b.touches.startX:b.touches.currentY-b.touches.startY)}b.params.followFinger&&((b.params.freeMode||b.params.watchSlidesProgress)&&b.updateActiveIndex(),b.params.freeMode&&(0===X.length&&X.push({position:b.touches[b.isHorizontal()?"startX":"startY"],time:E}),X.push({position:b.touches[b.isHorizontal()?"currentX":"currentY"],time:(new window.Date).getTime()})),b.updateProgress(I),b.setWrapperTranslate(I))}}}}},b.onTouchEnd=function(e){if(e.originalEvent&&(e=e.originalEvent),M&&b.emit("onTouchEnd",b,e),M=!1,C){b.params.grabCursor&&z&&C&&(b.params.allowSwipeToNext===!0||b.params.allowSwipeToPrev===!0)&&b.setGrabCursor(!1);var t=Date.now(),s=t-E;if(b.allowClick&&(b.updateClickedSlide(e),b.emit("onTap",b,e),s<300&&t-G>300&&(D&&clearTimeout(D),D=setTimeout(function(){b&&(b.params.paginationHide&&b.paginationContainer.length>0&&!a(e.target).hasClass(b.params.bulletClass)&&b.paginationContainer.toggleClass(b.params.paginationHiddenClass),b.emit("onClick",b,e))},300)),s<300&&t-G<300&&(D&&clearTimeout(D),b.emit("onDoubleTap",b,e))),G=Date.now(),setTimeout(function(){b&&(b.allowClick=!0)},0),!C||!z||!b.swipeDirection||0===b.touches.diff||I===k)return void(C=z=!1);C=z=!1;var i;if(i=b.params.followFinger?b.rtl?b.translate:-b.translate:-I,b.params.freeMode){if(i<-b.minTranslate())return void b.slideTo(b.activeIndex);if(i>-b.maxTranslate())return void(b.slides.length<b.snapGrid.length?b.slideTo(b.snapGrid.length-1):b.slideTo(b.slides.length-1));if(b.params.freeModeMomentum){if(X.length>1){var r=X.pop(),n=X.pop(),o=r.position-n.position,l=r.time-n.time;b.velocity=o/l,b.velocity=b.velocity/2,Math.abs(b.velocity)<b.params.freeModeMinimumVelocity&&(b.velocity=0),(l>150||(new window.Date).getTime()-r.time>300)&&(b.velocity=0)}else b.velocity=0;b.velocity=b.velocity*b.params.freeModeMomentumVelocityRatio,X.length=0;var p=1e3*b.params.freeModeMomentumRatio,d=b.velocity*p,u=b.translate+d;b.rtl&&(u=-u);var c,m=!1,h=20*Math.abs(b.velocity)*b.params.freeModeMomentumBounceRatio;if(u<b.maxTranslate())b.params.freeModeMomentumBounce?(u+b.maxTranslate()<-h&&(u=b.maxTranslate()-h),c=b.maxTranslate(),m=!0,B=!0):u=b.maxTranslate();else if(u>b.minTranslate())b.params.freeModeMomentumBounce?(u-b.minTranslate()>h&&(u=b.minTranslate()+h),c=b.minTranslate(),m=!0,B=!0):u=b.minTranslate();else if(b.params.freeModeSticky){var g,f=0;for(f=0;f<b.snapGrid.length;f+=1)if(b.snapGrid[f]>-u){g=f;break}u=Math.abs(b.snapGrid[g]-u)<Math.abs(b.snapGrid[g-1]-u)||"next"===b.swipeDirection?b.snapGrid[g]:b.snapGrid[g-1],b.rtl||(u=-u)}if(0!==b.velocity)p=b.rtl?Math.abs((-u-b.translate)/b.velocity):Math.abs((u-b.translate)/b.velocity);else if(b.params.freeModeSticky)return void b.slideReset();b.params.freeModeMomentumBounce&&m?(b.updateProgress(c),b.setWrapperTransition(p),b.setWrapperTranslate(u),b.onTransitionStart(),b.animating=!0,b.wrapper.transitionEnd(function(){b&&B&&(b.emit("onMomentumBounce",b),b.setWrapperTransition(b.params.speed),b.setWrapperTranslate(c),b.wrapper.transitionEnd(function(){b&&b.onTransitionEnd()}))})):b.velocity?(b.updateProgress(u),b.setWrapperTransition(p),b.setWrapperTranslate(u),b.onTransitionStart(),b.animating||(b.animating=!0,b.wrapper.transitionEnd(function(){b&&b.onTransitionEnd()}))):b.updateProgress(u),b.updateActiveIndex()}return void((!b.params.freeModeMomentum||s>=b.params.longSwipesMs)&&(b.updateProgress(),b.updateActiveIndex()))}var v,w=0,y=b.slidesSizesGrid[0];for(v=0;v<b.slidesGrid.length;v+=b.params.slidesPerGroup)"undefined"!=typeof b.slidesGrid[v+b.params.slidesPerGroup]?i>=b.slidesGrid[v]&&i<b.slidesGrid[v+b.params.slidesPerGroup]&&(w=v,y=b.slidesGrid[v+b.params.slidesPerGroup]-b.slidesGrid[v]):i>=b.slidesGrid[v]&&(w=v,y=b.slidesGrid[b.slidesGrid.length-1]-b.slidesGrid[b.slidesGrid.length-2]);var x=(i-b.slidesGrid[w])/y;if(s>b.params.longSwipesMs){if(!b.params.longSwipes)return void b.slideTo(b.activeIndex);"next"===b.swipeDirection&&(x>=b.params.longSwipesRatio?b.slideTo(w+b.params.slidesPerGroup):b.slideTo(w)),"prev"===b.swipeDirection&&(x>1-b.params.longSwipesRatio?b.slideTo(w+b.params.slidesPerGroup):b.slideTo(w))}else{if(!b.params.shortSwipes)return void b.slideTo(b.activeIndex);"next"===b.swipeDirection&&b.slideTo(w+b.params.slidesPerGroup),"prev"===b.swipeDirection&&b.slideTo(w)}}},b._slideTo=function(e,a){return b.slideTo(e,a,!0,!0)},b.slideTo=function(e,a,t,s){"undefined"==typeof t&&(t=!0),"undefined"==typeof e&&(e=0),e<0&&(e=0),b.snapIndex=Math.floor(e/b.params.slidesPerGroup),b.snapIndex>=b.snapGrid.length&&(b.snapIndex=b.snapGrid.length-1);var i=-b.snapGrid[b.snapIndex];if(b.params.autoplay&&b.autoplaying&&(s||!b.params.autoplayDisableOnInteraction?b.pauseAutoplay(a):b.stopAutoplay()),b.updateProgress(i),b.params.normalizeSlideIndex)for(var r=0;r<b.slidesGrid.length;r++)-Math.floor(100*i)>=Math.floor(100*b.slidesGrid[r])&&(e=r);return!(!b.params.allowSwipeToNext&&i<b.translate&&i<b.minTranslate())&&(!(!b.params.allowSwipeToPrev&&i>b.translate&&i>b.maxTranslate()&&(b.activeIndex||0)!==e)&&("undefined"==typeof a&&(a=b.params.speed),b.previousIndex=b.activeIndex||0,b.activeIndex=e,b.updateRealIndex(),b.rtl&&-i===b.translate||!b.rtl&&i===b.translate?(b.params.autoHeight&&b.updateAutoHeight(),b.updateClasses(),"slide"!==b.params.effect&&b.setWrapperTranslate(i),!1):(b.updateClasses(),b.onTransitionStart(t),0===a||b.browser.lteIE9?(b.setWrapperTranslate(i),b.setWrapperTransition(0),b.onTransitionEnd(t)):(b.setWrapperTranslate(i),b.setWrapperTransition(a),b.animating||(b.animating=!0,b.wrapper.transitionEnd(function(){b&&b.onTransitionEnd(t)}))),!0)))},b.onTransitionStart=function(e){"undefined"==typeof e&&(e=!0),b.params.autoHeight&&b.updateAutoHeight(),b.lazy&&b.lazy.onTransitionStart(),e&&(b.emit("onTransitionStart",b),b.activeIndex!==b.previousIndex&&(b.emit("onSlideChangeStart",b),b.activeIndex>b.previousIndex?b.emit("onSlideNextStart",b):b.emit("onSlidePrevStart",b)))},b.onTransitionEnd=function(e){b.animating=!1,b.setWrapperTransition(0),"undefined"==typeof e&&(e=!0),b.lazy&&b.lazy.onTransitionEnd(),e&&(b.emit("onTransitionEnd",b),b.activeIndex!==b.previousIndex&&(b.emit("onSlideChangeEnd",b),b.activeIndex>b.previousIndex?b.emit("onSlideNextEnd",b):b.emit("onSlidePrevEnd",b))),b.params.history&&b.history&&b.history.setHistory(b.params.history,b.activeIndex),b.params.hashnav&&b.hashnav&&b.hashnav.setHash()},b.slideNext=function(e,a,t){if(b.params.loop){if(b.animating)return!1;b.fixLoop();b.container[0].clientLeft;return b.slideTo(b.activeIndex+b.params.slidesPerGroup,a,e,t)}return b.slideTo(b.activeIndex+b.params.slidesPerGroup,a,e,t)},b._slideNext=function(e){return b.slideNext(!0,e,!0)},b.slidePrev=function(e,a,t){if(b.params.loop){if(b.animating)return!1;b.fixLoop();b.container[0].clientLeft;return b.slideTo(b.activeIndex-1,a,e,t)}return b.slideTo(b.activeIndex-1,a,e,t)},b._slidePrev=function(e){return b.slidePrev(!0,e,!0)},b.slideReset=function(e,a,t){return b.slideTo(b.activeIndex,a,e)},b.disableTouchControl=function(){return b.params.onlyExternal=!0,!0},b.enableTouchControl=function(){return b.params.onlyExternal=!1,!0},b.setWrapperTransition=function(e,a){b.wrapper.transition(e),"slide"!==b.params.effect&&b.effects[b.params.effect]&&b.effects[b.params.effect].setTransition(e),b.params.parallax&&b.parallax&&b.parallax.setTransition(e),b.params.scrollbar&&b.scrollbar&&b.scrollbar.setTransition(e),b.params.control&&b.controller&&b.controller.setTransition(e,a),b.emit("onSetTransition",b,e)},b.setWrapperTranslate=function(e,a,t){var s=0,i=0,n=0;b.isHorizontal()?s=b.rtl?-e:e:i=e,b.params.roundLengths&&(s=r(s),i=r(i)),b.params.virtualTranslate||(b.support.transforms3d?b.wrapper.transform("translate3d("+s+"px, "+i+"px, "+n+"px)"):b.wrapper.transform("translate("+s+"px, "+i+"px)")),b.translate=b.isHorizontal()?s:i;var o,l=b.maxTranslate()-b.minTranslate();o=0===l?0:(e-b.minTranslate())/l,o!==b.progress&&b.updateProgress(e),a&&b.updateActiveIndex(),"slide"!==b.params.effect&&b.effects[b.params.effect]&&b.effects[b.params.effect].setTranslate(b.translate),b.params.parallax&&b.parallax&&b.parallax.setTranslate(b.translate),b.params.scrollbar&&b.scrollbar&&b.scrollbar.setTranslate(b.translate),b.params.control&&b.controller&&b.controller.setTranslate(b.translate,t),b.emit("onSetTranslate",b,b.translate)},b.getTranslate=function(e,a){var t,s,i,r;return"undefined"==typeof a&&(a="x"),b.params.virtualTranslate?b.rtl?-b.translate:b.translate:(i=window.getComputedStyle(e,null),window.WebKitCSSMatrix?(s=i.transform||i.webkitTransform,s.split(",").length>6&&(s=s.split(", ").map(function(e){return e.replace(",",".")}).join(", ")),r=new window.WebKitCSSMatrix("none"===s?"":s)):(r=i.MozTransform||i.OTransform||i.MsTransform||i.msTransform||i.transform||i.getPropertyValue("transform").replace("translate(","matrix(1, 0, 0, 1,"),t=r.toString().split(",")),"x"===a&&(s=window.WebKitCSSMatrix?r.m41:16===t.length?parseFloat(t[12]):parseFloat(t[4])),"y"===a&&(s=window.WebKitCSSMatrix?r.m42:16===t.length?parseFloat(t[13]):parseFloat(t[5])),b.rtl&&s&&(s=-s),s||0)},b.getWrapperTranslate=function(e){return"undefined"==typeof e&&(e=b.isHorizontal()?"x":"y"),b.getTranslate(b.wrapper[0],e)},b.observers=[],b.initObservers=function(){if(b.params.observeParents)for(var e=b.container.parents(),a=0;a<e.length;a++)l(e[a]);l(b.container[0],{childList:!1}),l(b.wrapper[0],{attributes:!1})},b.disconnectObservers=function(){for(var e=0;e<b.observers.length;e++)b.observers[e].disconnect();b.observers=[]},b.createLoop=function(){b.wrapper.children("."+b.params.slideClass+"."+b.params.slideDuplicateClass).remove();var e=b.wrapper.children("."+b.params.slideClass);"auto"!==b.params.slidesPerView||b.params.loopedSlides||(b.params.loopedSlides=e.length),b.loopedSlides=parseInt(b.params.loopedSlides||b.params.slidesPerView,10),b.loopedSlides=b.loopedSlides+b.params.loopAdditionalSlides,b.loopedSlides>e.length&&(b.loopedSlides=e.length);var t,s=[],i=[];for(e.each(function(t,r){var n=a(this);t<b.loopedSlides&&i.push(r),t<e.length&&t>=e.length-b.loopedSlides&&s.push(r),n.attr("data-swiper-slide-index",t)}),t=0;t<i.length;t++)b.wrapper.append(a(i[t].cloneNode(!0)).addClass(b.params.slideDuplicateClass));for(t=s.length-1;t>=0;t--)b.wrapper.prepend(a(s[t].cloneNode(!0)).addClass(b.params.slideDuplicateClass))},b.destroyLoop=function(){b.wrapper.children("."+b.params.slideClass+"."+b.params.slideDuplicateClass).remove(),b.slides.removeAttr("data-swiper-slide-index")},b.reLoop=function(e){var a=b.activeIndex-b.loopedSlides;b.destroyLoop(),b.createLoop(),b.updateSlidesSize(),e&&b.slideTo(a+b.loopedSlides,0,!1)},b.fixLoop=function(){var e;b.activeIndex<b.loopedSlides?(e=b.slides.length-3*b.loopedSlides+b.activeIndex,e+=b.loopedSlides,b.slideTo(e,0,!1,!0)):("auto"===b.params.slidesPerView&&b.activeIndex>=2*b.loopedSlides||b.activeIndex>b.slides.length-2*b.params.slidesPerView)&&(e=-b.slides.length+b.activeIndex+b.loopedSlides,e+=b.loopedSlides,b.slideTo(e,0,!1,!0))},b.appendSlide=function(e){if(b.params.loop&&b.destroyLoop(),"object"==typeof e&&e.length)for(var a=0;a<e.length;a++)e[a]&&b.wrapper.append(e[a]);else b.wrapper.append(e);b.params.loop&&b.createLoop(),b.params.observer&&b.support.observer||b.update(!0)},b.prependSlide=function(e){b.params.loop&&b.destroyLoop();var a=b.activeIndex+1;if("object"==typeof e&&e.length){for(var t=0;t<e.length;t++)e[t]&&b.wrapper.prepend(e[t]);a=b.activeIndex+e.length}else b.wrapper.prepend(e);b.params.loop&&b.createLoop(),b.params.observer&&b.support.observer||b.update(!0),b.slideTo(a,0,!1)},b.removeSlide=function(e){b.params.loop&&(b.destroyLoop(),b.slides=b.wrapper.children("."+b.params.slideClass));var a,t=b.activeIndex;if("object"==typeof e&&e.length){for(var s=0;s<e.length;s++)a=e[s],b.slides[a]&&b.slides.eq(a).remove(),a<t&&t--;t=Math.max(t,0)}else a=e,b.slides[a]&&b.slides.eq(a).remove(),a<t&&t--,t=Math.max(t,0);b.params.loop&&b.createLoop(),b.params.observer&&b.support.observer||b.update(!0),b.params.loop?b.slideTo(t+b.loopedSlides,0,!1):b.slideTo(t,0,!1)},b.removeAllSlides=function(){for(var e=[],a=0;a<b.slides.length;a++)e.push(a);b.removeSlide(e)},b.effects={fade:{setTranslate:function(){for(var e=0;e<b.slides.length;e++){var a=b.slides.eq(e),t=a[0].swiperSlideOffset,s=-t;b.params.virtualTranslate||(s-=b.translate);var i=0;b.isHorizontal()||(i=s,s=0);var r=b.params.fade.crossFade?Math.max(1-Math.abs(a[0].progress),0):1+Math.min(Math.max(a[0].progress,-1),0);a.css({opacity:r}).transform("translate3d("+s+"px, "+i+"px, 0px)")}},setTransition:function(e){if(b.slides.transition(e),b.params.virtualTranslate&&0!==e){var a=!1;b.slides.transitionEnd(function(){if(!a&&b){a=!0,b.animating=!1;for(var e=["webkitTransitionEnd","transitionend","oTransitionEnd","MSTransitionEnd","msTransitionEnd"],t=0;t<e.length;t++)b.wrapper.trigger(e[t])}})}}},flip:{setTranslate:function(){for(var e=0;e<b.slides.length;e++){var t=b.slides.eq(e),s=t[0].progress;b.params.flip.limitRotation&&(s=Math.max(Math.min(t[0].progress,1),-1));var i=t[0].swiperSlideOffset,r=-180*s,n=r,o=0,l=-i,p=0;if(b.isHorizontal()?b.rtl&&(n=-n):(p=l,l=0,o=-n,n=0),t[0].style.zIndex=-Math.abs(Math.round(s))+b.slides.length,b.params.flip.slideShadows){var d=b.isHorizontal()?t.find(".swiper-slide-shadow-left"):t.find(".swiper-slide-shadow-top"),u=b.isHorizontal()?t.find(".swiper-slide-shadow-right"):t.find(".swiper-slide-shadow-bottom");0===d.length&&(d=a('<div class="swiper-slide-shadow-'+(b.isHorizontal()?"left":"top")+'"></div>'),t.append(d)),0===u.length&&(u=a('<div class="swiper-slide-shadow-'+(b.isHorizontal()?"right":"bottom")+'"></div>'),t.append(u)),d.length&&(d[0].style.opacity=Math.max(-s,0)),u.length&&(u[0].style.opacity=Math.max(s,0))}t.transform("translate3d("+l+"px, "+p+"px, 0px) rotateX("+o+"deg) rotateY("+n+"deg)")}},setTransition:function(e){if(b.slides.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e),b.params.virtualTranslate&&0!==e){var t=!1;b.slides.eq(b.activeIndex).transitionEnd(function(){if(!t&&b&&a(this).hasClass(b.params.slideActiveClass)){t=!0,b.animating=!1;for(var e=["webkitTransitionEnd","transitionend","oTransitionEnd","MSTransitionEnd","msTransitionEnd"],s=0;s<e.length;s++)b.wrapper.trigger(e[s])}})}}},cube:{setTranslate:function(){var e,t=0;b.params.cube.shadow&&(b.isHorizontal()?(e=b.wrapper.find(".swiper-cube-shadow"),0===e.length&&(e=a('<div class="swiper-cube-shadow"></div>'),b.wrapper.append(e)),e.css({height:b.width+"px"})):(e=b.container.find(".swiper-cube-shadow"),0===e.length&&(e=a('<div class="swiper-cube-shadow"></div>'),b.container.append(e))));for(var s=0;s<b.slides.length;s++){var i=b.slides.eq(s),r=90*s,n=Math.floor(r/360);b.rtl&&(r=-r,n=Math.floor(-r/360));var o=Math.max(Math.min(i[0].progress,1),-1),l=0,p=0,d=0;s%4===0?(l=4*-n*b.size,d=0):(s-1)%4===0?(l=0,d=4*-n*b.size):(s-2)%4===0?(l=b.size+4*n*b.size,d=b.size):(s-3)%4===0&&(l=-b.size,d=3*b.size+4*b.size*n),b.rtl&&(l=-l),b.isHorizontal()||(p=l,l=0);var u="rotateX("+(b.isHorizontal()?0:-r)+"deg) rotateY("+(b.isHorizontal()?r:0)+"deg) translate3d("+l+"px, "+p+"px, "+d+"px)";if(o<=1&&o>-1&&(t=90*s+90*o,b.rtl&&(t=90*-s-90*o)),i.transform(u),b.params.cube.slideShadows){var c=b.isHorizontal()?i.find(".swiper-slide-shadow-left"):i.find(".swiper-slide-shadow-top"),m=b.isHorizontal()?i.find(".swiper-slide-shadow-right"):i.find(".swiper-slide-shadow-bottom");0===c.length&&(c=a('<div class="swiper-slide-shadow-'+(b.isHorizontal()?"left":"top")+'"></div>'),i.append(c)),0===m.length&&(m=a('<div class="swiper-slide-shadow-'+(b.isHorizontal()?"right":"bottom")+'"></div>'),i.append(m)),c.length&&(c[0].style.opacity=Math.max(-o,0)),m.length&&(m[0].style.opacity=Math.max(o,0))}}if(b.wrapper.css({"-webkit-transform-origin":"50% 50% -"+b.size/2+"px","-moz-transform-origin":"50% 50% -"+b.size/2+"px","-ms-transform-origin":"50% 50% -"+b.size/2+"px","transform-origin":"50% 50% -"+b.size/2+"px"}),b.params.cube.shadow)if(b.isHorizontal())e.transform("translate3d(0px, "+(b.width/2+b.params.cube.shadowOffset)+"px, "+-b.width/2+"px) rotateX(90deg) rotateZ(0deg) scale("+b.params.cube.shadowScale+")");else{var h=Math.abs(t)-90*Math.floor(Math.abs(t)/90),g=1.5-(Math.sin(2*h*Math.PI/360)/2+Math.cos(2*h*Math.PI/360)/2),f=b.params.cube.shadowScale,v=b.params.cube.shadowScale/g,w=b.params.cube.shadowOffset;e.transform("scale3d("+f+", 1, "+v+") translate3d(0px, "+(b.height/2+w)+"px, "+-b.height/2/v+"px) rotateX(-90deg)")}var y=b.isSafari||b.isUiWebView?-b.size/2:0;b.wrapper.transform("translate3d(0px,0,"+y+"px) rotateX("+(b.isHorizontal()?0:t)+"deg) rotateY("+(b.isHorizontal()?-t:0)+"deg)")},setTransition:function(e){b.slides.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e),b.params.cube.shadow&&!b.isHorizontal()&&b.container.find(".swiper-cube-shadow").transition(e)}},coverflow:{setTranslate:function(){for(var e=b.translate,t=b.isHorizontal()?-e+b.width/2:-e+b.height/2,s=b.isHorizontal()?b.params.coverflow.rotate:-b.params.coverflow.rotate,i=b.params.coverflow.depth,r=0,n=b.slides.length;r<n;r++){var o=b.slides.eq(r),l=b.slidesSizesGrid[r],p=o[0].swiperSlideOffset,d=(t-p-l/2)/l*b.params.coverflow.modifier,u=b.isHorizontal()?s*d:0,c=b.isHorizontal()?0:s*d,m=-i*Math.abs(d),h=b.isHorizontal()?0:b.params.coverflow.stretch*d,g=b.isHorizontal()?b.params.coverflow.stretch*d:0;Math.abs(g)<.001&&(g=0),Math.abs(h)<.001&&(h=0),Math.abs(m)<.001&&(m=0),Math.abs(u)<.001&&(u=0),Math.abs(c)<.001&&(c=0);var f="translate3d("+g+"px,"+h+"px,"+m+"px)  rotateX("+c+"deg) rotateY("+u+"deg)";if(o.transform(f),o[0].style.zIndex=-Math.abs(Math.round(d))+1,b.params.coverflow.slideShadows){var v=b.isHorizontal()?o.find(".swiper-slide-shadow-left"):o.find(".swiper-slide-shadow-top"),w=b.isHorizontal()?o.find(".swiper-slide-shadow-right"):o.find(".swiper-slide-shadow-bottom");0===v.length&&(v=a('<div class="swiper-slide-shadow-'+(b.isHorizontal()?"left":"top")+'"></div>'),o.append(v)),0===w.length&&(w=a('<div class="swiper-slide-shadow-'+(b.isHorizontal()?"right":"bottom")+'"></div>'),o.append(w)),v.length&&(v[0].style.opacity=d>0?d:0),w.length&&(w[0].style.opacity=-d>0?-d:0)}}if(b.browser.ie){var y=b.wrapper[0].style;y.perspectiveOrigin=t+"px 50%"}},setTransition:function(e){b.slides.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e)}}},b.lazy={initialImageLoaded:!1,loadImageInSlide:function(e,t){if("undefined"!=typeof e&&("undefined"==typeof t&&(t=!0),0!==b.slides.length)){var s=b.slides.eq(e),i=s.find("."+b.params.lazyLoadingClass+":not(."+b.params.lazyStatusLoadedClass+"):not(."+b.params.lazyStatusLoadingClass+")");!s.hasClass(b.params.lazyLoadingClass)||s.hasClass(b.params.lazyStatusLoadedClass)||s.hasClass(b.params.lazyStatusLoadingClass)||(i=i.add(s[0])),0!==i.length&&i.each(function(){var e=a(this);e.addClass(b.params.lazyStatusLoadingClass);var i=e.attr("data-background"),r=e.attr("data-src"),n=e.attr("data-srcset"),o=e.attr("data-sizes");b.loadImage(e[0],r||i,n,o,!1,function(){if(i?(e.css("background-image",'url("'+i+'")'),e.removeAttr("data-background")):(n&&(e.attr("srcset",n),e.removeAttr("data-srcset")),o&&(e.attr("sizes",o),e.removeAttr("data-sizes")),r&&(e.attr("src",r),e.removeAttr("data-src"))),e.addClass(b.params.lazyStatusLoadedClass).removeClass(b.params.lazyStatusLoadingClass),s.find("."+b.params.lazyPreloaderClass+", ."+b.params.preloaderClass).remove(),b.params.loop&&t){var a=s.attr("data-swiper-slide-index");if(s.hasClass(b.params.slideDuplicateClass)){var l=b.wrapper.children('[data-swiper-slide-index="'+a+'"]:not(.'+b.params.slideDuplicateClass+")");b.lazy.loadImageInSlide(l.index(),!1)}else{var p=b.wrapper.children("."+b.params.slideDuplicateClass+'[data-swiper-slide-index="'+a+'"]');b.lazy.loadImageInSlide(p.index(),!1)}}b.emit("onLazyImageReady",b,s[0],e[0])}),b.emit("onLazyImageLoad",b,s[0],e[0])})}},load:function(){var e,t=b.params.slidesPerView;if("auto"===t&&(t=0),b.lazy.initialImageLoaded||(b.lazy.initialImageLoaded=!0),b.params.watchSlidesVisibility)b.wrapper.children("."+b.params.slideVisibleClass).each(function(){b.lazy.loadImageInSlide(a(this).index())});else if(t>1)for(e=b.activeIndex;e<b.activeIndex+t;e++)b.slides[e]&&b.lazy.loadImageInSlide(e);else b.lazy.loadImageInSlide(b.activeIndex);if(b.params.lazyLoadingInPrevNext)if(t>1||b.params.lazyLoadingInPrevNextAmount&&b.params.lazyLoadingInPrevNextAmount>1){var s=b.params.lazyLoadingInPrevNextAmount,i=t,r=Math.min(b.activeIndex+i+Math.max(s,i),b.slides.length),n=Math.max(b.activeIndex-Math.max(i,s),0);for(e=b.activeIndex+t;e<r;e++)b.slides[e]&&b.lazy.loadImageInSlide(e);for(e=n;e<b.activeIndex;e++)b.slides[e]&&b.lazy.loadImageInSlide(e)}else{var o=b.wrapper.children("."+b.params.slideNextClass);o.length>0&&b.lazy.loadImageInSlide(o.index());var l=b.wrapper.children("."+b.params.slidePrevClass);l.length>0&&b.lazy.loadImageInSlide(l.index())}},onTransitionStart:function(){b.params.lazyLoading&&(b.params.lazyLoadingOnTransitionStart||!b.params.lazyLoadingOnTransitionStart&&!b.lazy.initialImageLoaded)&&b.lazy.load()},onTransitionEnd:function(){b.params.lazyLoading&&!b.params.lazyLoadingOnTransitionStart&&b.lazy.load()}},b.scrollbar={isTouched:!1,setDragPosition:function(e){var a=b.scrollbar,t=b.isHorizontal()?"touchstart"===e.type||"touchmove"===e.type?e.targetTouches[0].pageX:e.pageX||e.clientX:"touchstart"===e.type||"touchmove"===e.type?e.targetTouches[0].pageY:e.pageY||e.clientY,s=t-a.track.offset()[b.isHorizontal()?"left":"top"]-a.dragSize/2,i=-b.minTranslate()*a.moveDivider,r=-b.maxTranslate()*a.moveDivider;s<i?s=i:s>r&&(s=r),s=-s/a.moveDivider,b.updateProgress(s),b.setWrapperTranslate(s,!0)},dragStart:function(e){var a=b.scrollbar;a.isTouched=!0,e.preventDefault(),e.stopPropagation(),a.setDragPosition(e),clearTimeout(a.dragTimeout),a.track.transition(0),b.params.scrollbarHide&&a.track.css("opacity",1),b.wrapper.transition(100),a.drag.transition(100),b.emit("onScrollbarDragStart",b)},dragMove:function(e){var a=b.scrollbar;a.isTouched&&(e.preventDefault?e.preventDefault():e.returnValue=!1,a.setDragPosition(e),b.wrapper.transition(0),a.track.transition(0),a.drag.transition(0),b.emit("onScrollbarDragMove",b))},dragEnd:function(e){var a=b.scrollbar;a.isTouched&&(a.isTouched=!1,b.params.scrollbarHide&&(clearTimeout(a.dragTimeout),a.dragTimeout=setTimeout(function(){a.track.css("opacity",0),a.track.transition(400)},1e3)),b.emit("onScrollbarDragEnd",b),b.params.scrollbarSnapOnRelease&&b.slideReset())},draggableEvents:function(){return b.params.simulateTouch!==!1||b.support.touch?b.touchEvents:b.touchEventsDesktop}(),enableDraggable:function(){var e=b.scrollbar,t=b.support.touch?e.track:document;a(e.track).on(e.draggableEvents.start,e.dragStart),a(t).on(e.draggableEvents.move,e.dragMove),a(t).on(e.draggableEvents.end,e.dragEnd)},disableDraggable:function(){var e=b.scrollbar,t=b.support.touch?e.track:document;a(e.track).off(e.draggableEvents.start,e.dragStart),a(t).off(e.draggableEvents.move,e.dragMove),a(t).off(e.draggableEvents.end,e.dragEnd)},set:function(){if(b.params.scrollbar){var e=b.scrollbar;e.track=a(b.params.scrollbar),b.params.uniqueNavElements&&"string"==typeof b.params.scrollbar&&e.track.length>1&&1===b.container.find(b.params.scrollbar).length&&(e.track=b.container.find(b.params.scrollbar)),e.drag=e.track.find(".swiper-scrollbar-drag"),0===e.drag.length&&(e.drag=a('<div class="swiper-scrollbar-drag"></div>'),e.track.append(e.drag)),e.drag[0].style.width="",e.drag[0].style.height="",e.trackSize=b.isHorizontal()?e.track[0].offsetWidth:e.track[0].offsetHeight,e.divider=b.size/b.virtualSize,e.moveDivider=e.divider*(e.trackSize/b.size),e.dragSize=e.trackSize*e.divider,b.isHorizontal()?e.drag[0].style.width=e.dragSize+"px":e.drag[0].style.height=e.dragSize+"px",e.divider>=1?e.track[0].style.display="none":e.track[0].style.display="",b.params.scrollbarHide&&(e.track[0].style.opacity=0)}},setTranslate:function(){if(b.params.scrollbar){var e,a=b.scrollbar,t=(b.translate||0,a.dragSize);e=(a.trackSize-a.dragSize)*b.progress,b.rtl&&b.isHorizontal()?(e=-e,e>0?(t=a.dragSize-e,e=0):-e+a.dragSize>a.trackSize&&(t=a.trackSize+e)):e<0?(t=a.dragSize+e,e=0):e+a.dragSize>a.trackSize&&(t=a.trackSize-e),b.isHorizontal()?(b.support.transforms3d?a.drag.transform("translate3d("+e+"px, 0, 0)"):a.drag.transform("translateX("+e+"px)"),a.drag[0].style.width=t+"px"):(b.support.transforms3d?a.drag.transform("translate3d(0px, "+e+"px, 0)"):a.drag.transform("translateY("+e+"px)"),a.drag[0].style.height=t+"px"),b.params.scrollbarHide&&(clearTimeout(a.timeout),a.track[0].style.opacity=1,a.timeout=setTimeout(function(){a.track[0].style.opacity=0,a.track.transition(400)},1e3))}},setTransition:function(e){b.params.scrollbar&&b.scrollbar.drag.transition(e)}},b.controller={LinearSpline:function(e,a){this.x=e,this.y=a,this.lastIndex=e.length-1;var t,s;this.x.length;this.interpolate=function(e){return e?(s=i(this.x,e),t=s-1,(e-this.x[t])*(this.y[s]-this.y[t])/(this.x[s]-this.x[t])+this.y[t]):0};var i=function(){var e,a,t;return function(s,i){for(a=-1,e=s.length;e-a>1;)s[t=e+a>>1]<=i?a=t:e=t;return e}}()},getInterpolateFunction:function(e){b.controller.spline||(b.controller.spline=b.params.loop?new b.controller.LinearSpline(b.slidesGrid,e.slidesGrid):new b.controller.LinearSpline(b.snapGrid,e.snapGrid))},setTranslate:function(e,a){function s(a){e=a.rtl&&"horizontal"===a.params.direction?-b.translate:b.translate,"slide"===b.params.controlBy&&(b.controller.getInterpolateFunction(a),r=-b.controller.spline.interpolate(-e)),r&&"container"!==b.params.controlBy||(i=(a.maxTranslate()-a.minTranslate())/(b.maxTranslate()-b.minTranslate()),r=(e-b.minTranslate())*i+a.minTranslate()),b.params.controlInverse&&(r=a.maxTranslate()-r),a.updateProgress(r),a.setWrapperTranslate(r,!1,b),a.updateActiveIndex()}var i,r,n=b.params.control;if(b.isArray(n))for(var o=0;o<n.length;o++)n[o]!==a&&n[o]instanceof t&&s(n[o]);else n instanceof t&&a!==n&&s(n)},setTransition:function(e,a){function s(a){
a.setWrapperTransition(e,b),0!==e&&(a.onTransitionStart(),a.wrapper.transitionEnd(function(){r&&(a.params.loop&&"slide"===b.params.controlBy&&a.fixLoop(),a.onTransitionEnd())}))}var i,r=b.params.control;if(b.isArray(r))for(i=0;i<r.length;i++)r[i]!==a&&r[i]instanceof t&&s(r[i]);else r instanceof t&&a!==r&&s(r)}},b.hashnav={onHashCange:function(e,a){var t=document.location.hash.replace("#",""),s=b.slides.eq(b.activeIndex).attr("data-hash");t!==s&&b.slideTo(b.wrapper.children("."+b.params.slideClass+'[data-hash="'+t+'"]').index())},attachEvents:function(e){var t=e?"off":"on";a(window)[t]("hashchange",b.hashnav.onHashCange)},setHash:function(){if(b.hashnav.initialized&&b.params.hashnav)if(b.params.replaceState&&window.history&&window.history.replaceState)window.history.replaceState(null,null,"#"+b.slides.eq(b.activeIndex).attr("data-hash")||"");else{var e=b.slides.eq(b.activeIndex),a=e.attr("data-hash")||e.attr("data-history");document.location.hash=a||""}},init:function(){if(b.params.hashnav&&!b.params.history){b.hashnav.initialized=!0;var e=document.location.hash.replace("#","");if(e)for(var a=0,t=0,s=b.slides.length;t<s;t++){var i=b.slides.eq(t),r=i.attr("data-hash")||i.attr("data-history");if(r===e&&!i.hasClass(b.params.slideDuplicateClass)){var n=i.index();b.slideTo(n,a,b.params.runCallbacksOnInit,!0)}}b.params.hashnavWatchState&&b.hashnav.attachEvents()}},destroy:function(){b.params.hashnavWatchState&&b.hashnav.attachEvents(!0)}},b.history={init:function(){if(b.params.history){if(!window.history||!window.history.pushState)return b.params.history=!1,void(b.params.hashnav=!0);b.history.initialized=!0,this.paths=this.getPathValues(),(this.paths.key||this.paths.value)&&(this.scrollToSlide(0,this.paths.value,b.params.runCallbacksOnInit),b.params.replaceState||window.addEventListener("popstate",this.setHistoryPopState))}},setHistoryPopState:function(){b.history.paths=b.history.getPathValues(),b.history.scrollToSlide(b.params.speed,b.history.paths.value,!1)},getPathValues:function(){var e=window.location.pathname.slice(1).split("/"),a=e.length,t=e[a-2],s=e[a-1];return{key:t,value:s}},setHistory:function(e,a){if(b.history.initialized&&b.params.history){var t=b.slides.eq(a),s=this.slugify(t.attr("data-history"));window.location.pathname.includes(e)||(s=e+"/"+s),b.params.replaceState?window.history.replaceState(null,null,s):window.history.pushState(null,null,s)}},slugify:function(e){return e.toString().toLowerCase().replace(/\s+/g,"-").replace(/[^\w\-]+/g,"").replace(/\-\-+/g,"-").replace(/^-+/,"").replace(/-+$/,"")},scrollToSlide:function(e,a,t){if(a)for(var s=0,i=b.slides.length;s<i;s++){var r=b.slides.eq(s),n=this.slugify(r.attr("data-history"));if(n===a&&!r.hasClass(b.params.slideDuplicateClass)){var o=r.index();b.slideTo(o,e,t)}}else b.slideTo(0,e,t)}},b.disableKeyboardControl=function(){b.params.keyboardControl=!1,a(document).off("keydown",p)},b.enableKeyboardControl=function(){b.params.keyboardControl=!0,a(document).on("keydown",p)},b.mousewheel={event:!1,lastScrollTime:(new window.Date).getTime()},b.params.mousewheelControl&&(b.mousewheel.event=navigator.userAgent.indexOf("firefox")>-1?"DOMMouseScroll":d()?"wheel":"mousewheel"),b.disableMousewheelControl=function(){if(!b.mousewheel.event)return!1;var e=b.container;return"container"!==b.params.mousewheelEventsTarged&&(e=a(b.params.mousewheelEventsTarged)),e.off(b.mousewheel.event,u),!0},b.enableMousewheelControl=function(){if(!b.mousewheel.event)return!1;var e=b.container;return"container"!==b.params.mousewheelEventsTarged&&(e=a(b.params.mousewheelEventsTarged)),e.on(b.mousewheel.event,u),!0},b.parallax={setTranslate:function(){b.container.children("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function(){m(this,b.progress)}),b.slides.each(function(){var e=a(this);e.find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function(){var a=Math.min(Math.max(e[0].progress,-1),1);m(this,a)})})},setTransition:function(e){"undefined"==typeof e&&(e=b.params.speed),b.container.find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each(function(){var t=a(this),s=parseInt(t.attr("data-swiper-parallax-duration"),10)||e;0===e&&(s=0),t.transition(s)})}},b.zoom={scale:1,currentScale:1,isScaling:!1,gesture:{slide:void 0,slideWidth:void 0,slideHeight:void 0,image:void 0,imageWrap:void 0,zoomMax:b.params.zoomMax},image:{isTouched:void 0,isMoved:void 0,currentX:void 0,currentY:void 0,minX:void 0,minY:void 0,maxX:void 0,maxY:void 0,width:void 0,height:void 0,startX:void 0,startY:void 0,touchesStart:{},touchesCurrent:{}},velocity:{x:void 0,y:void 0,prevPositionX:void 0,prevPositionY:void 0,prevTime:void 0},getDistanceBetweenTouches:function(e){if(e.targetTouches.length<2)return 1;var a=e.targetTouches[0].pageX,t=e.targetTouches[0].pageY,s=e.targetTouches[1].pageX,i=e.targetTouches[1].pageY,r=Math.sqrt(Math.pow(s-a,2)+Math.pow(i-t,2));return r},onGestureStart:function(e){var t=b.zoom;if(!b.support.gestures){if("touchstart"!==e.type||"touchstart"===e.type&&e.targetTouches.length<2)return;t.gesture.scaleStart=t.getDistanceBetweenTouches(e)}return t.gesture.slide&&t.gesture.slide.length||(t.gesture.slide=a(this),0===t.gesture.slide.length&&(t.gesture.slide=b.slides.eq(b.activeIndex)),t.gesture.image=t.gesture.slide.find("img, svg, canvas"),t.gesture.imageWrap=t.gesture.image.parent("."+b.params.zoomContainerClass),t.gesture.zoomMax=t.gesture.imageWrap.attr("data-swiper-zoom")||b.params.zoomMax,0!==t.gesture.imageWrap.length)?(t.gesture.image.transition(0),void(t.isScaling=!0)):void(t.gesture.image=void 0)},onGestureChange:function(e){var a=b.zoom;if(!b.support.gestures){if("touchmove"!==e.type||"touchmove"===e.type&&e.targetTouches.length<2)return;a.gesture.scaleMove=a.getDistanceBetweenTouches(e)}a.gesture.image&&0!==a.gesture.image.length&&(b.support.gestures?a.scale=e.scale*a.currentScale:a.scale=a.gesture.scaleMove/a.gesture.scaleStart*a.currentScale,a.scale>a.gesture.zoomMax&&(a.scale=a.gesture.zoomMax-1+Math.pow(a.scale-a.gesture.zoomMax+1,.5)),a.scale<b.params.zoomMin&&(a.scale=b.params.zoomMin+1-Math.pow(b.params.zoomMin-a.scale+1,.5)),a.gesture.image.transform("translate3d(0,0,0) scale("+a.scale+")"))},onGestureEnd:function(e){var a=b.zoom;!b.support.gestures&&("touchend"!==e.type||"touchend"===e.type&&e.changedTouches.length<2)||a.gesture.image&&0!==a.gesture.image.length&&(a.scale=Math.max(Math.min(a.scale,a.gesture.zoomMax),b.params.zoomMin),a.gesture.image.transition(b.params.speed).transform("translate3d(0,0,0) scale("+a.scale+")"),a.currentScale=a.scale,a.isScaling=!1,1===a.scale&&(a.gesture.slide=void 0))},onTouchStart:function(e,a){var t=e.zoom;t.gesture.image&&0!==t.gesture.image.length&&(t.image.isTouched||("android"===e.device.os&&a.preventDefault(),t.image.isTouched=!0,t.image.touchesStart.x="touchstart"===a.type?a.targetTouches[0].pageX:a.pageX,t.image.touchesStart.y="touchstart"===a.type?a.targetTouches[0].pageY:a.pageY))},onTouchMove:function(e){var a=b.zoom;if(a.gesture.image&&0!==a.gesture.image.length&&(b.allowClick=!1,a.image.isTouched&&a.gesture.slide)){a.image.isMoved||(a.image.width=a.gesture.image[0].offsetWidth,a.image.height=a.gesture.image[0].offsetHeight,a.image.startX=b.getTranslate(a.gesture.imageWrap[0],"x")||0,a.image.startY=b.getTranslate(a.gesture.imageWrap[0],"y")||0,a.gesture.slideWidth=a.gesture.slide[0].offsetWidth,a.gesture.slideHeight=a.gesture.slide[0].offsetHeight,a.gesture.imageWrap.transition(0),b.rtl&&(a.image.startX=-a.image.startX),b.rtl&&(a.image.startY=-a.image.startY));var t=a.image.width*a.scale,s=a.image.height*a.scale;if(!(t<a.gesture.slideWidth&&s<a.gesture.slideHeight)){if(a.image.minX=Math.min(a.gesture.slideWidth/2-t/2,0),a.image.maxX=-a.image.minX,a.image.minY=Math.min(a.gesture.slideHeight/2-s/2,0),a.image.maxY=-a.image.minY,a.image.touchesCurrent.x="touchmove"===e.type?e.targetTouches[0].pageX:e.pageX,a.image.touchesCurrent.y="touchmove"===e.type?e.targetTouches[0].pageY:e.pageY,!a.image.isMoved&&!a.isScaling){if(b.isHorizontal()&&Math.floor(a.image.minX)===Math.floor(a.image.startX)&&a.image.touchesCurrent.x<a.image.touchesStart.x||Math.floor(a.image.maxX)===Math.floor(a.image.startX)&&a.image.touchesCurrent.x>a.image.touchesStart.x)return void(a.image.isTouched=!1);if(!b.isHorizontal()&&Math.floor(a.image.minY)===Math.floor(a.image.startY)&&a.image.touchesCurrent.y<a.image.touchesStart.y||Math.floor(a.image.maxY)===Math.floor(a.image.startY)&&a.image.touchesCurrent.y>a.image.touchesStart.y)return void(a.image.isTouched=!1)}e.preventDefault(),e.stopPropagation(),a.image.isMoved=!0,a.image.currentX=a.image.touchesCurrent.x-a.image.touchesStart.x+a.image.startX,a.image.currentY=a.image.touchesCurrent.y-a.image.touchesStart.y+a.image.startY,a.image.currentX<a.image.minX&&(a.image.currentX=a.image.minX+1-Math.pow(a.image.minX-a.image.currentX+1,.8)),a.image.currentX>a.image.maxX&&(a.image.currentX=a.image.maxX-1+Math.pow(a.image.currentX-a.image.maxX+1,.8)),a.image.currentY<a.image.minY&&(a.image.currentY=a.image.minY+1-Math.pow(a.image.minY-a.image.currentY+1,.8)),a.image.currentY>a.image.maxY&&(a.image.currentY=a.image.maxY-1+Math.pow(a.image.currentY-a.image.maxY+1,.8)),a.velocity.prevPositionX||(a.velocity.prevPositionX=a.image.touchesCurrent.x),a.velocity.prevPositionY||(a.velocity.prevPositionY=a.image.touchesCurrent.y),a.velocity.prevTime||(a.velocity.prevTime=Date.now()),a.velocity.x=(a.image.touchesCurrent.x-a.velocity.prevPositionX)/(Date.now()-a.velocity.prevTime)/2,a.velocity.y=(a.image.touchesCurrent.y-a.velocity.prevPositionY)/(Date.now()-a.velocity.prevTime)/2,Math.abs(a.image.touchesCurrent.x-a.velocity.prevPositionX)<2&&(a.velocity.x=0),Math.abs(a.image.touchesCurrent.y-a.velocity.prevPositionY)<2&&(a.velocity.y=0),a.velocity.prevPositionX=a.image.touchesCurrent.x,a.velocity.prevPositionY=a.image.touchesCurrent.y,a.velocity.prevTime=Date.now(),a.gesture.imageWrap.transform("translate3d("+a.image.currentX+"px, "+a.image.currentY+"px,0)")}}},onTouchEnd:function(e,a){var t=e.zoom;if(t.gesture.image&&0!==t.gesture.image.length){if(!t.image.isTouched||!t.image.isMoved)return t.image.isTouched=!1,void(t.image.isMoved=!1);t.image.isTouched=!1,t.image.isMoved=!1;var s=300,i=300,r=t.velocity.x*s,n=t.image.currentX+r,o=t.velocity.y*i,l=t.image.currentY+o;0!==t.velocity.x&&(s=Math.abs((n-t.image.currentX)/t.velocity.x)),0!==t.velocity.y&&(i=Math.abs((l-t.image.currentY)/t.velocity.y));var p=Math.max(s,i);t.image.currentX=n,t.image.currentY=l;var d=t.image.width*t.scale,u=t.image.height*t.scale;t.image.minX=Math.min(t.gesture.slideWidth/2-d/2,0),t.image.maxX=-t.image.minX,t.image.minY=Math.min(t.gesture.slideHeight/2-u/2,0),t.image.maxY=-t.image.minY,t.image.currentX=Math.max(Math.min(t.image.currentX,t.image.maxX),t.image.minX),t.image.currentY=Math.max(Math.min(t.image.currentY,t.image.maxY),t.image.minY),t.gesture.imageWrap.transition(p).transform("translate3d("+t.image.currentX+"px, "+t.image.currentY+"px,0)")}},onTransitionEnd:function(e){var a=e.zoom;a.gesture.slide&&e.previousIndex!==e.activeIndex&&(a.gesture.image.transform("translate3d(0,0,0) scale(1)"),a.gesture.imageWrap.transform("translate3d(0,0,0)"),a.gesture.slide=a.gesture.image=a.gesture.imageWrap=void 0,a.scale=a.currentScale=1)},toggleZoom:function(e,t){var s=e.zoom;if(s.gesture.slide||(s.gesture.slide=e.clickedSlide?a(e.clickedSlide):e.slides.eq(e.activeIndex),s.gesture.image=s.gesture.slide.find("img, svg, canvas"),s.gesture.imageWrap=s.gesture.image.parent("."+e.params.zoomContainerClass)),s.gesture.image&&0!==s.gesture.image.length){var i,r,n,o,l,p,d,u,c,m,h,g,f,v,w,y,x,T;"undefined"==typeof s.image.touchesStart.x&&t?(i="touchend"===t.type?t.changedTouches[0].pageX:t.pageX,r="touchend"===t.type?t.changedTouches[0].pageY:t.pageY):(i=s.image.touchesStart.x,r=s.image.touchesStart.y),s.scale&&1!==s.scale?(s.scale=s.currentScale=1,s.gesture.imageWrap.transition(300).transform("translate3d(0,0,0)"),s.gesture.image.transition(300).transform("translate3d(0,0,0) scale(1)"),s.gesture.slide=void 0):(s.scale=s.currentScale=s.gesture.imageWrap.attr("data-swiper-zoom")||e.params.zoomMax,t?(x=s.gesture.slide[0].offsetWidth,T=s.gesture.slide[0].offsetHeight,n=s.gesture.slide.offset().left,o=s.gesture.slide.offset().top,l=n+x/2-i,p=o+T/2-r,c=s.gesture.image[0].offsetWidth,m=s.gesture.image[0].offsetHeight,h=c*s.scale,g=m*s.scale,f=Math.min(x/2-h/2,0),v=Math.min(T/2-g/2,0),w=-f,y=-v,d=l*s.scale,u=p*s.scale,d<f&&(d=f),d>w&&(d=w),u<v&&(u=v),u>y&&(u=y)):(d=0,u=0),s.gesture.imageWrap.transition(300).transform("translate3d("+d+"px, "+u+"px,0)"),s.gesture.image.transition(300).transform("translate3d(0,0,0) scale("+s.scale+")"))}},attachEvents:function(e){var t=e?"off":"on";if(b.params.zoom){var s=(b.slides,!("touchstart"!==b.touchEvents.start||!b.support.passiveListener||!b.params.passiveListeners)&&{passive:!0,capture:!1});b.support.gestures?(b.slides[t]("gesturestart",b.zoom.onGestureStart,s),b.slides[t]("gesturechange",b.zoom.onGestureChange,s),b.slides[t]("gestureend",b.zoom.onGestureEnd,s)):"touchstart"===b.touchEvents.start&&(b.slides[t](b.touchEvents.start,b.zoom.onGestureStart,s),b.slides[t](b.touchEvents.move,b.zoom.onGestureChange,s),b.slides[t](b.touchEvents.end,b.zoom.onGestureEnd,s)),b[t]("touchStart",b.zoom.onTouchStart),b.slides.each(function(e,s){a(s).find("."+b.params.zoomContainerClass).length>0&&a(s)[t](b.touchEvents.move,b.zoom.onTouchMove)}),b[t]("touchEnd",b.zoom.onTouchEnd),b[t]("transitionEnd",b.zoom.onTransitionEnd),b.params.zoomToggle&&b.on("doubleTap",b.zoom.toggleZoom)}},init:function(){b.zoom.attachEvents()},destroy:function(){b.zoom.attachEvents(!0)}},b._plugins=[];for(var O in b.plugins){var N=b.plugins[O](b,b.params[O]);N&&b._plugins.push(N)}return b.callPlugins=function(e){for(var a=0;a<b._plugins.length;a++)e in b._plugins[a]&&b._plugins[a][e](arguments[1],arguments[2],arguments[3],arguments[4],arguments[5])},b.emitterEventListeners={},b.emit=function(e){b.params[e]&&b.params[e](arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]);var a;if(b.emitterEventListeners[e])for(a=0;a<b.emitterEventListeners[e].length;a++)b.emitterEventListeners[e][a](arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]);b.callPlugins&&b.callPlugins(e,arguments[1],arguments[2],arguments[3],arguments[4],arguments[5])},b.on=function(e,a){return e=h(e),b.emitterEventListeners[e]||(b.emitterEventListeners[e]=[]),b.emitterEventListeners[e].push(a),b},b.off=function(e,a){var t;if(e=h(e),"undefined"==typeof a)return b.emitterEventListeners[e]=[],b;if(b.emitterEventListeners[e]&&0!==b.emitterEventListeners[e].length){for(t=0;t<b.emitterEventListeners[e].length;t++)b.emitterEventListeners[e][t]===a&&b.emitterEventListeners[e].splice(t,1);return b}},b.once=function(e,a){e=h(e);var t=function(){a(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4]),b.off(e,t)};return b.on(e,t),b},b.a11y={makeFocusable:function(e){return e.attr("tabIndex","0"),e},addRole:function(e,a){return e.attr("role",a),e},addLabel:function(e,a){return e.attr("aria-label",a),e},disable:function(e){return e.attr("aria-disabled",!0),e},enable:function(e){return e.attr("aria-disabled",!1),e},onEnterKey:function(e){13===e.keyCode&&(a(e.target).is(b.params.nextButton)?(b.onClickNext(e),b.isEnd?b.a11y.notify(b.params.lastSlideMessage):b.a11y.notify(b.params.nextSlideMessage)):a(e.target).is(b.params.prevButton)&&(b.onClickPrev(e),b.isBeginning?b.a11y.notify(b.params.firstSlideMessage):b.a11y.notify(b.params.prevSlideMessage)),a(e.target).is("."+b.params.bulletClass)&&a(e.target)[0].click())},liveRegion:a('<span class="'+b.params.notificationClass+'" aria-live="assertive" aria-atomic="true"></span>'),notify:function(e){var a=b.a11y.liveRegion;0!==a.length&&(a.html(""),a.html(e))},init:function(){b.params.nextButton&&b.nextButton&&b.nextButton.length>0&&(b.a11y.makeFocusable(b.nextButton),b.a11y.addRole(b.nextButton,"button"),b.a11y.addLabel(b.nextButton,b.params.nextSlideMessage)),b.params.prevButton&&b.prevButton&&b.prevButton.length>0&&(b.a11y.makeFocusable(b.prevButton),b.a11y.addRole(b.prevButton,"button"),b.a11y.addLabel(b.prevButton,b.params.prevSlideMessage)),a(b.container).append(b.a11y.liveRegion)},initPagination:function(){b.params.pagination&&b.params.paginationClickable&&b.bullets&&b.bullets.length&&b.bullets.each(function(){var e=a(this);b.a11y.makeFocusable(e),b.a11y.addRole(e,"button"),b.a11y.addLabel(e,b.params.paginationBulletMessage.replace(/{{index}}/,e.index()+1))})},destroy:function(){b.a11y.liveRegion&&b.a11y.liveRegion.length>0&&b.a11y.liveRegion.remove()}},b.init=function(){b.params.loop&&b.createLoop(),b.updateContainerSize(),b.updateSlidesSize(),b.updatePagination(),b.params.scrollbar&&b.scrollbar&&(b.scrollbar.set(),b.params.scrollbarDraggable&&b.scrollbar.enableDraggable()),"slide"!==b.params.effect&&b.effects[b.params.effect]&&(b.params.loop||b.updateProgress(),b.effects[b.params.effect].setTranslate()),b.params.loop?b.slideTo(b.params.initialSlide+b.loopedSlides,0,b.params.runCallbacksOnInit):(b.slideTo(b.params.initialSlide,0,b.params.runCallbacksOnInit),0===b.params.initialSlide&&(b.parallax&&b.params.parallax&&b.parallax.setTranslate(),b.lazy&&b.params.lazyLoading&&(b.lazy.load(),b.lazy.initialImageLoaded=!0))),b.attachEvents(),b.params.observer&&b.support.observer&&b.initObservers(),b.params.preloadImages&&!b.params.lazyLoading&&b.preloadImages(),b.params.zoom&&b.zoom&&b.zoom.init(),b.params.autoplay&&b.startAutoplay(),b.params.keyboardControl&&b.enableKeyboardControl&&b.enableKeyboardControl(),b.params.mousewheelControl&&b.enableMousewheelControl&&b.enableMousewheelControl(),b.params.hashnavReplaceState&&(b.params.replaceState=b.params.hashnavReplaceState),b.params.history&&b.history&&b.history.init(),b.params.hashnav&&b.hashnav&&b.hashnav.init(),b.params.a11y&&b.a11y&&b.a11y.init(),b.emit("onInit",b)},b.cleanupStyles=function(){b.container.removeClass(b.classNames.join(" ")).removeAttr("style"),b.wrapper.removeAttr("style"),b.slides&&b.slides.length&&b.slides.removeClass([b.params.slideVisibleClass,b.params.slideActiveClass,b.params.slideNextClass,b.params.slidePrevClass].join(" ")).removeAttr("style").removeAttr("data-swiper-column").removeAttr("data-swiper-row"),b.paginationContainer&&b.paginationContainer.length&&b.paginationContainer.removeClass(b.params.paginationHiddenClass),b.bullets&&b.bullets.length&&b.bullets.removeClass(b.params.bulletActiveClass),b.params.prevButton&&a(b.params.prevButton).removeClass(b.params.buttonDisabledClass),b.params.nextButton&&a(b.params.nextButton).removeClass(b.params.buttonDisabledClass),b.params.scrollbar&&b.scrollbar&&(b.scrollbar.track&&b.scrollbar.track.length&&b.scrollbar.track.removeAttr("style"),b.scrollbar.drag&&b.scrollbar.drag.length&&b.scrollbar.drag.removeAttr("style"))},b.destroy=function(e,a){b.detachEvents(),b.stopAutoplay(),b.params.scrollbar&&b.scrollbar&&b.params.scrollbarDraggable&&b.scrollbar.disableDraggable(),b.params.loop&&b.destroyLoop(),a&&b.cleanupStyles(),b.disconnectObservers(),b.params.zoom&&b.zoom&&b.zoom.destroy(),b.params.keyboardControl&&b.disableKeyboardControl&&b.disableKeyboardControl(),b.params.mousewheelControl&&b.disableMousewheelControl&&b.disableMousewheelControl(),b.params.a11y&&b.a11y&&b.a11y.destroy(),b.params.history&&!b.params.replaceState&&window.removeEventListener("popstate",b.history.setHistoryPopState),b.params.hashnav&&b.hashnav&&b.hashnav.destroy(),b.emit("onDestroy"),e!==!1&&(b=null)},b.init(),b}};t.prototype={isSafari:function(){var e=window.navigator.userAgent.toLowerCase();return e.indexOf("safari")>=0&&e.indexOf("chrome")<0&&e.indexOf("android")<0}(),isUiWebView:/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(window.navigator.userAgent),isArray:function(e){return"[object Array]"===Object.prototype.toString.apply(e)},browser:{ie:window.navigator.pointerEnabled||window.navigator.msPointerEnabled,ieTouch:window.navigator.msPointerEnabled&&window.navigator.msMaxTouchPoints>1||window.navigator.pointerEnabled&&window.navigator.maxTouchPoints>1,lteIE9:function(){var e=document.createElement("div");return e.innerHTML="<!--[if lte IE 9]><i></i><![endif]-->",1===e.getElementsByTagName("i").length}()},device:function(){var e=window.navigator.userAgent,a=e.match(/(Android);?[\s\/]+([\d.]+)?/),t=e.match(/(iPad).*OS\s([\d_]+)/),s=e.match(/(iPod)(.*OS\s([\d_]+))?/),i=!t&&e.match(/(iPhone\sOS|iOS)\s([\d_]+)/);return{ios:t||i||s,android:a}}(),support:{touch:window.Modernizr&&Modernizr.touch===!0||function(){return!!("ontouchstart"in window||window.DocumentTouch&&document instanceof DocumentTouch)}(),transforms3d:window.Modernizr&&Modernizr.csstransforms3d===!0||function(){var e=document.createElement("div").style;return"webkitPerspective"in e||"MozPerspective"in e||"OPerspective"in e||"MsPerspective"in e||"perspective"in e}(),flexbox:function(){for(var e=document.createElement("div").style,a="alignItems webkitAlignItems webkitBoxAlign msFlexAlign mozBoxAlign webkitFlexDirection msFlexDirection mozBoxDirection mozBoxOrient webkitBoxDirection webkitBoxOrient".split(" "),t=0;t<a.length;t++)if(a[t]in e)return!0}(),observer:function(){return"MutationObserver"in window||"WebkitMutationObserver"in window}(),passiveListener:function(){var e=!1;try{var a=Object.defineProperty({},"passive",{get:function(){e=!0}});window.addEventListener("testPassiveListener",null,a)}catch(e){}return e}(),gestures:function(){return"ongesturestart"in window}()},plugins:{}};for(var s=(function(){var e=function(e){var a=this,t=0;for(t=0;t<e.length;t++)a[t]=e[t];return a.length=e.length,this},a=function(a,t){var s=[],i=0;if(a&&!t&&a instanceof e)return a;if(a)if("string"==typeof a){var r,n,o=a.trim();if(o.indexOf("<")>=0&&o.indexOf(">")>=0){var l="div";for(0===o.indexOf("<li")&&(l="ul"),0===o.indexOf("<tr")&&(l="tbody"),0!==o.indexOf("<td")&&0!==o.indexOf("<th")||(l="tr"),0===o.indexOf("<tbody")&&(l="table"),0===o.indexOf("<option")&&(l="select"),n=document.createElement(l),n.innerHTML=a,i=0;i<n.childNodes.length;i++)s.push(n.childNodes[i])}else for(r=t||"#"!==a[0]||a.match(/[ .<>:~]/)?(t||document).querySelectorAll(a):[document.getElementById(a.split("#")[1])],i=0;i<r.length;i++)r[i]&&s.push(r[i])}else if(a.nodeType||a===window||a===document)s.push(a);else if(a.length>0&&a[0].nodeType)for(i=0;i<a.length;i++)s.push(a[i]);return new e(s)};return e.prototype={addClass:function(e){if("undefined"==typeof e)return this;for(var a=e.split(" "),t=0;t<a.length;t++)for(var s=0;s<this.length;s++)this[s].classList.add(a[t]);return this},removeClass:function(e){for(var a=e.split(" "),t=0;t<a.length;t++)for(var s=0;s<this.length;s++)this[s].classList.remove(a[t]);return this},hasClass:function(e){return!!this[0]&&this[0].classList.contains(e)},toggleClass:function(e){for(var a=e.split(" "),t=0;t<a.length;t++)for(var s=0;s<this.length;s++)this[s].classList.toggle(a[t]);return this},attr:function(e,a){if(1===arguments.length&&"string"==typeof e)return this[0]?this[0].getAttribute(e):void 0;for(var t=0;t<this.length;t++)if(2===arguments.length)this[t].setAttribute(e,a);else for(var s in e)this[t][s]=e[s],this[t].setAttribute(s,e[s]);return this},removeAttr:function(e){for(var a=0;a<this.length;a++)this[a].removeAttribute(e);return this},data:function(e,a){if("undefined"!=typeof a){for(var t=0;t<this.length;t++){var s=this[t];s.dom7ElementDataStorage||(s.dom7ElementDataStorage={}),s.dom7ElementDataStorage[e]=a}return this}if(this[0]){var i=this[0].getAttribute("data-"+e);return i?i:this[0].dom7ElementDataStorage&&e in this[0].dom7ElementDataStorage?this[0].dom7ElementDataStorage[e]:void 0}},transform:function(e){for(var a=0;a<this.length;a++){var t=this[a].style;t.webkitTransform=t.MsTransform=t.msTransform=t.MozTransform=t.OTransform=t.transform=e}return this},transition:function(e){"string"!=typeof e&&(e+="ms");for(var a=0;a<this.length;a++){var t=this[a].style;t.webkitTransitionDuration=t.MsTransitionDuration=t.msTransitionDuration=t.MozTransitionDuration=t.OTransitionDuration=t.transitionDuration=e}return this},on:function(e,t,s,i){function r(e){var i=e.target;if(a(i).is(t))s.call(i,e);else for(var r=a(i).parents(),n=0;n<r.length;n++)a(r[n]).is(t)&&s.call(r[n],e)}var n,o,l=e.split(" ");for(n=0;n<this.length;n++)if("function"==typeof t||t===!1)for("function"==typeof t&&(s=arguments[1],i=arguments[2]||!1),o=0;o<l.length;o++)this[n].addEventListener(l[o],s,i);else for(o=0;o<l.length;o++)this[n].dom7LiveListeners||(this[n].dom7LiveListeners=[]),this[n].dom7LiveListeners.push({listener:s,liveListener:r}),this[n].addEventListener(l[o],r,i);return this},off:function(e,a,t,s){for(var i=e.split(" "),r=0;r<i.length;r++)for(var n=0;n<this.length;n++)if("function"==typeof a||a===!1)"function"==typeof a&&(t=arguments[1],s=arguments[2]||!1),this[n].removeEventListener(i[r],t,s);else if(this[n].dom7LiveListeners)for(var o=0;o<this[n].dom7LiveListeners.length;o++)this[n].dom7LiveListeners[o].listener===t&&this[n].removeEventListener(i[r],this[n].dom7LiveListeners[o].liveListener,s);return this},once:function(e,a,t,s){function i(n){t(n),r.off(e,a,i,s)}var r=this;"function"==typeof a&&(a=!1,t=arguments[1],s=arguments[2]),r.on(e,a,i,s)},trigger:function(e,a){for(var t=0;t<this.length;t++){var s;try{s=new window.CustomEvent(e,{detail:a,bubbles:!0,cancelable:!0})}catch(t){s=document.createEvent("Event"),s.initEvent(e,!0,!0),s.detail=a}this[t].dispatchEvent(s)}return this},transitionEnd:function(e){function a(r){if(r.target===this)for(e.call(this,r),t=0;t<s.length;t++)i.off(s[t],a)}var t,s=["webkitTransitionEnd","transitionend","oTransitionEnd","MSTransitionEnd","msTransitionEnd"],i=this;if(e)for(t=0;t<s.length;t++)i.on(s[t],a);return this},width:function(){return this[0]===window?window.innerWidth:this.length>0?parseFloat(this.css("width")):null},outerWidth:function(e){return this.length>0?e?this[0].offsetWidth+parseFloat(this.css("margin-right"))+parseFloat(this.css("margin-left")):this[0].offsetWidth:null},height:function(){return this[0]===window?window.innerHeight:this.length>0?parseFloat(this.css("height")):null},outerHeight:function(e){return this.length>0?e?this[0].offsetHeight+parseFloat(this.css("margin-top"))+parseFloat(this.css("margin-bottom")):this[0].offsetHeight:null},offset:function(){if(this.length>0){var e=this[0],a=e.getBoundingClientRect(),t=document.body,s=e.clientTop||t.clientTop||0,i=e.clientLeft||t.clientLeft||0,r=window.pageYOffset||e.scrollTop,n=window.pageXOffset||e.scrollLeft;return{top:a.top+r-s,left:a.left+n-i}}return null},css:function(e,a){var t;if(1===arguments.length){if("string"!=typeof e){for(t=0;t<this.length;t++)for(var s in e)this[t].style[s]=e[s];return this}if(this[0])return window.getComputedStyle(this[0],null).getPropertyValue(e)}if(2===arguments.length&&"string"==typeof e){for(t=0;t<this.length;t++)this[t].style[e]=a;return this}return this},each:function(e){for(var a=0;a<this.length;a++)e.call(this[a],a,this[a]);return this},html:function(e){if("undefined"==typeof e)return this[0]?this[0].innerHTML:void 0;for(var a=0;a<this.length;a++)this[a].innerHTML=e;return this},text:function(e){if("undefined"==typeof e)return this[0]?this[0].textContent.trim():null;for(var a=0;a<this.length;a++)this[a].textContent=e;return this},is:function(t){if(!this[0])return!1;var s,i;if("string"==typeof t){var r=this[0];if(r===document)return t===document;if(r===window)return t===window;if(r.matches)return r.matches(t);if(r.webkitMatchesSelector)return r.webkitMatchesSelector(t);if(r.mozMatchesSelector)return r.mozMatchesSelector(t);if(r.msMatchesSelector)return r.msMatchesSelector(t);for(s=a(t),i=0;i<s.length;i++)if(s[i]===this[0])return!0;return!1}if(t===document)return this[0]===document;if(t===window)return this[0]===window;if(t.nodeType||t instanceof e){for(s=t.nodeType?[t]:t,i=0;i<s.length;i++)if(s[i]===this[0])return!0;return!1}return!1},index:function(){if(this[0]){for(var e=this[0],a=0;null!==(e=e.previousSibling);)1===e.nodeType&&a++;return a}},eq:function(a){if("undefined"==typeof a)return this;var t,s=this.length;return a>s-1?new e([]):a<0?(t=s+a,new e(t<0?[]:[this[t]])):new e([this[a]])},append:function(a){var t,s;for(t=0;t<this.length;t++)if("string"==typeof a){var i=document.createElement("div");for(i.innerHTML=a;i.firstChild;)this[t].appendChild(i.firstChild)}else if(a instanceof e)for(s=0;s<a.length;s++)this[t].appendChild(a[s]);else this[t].appendChild(a);return this},prepend:function(a){var t,s;for(t=0;t<this.length;t++)if("string"==typeof a){var i=document.createElement("div");for(i.innerHTML=a,s=i.childNodes.length-1;s>=0;s--)this[t].insertBefore(i.childNodes[s],this[t].childNodes[0])}else if(a instanceof e)for(s=0;s<a.length;s++)this[t].insertBefore(a[s],this[t].childNodes[0]);else this[t].insertBefore(a,this[t].childNodes[0]);return this},insertBefore:function(e){for(var t=a(e),s=0;s<this.length;s++)if(1===t.length)t[0].parentNode.insertBefore(this[s],t[0]);else if(t.length>1)for(var i=0;i<t.length;i++)t[i].parentNode.insertBefore(this[s].cloneNode(!0),t[i])},insertAfter:function(e){for(var t=a(e),s=0;s<this.length;s++)if(1===t.length)t[0].parentNode.insertBefore(this[s],t[0].nextSibling);else if(t.length>1)for(var i=0;i<t.length;i++)t[i].parentNode.insertBefore(this[s].cloneNode(!0),t[i].nextSibling)},next:function(t){return new e(this.length>0?t?this[0].nextElementSibling&&a(this[0].nextElementSibling).is(t)?[this[0].nextElementSibling]:[]:this[0].nextElementSibling?[this[0].nextElementSibling]:[]:[])},nextAll:function(t){var s=[],i=this[0];if(!i)return new e([]);for(;i.nextElementSibling;){var r=i.nextElementSibling;t?a(r).is(t)&&s.push(r):s.push(r),i=r}return new e(s)},prev:function(t){return new e(this.length>0?t?this[0].previousElementSibling&&a(this[0].previousElementSibling).is(t)?[this[0].previousElementSibling]:[]:this[0].previousElementSibling?[this[0].previousElementSibling]:[]:[])},prevAll:function(t){var s=[],i=this[0];if(!i)return new e([]);for(;i.previousElementSibling;){var r=i.previousElementSibling;t?a(r).is(t)&&s.push(r):s.push(r),i=r}return new e(s)},parent:function(e){for(var t=[],s=0;s<this.length;s++)e?a(this[s].parentNode).is(e)&&t.push(this[s].parentNode):t.push(this[s].parentNode);return a(a.unique(t))},parents:function(e){for(var t=[],s=0;s<this.length;s++)for(var i=this[s].parentNode;i;)e?a(i).is(e)&&t.push(i):t.push(i),i=i.parentNode;return a(a.unique(t))},find:function(a){for(var t=[],s=0;s<this.length;s++)for(var i=this[s].querySelectorAll(a),r=0;r<i.length;r++)t.push(i[r]);return new e(t)},children:function(t){for(var s=[],i=0;i<this.length;i++)for(var r=this[i].childNodes,n=0;n<r.length;n++)t?1===r[n].nodeType&&a(r[n]).is(t)&&s.push(r[n]):1===r[n].nodeType&&s.push(r[n]);return new e(a.unique(s))},remove:function(){for(var e=0;e<this.length;e++)this[e].parentNode&&this[e].parentNode.removeChild(this[e]);return this},add:function(){var e,t,s=this;for(e=0;e<arguments.length;e++){var i=a(arguments[e]);for(t=0;t<i.length;t++)s[s.length]=i[t],s.length++}return s}},a.fn=e.prototype,a.unique=function(e){for(var a=[],t=0;t<e.length;t++)a.indexOf(e[t])===-1&&a.push(e[t]);return a},a}()),i=["jQuery","Zepto","Dom7"],r=0;r<i.length;r++)window[i[r]]&&e(window[i[r]]);var n;n="undefined"==typeof s?window.Dom7||window.Zepto||window.jQuery:s,n&&("transitionEnd"in n.fn||(n.fn.transitionEnd=function(e){function a(r){if(r.target===this)for(e.call(this,r),t=0;t<s.length;t++)i.off(s[t],a)}var t,s=["webkitTransitionEnd","transitionend","oTransitionEnd","MSTransitionEnd","msTransitionEnd"],i=this;if(e)for(t=0;t<s.length;t++)i.on(s[t],a);return this}),"transform"in n.fn||(n.fn.transform=function(e){for(var a=0;a<this.length;a++){var t=this[a].style;t.webkitTransform=t.MsTransform=t.msTransform=t.MozTransform=t.OTransform=t.transform=e}return this}),"transition"in n.fn||(n.fn.transition=function(e){"string"!=typeof e&&(e+="ms");for(var a=0;a<this.length;a++){var t=this[a].style;t.webkitTransitionDuration=t.MsTransitionDuration=t.msTransitionDuration=t.MozTransitionDuration=t.OTransitionDuration=t.transitionDuration=e;
}return this}),"outerWidth"in n.fn||(n.fn.outerWidth=function(e){return this.length>0?e?this[0].offsetWidth+parseFloat(this.css("margin-right"))+parseFloat(this.css("margin-left")):this[0].offsetWidth:null})),window.Swiper=t}(),"undefined"!=typeof module?module.exports=window.Swiper:"function"==typeof define&&define.amd&&define([],function(){"use strict";return window.Swiper});
//# sourceMappingURL=maps/swiper.min.js.map

'use strict';

$(document).ready(function () {
    var flag = false;

    //FIX DISPLAY SVG ICONS При использовании cms нужно раскомментировать, это фиксит баг в Firefox
    //(function(){
    //    var uses = document.querySelectorAll('use')
    //    for (var i = 0; i < uses.length; i++) {
    //        var use = uses[i];
    //        var href = use.getAttribute('xlink:href');
    //        if (href.indexOf('#') == 0)
    //            use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', location.href + href);
    //    }
    //})();


    //Удобно для теста адаптива но появляется баг с инпутом number на андроиде
    //window.addEventListener('resize', generalFunction);
    //window.addEventListener('load', generalFunction);

    //CUSTOM INPUT SEARCH
    $('.input-search').on('focus', function () {
        $('.form-search').addClass('focus');
    });

    $('.input-search').on('blur', function () {
        if ($('.input-search').val() == '') {
            $('.form-search').removeClass('focus');
        }
    });

    function generalFunction() {

        //SCROLL MENU
        if ($(window).outerWidth() > 670) {
            var heightHeader = $('.scroll-menu');
            $(window).scroll(function () {
                if ($(this).scrollTop() > heightHeader.outerHeight()) {
                    heightHeader.addClass('animation');
                } else {
                    heightHeader.removeClass('animation');
                }
                if ($(this).scrollTop() > heightHeader.outerHeight() * 2) {
                    heightHeader.addClass('fxd1');
                } else {
                    heightHeader.removeClass('fxd1');
                }
                if ($(this).scrollTop() > heightHeader.outerHeight() * 5) {
                    heightHeader.addClass('fxd2');
                } else {
                    heightHeader.removeClass('fxd2');
                }
            });
        }

        // DROP NAVIGATION
        if ($(window).width() > 670) {
            $('.drop1_left').each(function (i, el) {
                if (!$(el).find('li.active').find('.drop1_right').find('li').length) {
                    $(el).find('li.active').find('.drop1_right').css({ 'display': 'none', 'height': 0 });
                } else {
                    if ($(el).outerHeight() < $(this).find('.drop1_right').innerHeight()) {
                        $(el).outerHeight($(this).find('.drop1_right').innerHeight());
                    } else {
                        $(el).find('.drop1_right').outerHeight($(this).innerHeight());
                    }
                }
            });

            $('.drop1_left>li>a').on('mouseover', function () {
                if ($(this).next('.drop1_right').find('li').length) {

                    if ($(this).next().outerHeight() > $(this).closest('.drop1_left').children('li').outerHeight(true) * $(this).closest('.drop1_left').children('li').length) {
                        $(this).closest('.drop1_left').css({ 'height': $(this).next().innerHeight() });
                    } else {

                        $(this).next('.drop1_right').innerHeight($(this).closest('.drop1_left').outerHeight());
                    }
                } else {
                    $(this).closest('.drop1_left').css({ 'height': 'auto' });
                }

                $(this).parent().parent().find('li').removeClass('active');
                $(this).parent().addClass('active');
            });
        }

        // MOVE FILTER BOX WHEN RESOLUTION <=730
        if ($(window).outerWidth() <= 730) {
            $('.filter').insertBefore('.sort');
            $('.mfilter-box').insertBefore('.sort');
        }

        if ($(window).outerWidth() <= 670) {
            //MOVE LANGUAGE BOX
            //$('.language').insertBefore('nav.mobile-menu .form-search');


            //MOVE NAVIGATION
            $('nav.mobile-menu h2:first').after($('.general-navigation'));

            $('.general-navigation').after($('.discount').text('Скидки'));

            // MOBILE MENU
            var deviceEvent = 'click';
            //if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            //    deviceEvent = 'touchstart';
            //}
            $('a.mobile-menu').on(deviceEvent, function (e) {
                e.preventDefault();
                $('.container, .blur').toggleClass('degradation');
                $('nav.mobile-menu').toggleClass('active');
                $('a.mobile-menu').toggleClass('active');
                setTimeout(function () {
                    $('footer').toggle();
                    if ($('nav.mobile-menu').hasClass('active')) {
                        $('body, html').outerHeight($('nav.mobile-menu').innerHeight());
                    } else {
                        $('body, html').outerHeight('auto');
                    }
                }, 400);
            });

            //TURN SUBMENU
            $('.general-menu').on('click', function () {
                $(this).toggleClass('active');
                setTimeout(function () {
                    $('body, html').outerHeight($('nav.mobile-menu').innerHeight());
                }, 500);
            });

            // ABRAKADABRA WITH FOOTER IF RESOLUTION IS LESS THEN 670
            $('.go-up__button').insertBefore($('.menu-footer'));
            $('.footer .container').append($('.go-up'));

            // MOVE DETAILED INFORMATION BOX IN PRODUCT PAGE WHEN RESOLUTION <= 670
            $('.detailed-info').insertBefore('.tabs');

            flag = true;
            //FIX PROBLEM MENU FOR IPHONE
            // var deviceAgent = navigator.userAgent.toLowerCase(),
            //     agentID = deviceAgent.match(/(iphone|ipod|ipad)/),
            //     mobileLink = $('header nav ul li a');
            // touchMenuEvent = agentID ? 'touchstart' : 'click';
            // mobileLink.on(touchMenuEvent, function(e) {
            //     document.location.href = $(this).attr('href');
            // });
        } else if ($(window).outerWidth() > 670 && flag == true) {

            // ABRAKADABRA WITH FOOTER IF RESOLUTION IS MORE THEN 670
            $('.go-up__button').insertBefore($('.create-mgn'));
            $('.go-up').insertBefore($('.footer .social'));

            // MOVE DETAILED INFORMATION BOX IN PRODUCT PAGE WHEN RESOLUTION > 670
            $('.detailed-info').insertAfter($('.general-content'));
        }
    }
    generalFunction();

    //BUTTON SCROLL TOP
    $('.go-up__button').on('click', function (e) {
        e.preventDefault();
        $('body, html').animate({ scrollTop: 0 }, "slow");
    });

    //ACCORDEON HTML VERSION
    $('.accordeon>strong').on('click', function () {
        $(this).next('.accordeon__items').slideToggle();
        $(this).parent('.accordeon').toggleClass('opened');
    });
    $('.button-filter').on('click', function () {
        $('.filter').slideToggle();
        $('.mfilter-box').slideToggle();
    });
    $('.mfilter-col-input').on('click', function () {
        $(this).toggleClass('checked');
        if ($(this).hasClass('checked')) {
            $(this).find('input').prop('checked', true);
        } else {
            $(this).find('input').prop('checked', false);
        }
    });

    //CUSTOM SELECTS AND INPUTS TYPE NUMBER
    $('select').styler();
    $('.coint-item input').styler();
    $('#num-item').styler();

    //CUSTOM SCROLLBAR
    $("#coincidence").customScrollbar({
        updateOnWindowResize: true,
        fixedThumbHeight: '16',
        wheelSpeed: 10
    });

    //DROP TABLE ITEMS
    $('.items-from-order h3').on('click', function () {
        $('.table-items').slideToggle();
    });

    //TABS
    $('ul.tabs__caption').on('click', 'li:not(.active)', function () {
        $(this).addClass('active').siblings().removeClass('active').closest('div.tabs').find('div.tabs__content').removeClass('active').eq($(this).index()).addClass('active');
    });

    //SHOW ALL COMMENTS
    $('.show-all-comment').on('click', function () {
        $('.one-comment.hidden').slideToggle();
    });

    // CHOOSE COLOR OF ITEM
    $('.some-colors label').on('click', function () {
        $(this).addClass('active').siblings().removeClass('active');
        $('.some-colors').find('input').prop('checked', false);
        $(this).find('input').prop('checked', true);
    });

    // HINT OF CHOOSE COLOR
    $('.some-colors label').hover(function () {
        var thisPosition = $(this).offset(),
            posBookmarkTop = thisPosition.top + $(this).outerHeight() + 10,
            posBookmarkLeft = thisPosition.left - $(this).find('.in-bookmark-top').outerWidth() / 2 + 16;
        $(this).find('.in-bookmark-top').css({ 'top': posBookmarkTop, 'left': posBookmarkLeft });
    });

    // HINT OF SHAPES
    $('.shapes__icon').on('mouseover', function () {
        var thisPosition = $(this).offset(),
            posBookmarkTop = thisPosition.top - $(this).outerHeight() - 7,
            posBookmarkLeft = thisPosition.left - $('.in-bookmark').innerWidth() / 2 + $(this).innerWidth() / 2 - 1;
        if (!$(this).parent().parent().hasClass('active')) {
            $('.in-bookmark').css({ 'top': posBookmarkTop, 'left': posBookmarkLeft });
            $('.in-bookmark').addClass('active');
        }
    });
    $('.shapes__icon').on('mouseout', function () {
        $('.in-bookmark').removeClass('active');
    });

    // CHANGE VALUE OF INPUT ADD CART FROM EVENT HOVER
    $('.choose-size .button-send').on('mouseover', function (e) {
        e.stopPropagation();
        $(this).val('заказать');
    });
    $('.choose-size .button-send').on('mouseout', function (e) {
        e.stopPropagation();
        $(this).val('добавить в корзину');
    });

    // HIDDEN SMALL SLIDER IF IMAGES LESS THEN 4
    if ($('.small-slider').find('.slide').length <= 3) {
        $('.small-slider').hide();
    }

    // GENERAL POPUP
    $(window).load(function () {

        $('.close-popup').on('click', function () {
            if ($(this).parent().hasClass('title-proposation')) {
                inspectOpenModal();
            } else if ($(this).parent().hasClass('title-popup-order')) {
                inspectOpenModal2();
            }
        });

        $('html, body').on('click', function (e) {
            e.stopPropagation();
            if ($(e.target).closest('.popup-gen').length || $(e.target).closest('.table-history .show a').length || $(e.target).closest('.popup').length) {
                return;
            }
            if ($('.popup__container').hasClass('active')) {
                inspectOpenModal();
                return;
            } else if ($('.popup__order__container').hasClass('active') && !$('.popup__container').hasClass('active')) {
                inspectOpenModal2();
            }
        });

        $(document).on('keyup', function (evt) {
            if (evt.keyCode == 27) {
                if ($('.popup__container').hasClass('active')) {
                    inspectOpenModal();
                    return;
                } else if ($('.popup__order__container').hasClass('active') && !$('.popup__container').hasClass('active')) {
                    inspectOpenModal2();
                }
            }
        });

        function inspectOpenModal() {
            if ($('.black-bg').hasClass('active') && $('.popup__container').hasClass('active')) {
                setTimeout(function () {
                    $('.black-bg').removeClass('active');
                    $('.popup__container').removeClass('active');
                }, 20);
            }
        }
        setTimeout(function () {
            $('.black-bg').addClass('active');
            $('.popup__container').addClass('active');
        }, 30000);
    });

    // ORDER POPUP
    $('.table-history .show a').on('click', function (e) {
        e.preventDefault();
        $('.black-bg2').addClass('active');
        $('.popup__order__container').addClass('active');
    });

    function inspectOpenModal2() {
        if ($('.black-bg2').hasClass('active') && $('.popup__order__container').hasClass('active')) {
            $('.black-bg2').removeClass('active');
            $('.popup__order__container').removeClass('active');
        }
    }

    // CHOOSE VARIANT'S DELIVERY
    $('.delivery').find('input[type="radio"]').on('change', function () {
        if ($(this).is(':checked')) {
            var thisRadio = $(this).attr('id'),
                divDelivery = $('.order div').filter('[data-id]'),
                thisDiv = $('.order').find($('div').filter('[data-id=' + thisRadio + ']'));
            cityAddr = $('.city-adress');
            divDelivery.not(thisDiv).hide();
            thisDiv.show();
            if (thisRadio != 'international') {
                $('#cash').next().show();
            } else {
                $('#cash').next().hide();
            }
        }
    });

    //AUTOCOMPLITE
    // массив строк
    var availableTags = ["Испанский", "Итальянский", "Английский", "Китайский", "Русский"];

    $('#autocomplite').autocomplete({
        source: availableTags,
        appendTo: '.header-center',
        autoFocus: true
    });

    //ZOOM PHOTO FROM PRODUCT GALLERY
    $(window).load(function () {

        $('.big-slider').find('img').on('click', function () {
            var src = $(this).attr('src');
            $("body").append("<div class='popup3'>" + "<div class='popup_bg3'></div>" + "<img src='" + src + "' class='popup_img' />" + "</div>");
            $(".popup3").fadeIn(500);
            $(".popup_bg3").on('click', function () {
                $(".popup3").fadeOut(500);
                setTimeout(function () {
                    $(".popup3").remove();
                }, 500);
            });
        });
    });
});