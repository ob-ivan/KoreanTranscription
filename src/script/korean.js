/**
 * Превращает страницу с двумя видимыми формами в страничку с одной формой, переключаемой табами между двумя режимами.
 *
 * Использует jQuery.
 *
 * Ожидает такой раскладки страницы:
 *  div.tabs
 *      div.name
 *      div.text
 *  h2.name
 *  div.name.container
 *  h2.text
 *  div.text.container
**/
function Korean (active_tab)
{
    var tabs = $('.tabs');
    var name_tab = tabs.find('.tab.name');
    var text_tab = tabs.find('.tab.text');
    var name_container = $('.name.container');
    var text_container = $('.text.container');
    
    function setName()
    {
        name_tab.addClass('active');
        name_container.show();
        text_tab.removeClass('active');
        text_container.hide();
    };
    
    function setText()
    {
        text_tab.addClass('active');
        text_container.show();
        name_tab.removeClass('active');
        name_container.hide();
    };
    
    $('h2').hide();
    tabs.show();
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
    
    name_tab.click(setName);
    text_tab.click(setText);
}
