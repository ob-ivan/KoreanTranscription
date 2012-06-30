

var AddPlugin = (function ($)
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
    
    return function (name, methods)
    {
        $.fn[name] = (function ()
        {
            var registry = [];
            
            return function plugin ()
            {
                for (var key = 0; key < registry.length; ++key)
                {
                    if (registry[key].object === this)
                    {
                        return registry[key].methods;
                    }
                }
                
                var bound = bindAll (this, methods);
                registry.push ({
                    object  : this,
                    methods : bound
                });
                return bound;
            };
        })();
    }
    
}(jQuery));

