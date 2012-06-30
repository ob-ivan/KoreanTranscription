
/**
 * Превращает страницу с двумя видимыми формами в страничку с одной формой,
 * переключаемой табами между двумя режимами.
 *
 * Использует jQuery.
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
 *
 *  interface Korean
 *  {
 *      // Возвращает поле ввода для выбранного в настоящий момент режима.
 *      jQuery getActiveInput();
 *  }
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
        
        // public //
        {
            this.getActiveInput = function()
            {
                if (typeof inputCache[current_tab] === 'undefined')
                {
                    inputCache[current_tab] = $('div.' + current_tab + '.container .korean');
                }
                return inputCache[current_tab];
            };
        }
        
        // constructor //
        {
            // switch from noscript version
            $('h2').hide();
            tabs.show();
            
            // enable active tab
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
            
            // listen to events
            name_tab.click(setName);
            text_tab.click(setText);
            
            // TODO: Convert on client-side.
            // But mantain server-side converter too, for clients without JS.
        }
    };
})(jQuery);

