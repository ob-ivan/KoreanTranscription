
/**
 * Превращает страницу с двумя видимыми формами в страничку с одной формой,
 * переключаемой табами между двумя режимами.
 *
 * Использует jQuery, jQuery.fn.hangulEntry.
 *
 * Ожидает такой раскладки страницы:
 *  div.tabs
 *      div.name
 *      div.text
 *  h2.name
 *  div.name.container
 *      input.korean
 *  h2.text
 *  div.text.container
 *      textarea.korean
**/
var Korean = (function($)
{
    return function Korean (active_tab)
    {
        // var //
        {
            var tabs = $('.tabs'),
                name_tab = tabs.find('.tab.name'),
                text_tab = tabs.find('.tab.text'),
                name_container = $('.name.container'),
                text_container = $('.text.container'),
                name_input = name_container.find('.korean'),
                text_input = text_container.find('.korean'),
                current_tab = null
            ;
            var inputCache = {};
        }
        
        // private //
        {
            var setName = function setName()
            {
                name_tab.addClass('active');
                name_container.show();
                text_tab.removeClass('active');
                text_container.hide();
                current_tab = 'name';
            };
            
            var setText = function setText()
            {
                text_tab.addClass('active');
                text_container.show();
                name_tab.removeClass('active');
                name_container.hide();
                current_tab = 'text';
            };
        }
        
        // constructor //
        {
            // Switch from noscript version.
            $('h2').hide();
            tabs.show();
            
            // Enable active tab.
            if (active_tab)
            {
                if (active_tab == 'name')
                {
                    setName();
                }
                else if (active_tab == 'text')
                {
                    setText();
                }
            }
            
            // Listen to tab switching.
            name_tab.click(setName);
            text_tab.click(setText);
            
            // Activate virtual keyboard for inputs.
            if ($.fn.hangulEntry)
            {
                name_input.hangulEntry().init();
                text_input.hangulEntry().init();
            }
            
            // TODO: Convert on client-side.
            // But mantain server-side converter too, for clients without JS.
        }
    };
})(jQuery);

