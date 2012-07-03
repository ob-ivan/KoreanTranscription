
/**
 * Operations with text selection in input fields.
 *
 * Requires jQuery, jQuery.addPlugin.
 *
 * Credits go to user357565 and Fèlix Galindo Allué at stackoverflow.
 *
 *  interface Selection
 *  {
 *      integer start;
 *      integer end;
 *      integer length;
 *      string  text;
 *      boolean isEqual (Selection selection);
 *  }
 *
 *  interface jQuery.fn.selection
 *  {
 *      Selection   get();
 *      Selection   set (integer start, integer end);
 *      Selection   replace (string string);
 *      Selection   wrap (string left, string right, integer offset, integer length);
 *  }
**/
jQuery.addPlugin ('selection', null, (function ()
{
    // private //
    var Selection = function Selection (start, end, length, text)
    {
        this.start  = start;
        this.end    = end;
        this.length = length;
        this.text   = text;
        
        this.isEqual = function isEqual (selection)
        {
            if (! selection instanceof Selection)
            {
                throw new TypeError ('Selection.isEqual: selection must be an instance of Selection');
            };
            
            if (selection.start     === start &&
                selection.end       === end &&
                selection.length    === length &&
                selection.text      === text
            ) {
                return true;
            }
            return false;
        };
    };
    
    // methods //
    return {
        get : function get () 
        {
            var e = this.get (0);
            
            // Mozilla and DOM 3.0
            if ('selectionStart' in e)
            {
                var l = e.selectionEnd - e.selectionStart;
                return new Selection (
                    e.selectionStart,
                    e.selectionEnd,
                    l,
                    e.value.substr (e.selectionStart, l)
                );
            }
            
            // IE
            if (document.selection)
            {
                e.focus();
                var r = document.selection.createRange();
                var tr = e.createTextRange();
                var tr2 = tr.duplicate();
                tr2.moveToBookmark(r.getBookmark());
                tr.setEndPoint('EndToStart',tr2);
                
                if (r == null || tr == null)
                {
                    return new Selection (e.value.length, e.value.length, 0, '');
                }
                
                // For some reason IE doesn't always count the \n and \r in length
                var text_part = r.text.replace(/[\r\n]/g,'.');
                var text_whole = e.value.replace(/[\r\n]/g,'.');
                var the_start = text_whole.indexOf(text_part,tr.text.length);
                return new Selection (the_start, the_start + text_part.length, text_part.length, r.text);
            }
            
            // Browser not supported
            return new Selection (e.value.length, e.value.length, 0, '');
        },

        set : function set (start, end)
        {
            var e = this.get(0);
            
            // Mozilla and DOM 3.0
            if ('selectionStart' in e) 
            {
                e.focus();
                e.selectionStart = start;
                e.selectionEnd = end;
            }
            // IE
            else if (document.selection)
            {
                e.focus();
                var tr = e.createTextRange();

                // Fix IE from counting the newline characters as two seperate characters
                for (var i = 0, stop_it = start; i < stop_it; i++)
                {
                    if (e.value[i].search(/[\r\n]/) != -1)
                    {
                        start -= 0.5;
                    }
                }
                ;
                for (var i = 0, stop_it = end; i < stop_it; i++)
                {
                    if (e.value[i].search(/[\r\n]/) != -1)
                    {
                        end -= 0.5;
                    }
                }

                tr.moveEnd('textedit',-1);
                tr.moveStart('character', start);
                tr.moveEnd('character', end - start);
                tr.select();
            }
            
            return this.selection().get();
        },

        replace : function replace (string)
        {
            var e = this.get(0);
            var selection = this.selection().get();
            var start = selection.start;
            var end = start + string.length;
            e.value = e.value.substr (0, start) + string + e.value.substr (selection.end, e.value.length);
            this.selection().set (start, end);
            return new Selection (start, end, string.length, string);
        },

        /**
         *  @param  {string}    left    text to insert before selection.
         *  @param  {string}    right   text to insert after selection.
         *  @param  {integer?}  offset  | which part of new selection should be
         *  @param  {integer?}  length  | selected after the operation.
        **/
        wrap : function wrap (left, right, offset, length)
        {
            var text = this.selection().get().text;
            var selection = this.selection().replace (left + text + right);
            var start = selection.start;
            
            if (typeof offset !== 'undefined' && typeof length !== 'undefined')
            {
                selection = this.selection().set (start + offset, start + offset + length);
            }
            else if (text === '') 
            {
                selection = this.selection().set (start + left.length, start + left.length);
            }
            return selection;
        }
    };
})());

