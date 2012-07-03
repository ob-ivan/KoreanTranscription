
/**
 * Adds jQuery.addPlugin method.
 *
 *  void addPlugin (string name, object options, object methods);
 *
 * Usage:
 *  $.addPlugin ('alice', { useCache : true }, { length : function (prefix) { alert (prefix + this.length); } });
 *  $('body').alice().bob(5); // alerts 6
**/
jQuery.addPlugin = (function ($)
{
    // const //
    {
        var defaultOptions = {
            useCache : false
        };
    }
    
    // private //
    {
        var bind = function bind (object, method)
        {
            var bound = function bound ()
            {
                return method.apply (object, Array.prototype.slice.call (arguments));
            };
            var string = method.toString();
            bound.toString = function toString ()
            {
                return string;
            };
            return bound;
        };
        
        var bindAll = function bindAll (object, methods)
        {
            var bound = {};
            for (var property in methods)
            {
                if (! methods.hasOwnProperty (property))
                {
                    continue;
                };
                bound[property] = bind (object, methods[property]);
            };
            return bound;
        };
    }
    
    // body //
    return function addPlugin (name, options, methods)
    {
        options = $.extend (defaultOptions, options);
        
        $.fn[name] = (function ()
        {
            var cache = [];
            
            return function plugin ()
            {
                if (options.useCache)
                {
                    for (var key = 0; key < cache.length; ++key)
                    {
                        if (cache[key].object === this)
                        {
                            return cache[key].methods;
                        }
                    }
                }
                
                var bound = bindAll (this, methods);
                
                if (options.useCache)
                {
                    cache.push ({
                        object  : this,
                        methods : bound
                    });
                }
                
                return bound;
            };
        })();
    };
}(jQuery));

