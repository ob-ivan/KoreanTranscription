
/**
 * Создаёт экранную клавиатуру для побуквенного ввода корейских слогов.
 * Результат набора вставляется в элемент, возвращаемый korean.getActiveInput.
 *
 * Использует jQuery, korean.js.
 *
 * Ожидаемая раскладка:
 *  div.entry
 *      span.result
 *      div.keyboard
**/
var HangulEntry = (function($)
{
    return function HangulEntry (korean)
    {
        // init //
        {
            if (typeof Korean == 'undefined')
            {
                throw new ReferenceError ('Class Korean is not defined');
            }
            if (! korean instanceof Korean)
            {
                throw new TypeError ('Argument must be an instance of class Korean');
            }
        }
        
        // var //
        {
            var entry = $('div.entry'),
                result = entry.find('span.result'),
                keyboard = entry.find('div.keyboard');
        }
        
        // private //
        {
            var spawnKeys = function spawnKeys()
            {
                var layout = [
                    ['~capture~', '~glue~', '~backspace~'],
                    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
                    ['~glue~', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '~glue~'],
                    ['~shift~', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '~shift~'],
                    ['~glue~', '~space~', '~glue~']
                ];
                for (var lineNum = 0, lineCount = layout.length; lineNum < lineCount; ++lineNum)
                {
                    var line = $('<div style="clear:both"></div>');
                    for (var keyNum = 0, keyCount = layout[lineNum].length; keyNum < keyCount; ++keyNum)
                    {
                        var key = $('<div style="float:left">' + layout[lineNum][keyNum] + '</div>');
                        line.append(key);
                    }
                    keyboard.append (line);
                }
            }
        }
        
        // constructor //
        {
            spawnKeys();
            entry.show();
        }
    };
    
})(jQuery);
