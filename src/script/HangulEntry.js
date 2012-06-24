
/**
 * Создаёт экранную клавиатуру для побуквенного ввода корейских слогов.
 * Результат набора вставляется в элемент, возвращаемый korean.getActiveInput.
 *
 * Использует jQuery, korean.js.
 *
 * Ожидаемая раскладка:
 *  div.entry
 *      div.keyboard
 *
 *  interface HangulEntry
 *  {
 *      HangulEntry (Korean korean);
 *  }
 *
 *  interface Korean
 *  {
 *      // Возвращает поле ввода для выбранного в настоящий момент режима.
 *      jQuery getActiveInput();
 *  }
**/
var HangulEntry = (function ($)
{
    // const //
    {
        var SyllableStart = 44032;
        var firstStep = 588; // = vowelCount * vowelStep
        var vowelStep = 28;  // = lastCount
        var lastStep  = 1;
        
        var JamoInfo = {
            ''  : {             last :  0                },
            G   : { first :  0, last :  1, hangul : 'ㄱ', cyril : 'г'   },
            GG  : { first :  1, last :  2, hangul : 'ㄲ', cyril : 'кк'  },
            GS  : {             last :  3, hangul : 'ㄳ' },
            N   : { first :  2, last :  4, hangul : 'ㄴ', cyril : 'н'   },
            NJ  : {             last :  5, hangul : 'ㄵ' },
            NH  : {             last :  6, hangul : 'ㄶ' },
            D   : { first :  3, last :  7, hangul : 'ㄷ', cyril : 'д'   },
            DD  : { first :  4,            hangul : 'ㄸ', cyril : 'тт'  },
            R   : { first :  5, last :  8, hangul : 'ㄹ', cyril : 'р/л' },
            RG  : {             last :  9, hangul : 'ㄺ' },
            RM  : {             last : 10, hangul : 'ㄻ' },
            RB  : {             last : 11, hangul : 'ㄼ' },
            RS  : {             last : 12, hangul : 'ㄽ' },
            RTh : {             last : 13, hangul : 'ㄾ' },
            RPh : {             last : 14, hangul : 'ㄿ' },
            RH  : {             last : 15, hangul : 'ㅀ' },
            M   : { first :  6, last : 16, hangul : 'ㅁ', cyril : 'м'    },
            B   : { first :  7, last : 17, hangul : 'ㅂ', cyril : 'б'    },
            BB  : { first :  8,            hangul : 'ㅃ', cyril : 'пп'   },
            BS  : {             last : 18, hangul : 'ㅄ' },
            S   : { first :  9, last : 19, hangul : 'ㅅ', cyril : 'с'    },
            SS  : { first : 10, last : 20, hangul : 'ㅆ', cyril : 'сс'   },
            Ng  : { first : 11, last : 21, hangul : 'ㅇ', cyril : '-/нъ' },
            J   : { first : 12, last : 22, hangul : 'ㅈ', cyril : 'дж'   },
            JJ  : { first : 13,            hangul : 'ㅉ', cyril : 'чч'   },
            Ch  : { first : 14, last : 23, hangul : 'ㅊ', cyril : 'чх'   },
            Kh  : { first : 15, last : 24, hangul : 'ㅋ', cyril : 'кх'   },
            Th  : { first : 16, last : 25, hangul : 'ㅌ', cyril : 'тх'   },
            Ph  : { first : 17, last : 26, hangul : 'ㅍ', cyril : 'пх'   },
            H   : { first : 18, last : 27, hangul : 'ㅎ', cyril : 'х'    },
            
            A   : { vowel :  0,            hangul : 'ㅏ', cyril : 'а'  }, 
            Ae  : { vowel :  1,            hangul : 'ㅐ', cyril : 'э'  }, 
            Ya  : { vowel :  2,            hangul : 'ㅑ', cyril : 'я'  }, 
            Yae : { vowel :  3,            hangul : 'ㅒ', cyril : 'йэ' },
            Eo  : { vowel :  4,            hangul : 'ㅓ', cyril : 'ô'  }, 
            E   : { vowel :  5,            hangul : 'ㅔ', cyril : 'е'  },
            Yeo : { vowel :  6,            hangul : 'ㅕ', cyril : 'йô' },
            Ye  : { vowel :  7,            hangul : 'ㅖ', cyril : 'йе' },
            O   : { vowel :  8,            hangul : 'ㅗ', cyril : 'о'  },
            OA  : { vowel :  9,            hangul : 'ㅘ' },
            OAe : { vowel : 10,            hangul : 'ㅙ' },
            OI  : { vowel : 11,            hangul : 'ㅚ' },
            Yo  : { vowel : 12,            hangul : 'ㅛ', cyril : 'ё' },
            U   : { vowel : 13,            hangul : 'ㅜ', cyril : 'у' },
            UEo : { vowel : 14,            hangul : 'ㅝ' },
            UE  : { vowel : 15,            hangul : 'ㅞ' },
            UI  : { vowel : 16,            hangul : 'ㅟ' },
            Yu  : { vowel : 17,            hangul : 'ㅠ', cyril : 'ю' },
            Eu  : { vowel : 18,            hangul : 'ㅡ', cyril : 'ы' },
            EuI : { vowel : 19,            hangul : 'ㅢ' },
            I   : { vowel : 20,            hangul : 'ㅣ', cyril : 'и' }
            
            // TODO: dot vowel
        };
        
        var layout = [
            { q : 'B',  w : 'J',  e : 'D',  r : 'G',  t : 'S',  y : 'Yo', u : 'Yeo', i : 'Ya', o : 'Ae', p : 'E', backspace : '&larr;' },
            { a : 'M',  s : 'N',  d : 'Ng', f : 'R',  g : 'H',  h : 'O',  j : 'Eo',  k : 'A',  l : 'I',           shift     : '&uarr;' },
            { z : 'Kh', x : 'Th', c : 'Ch', v : 'Ph', b : 'Yu', n : 'U',  m : 'Eu',                               space     : '_'      }
        ];
        
        var LAYOUT = [
            { Q : 'BB', W : 'JJ', E : 'DD', R : 'GG', T : 'SS', Y : 'Yo', U : 'Yeo', I : 'Ya', O : 'Yae', P : 'Ye', BACKSPACE : '&larr;' },
            { A : 'M',  S : 'N',  D : 'Ng', F : 'R',  G : 'H',  H : 'O',  J : 'Eo',  K : 'A',  L : 'I',             SHIFT     : '&uarr;' },
            { Z : 'Kh', X : 'Th', C : 'Ch', V : 'Ph', B : 'Yu', N : 'U',  M : 'Eu',                                 SPACE     : '_'      }
        ];
    }
                
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
            // elements //
            var entry    = $('div.entry');
            var keyboard = entry.find('div.keyboard');
            
            // lowercase tab and uppercase tab
            var lowerTab = $('<div class="lower case"></div>');
            var upperTab = $('<div class="upper case"></div>');
            var currentTab = lowerTab;
            
            // input //
            var jamoQueue = [];
        }
        
        // private //
        {
            var spawnTab = (function()
            {
                // private //
                {
                    var redrawQueue = function redrawQueue()
                    {
                        // TODO
                    };
                    
                    var addJamo = function addJamo (jamo)
                    {
                        jamoQueue.push (jamo);
                        redrawQueue();
                    };
                    
                    // backspace
                    var deleteJamo = function deleteJamo()
                    {
                        if (jamoQueue.length > 0)
                        {
                            jamoQueue.pop();
                            redrawQueue();
                        }
                    };
                    
                    // BACKSPACE
                    var deleteSyllable = function deleteSyllable()
                    {
                        // TODO
                    };
                    
                    // shift
                    var showUpperTab = function showUpperTab()
                    {
                        if (currentTab === upperTab)
                        {
                            return;
                        }
                        currentTab.hide();
                        currentTab = upperTab;
                        currentTab.show();
                    };
                    
                    // SHIFT
                    var showLowerTab = function showLowerTab()
                    {
                        if (currentTab === lowerTab)
                        {
                            return;
                        }
                        currentTab.hide();
                        currentTab = lowerTab;
                        currentTab.show();
                    };
                    
                    // TODO: space
                }
                
                // body //
                return function spawnTab (layoutVariant, caseTab)
                {
                    for (var lineNum = 0, lineCount = layoutVariant.length; lineNum < lineCount; ++lineNum)
                    {
                        var lineDiv = $('<div class="line line' + lineNum  + '"></div>');
                        for (var key in layoutVariant[lineNum])
                        {
                            if (! layoutVariant[lineNum].hasOwnProperty (key))
                            {
                                continue;
                            }
                            
                            var jamo = layoutVariant[lineNum][key];
                            var inner = '';
                            var click = false;
                            if (jamo in JamoInfo)
                            {
                                // jamo
                                inner = '<table class="key">' +
                                    '<tr>' +
                                        '<td align="center">' + key + '</td>' +
                                        '<td align="center">' + JamoInfo[jamo].hangul + '</td>' +
                                    '</tr>' +
                                    '<tr>' +
                                        '<td></td>' +
                                        '<td align="center">' + JamoInfo[jamo].cyril + '</td>' +
                                    '</tr>' +
                                '</table>';
                                click = function ()
                                {
                                    addJamo (jamo);
                                };
                                // TODO: keydown
                            }
                            else
                            {
                                // specials
                                inner = '<table class="key special"><tr><td>' + jamo + ' ' + key + '</td></tr></table>';
                                
                                if (key === 'backspace')
                                {
                                    click = deleteJamo;
                                }
                                else if (key === 'BACKSPACE')
                                {
                                    click = deleteSyllable;
                                }
                                else if (key === 'shift')
                                {
                                    click = showUpperTab;
                                }
                                else if (key === 'SHIFT')
                                {
                                    click = showLowerTab;
                                }
                                // TODO: click space.
                                // TODO: keydown
                            }
                            var keyDiv = $(inner);
                            
                            // TODO: сделать один общий онклик, чтобы сэкономить память на колбэках.
                            if (click)
                            {
                                keyDiv.click (click);
                            }
                            
                            lineDiv.append (keyDiv);
                        }
                        caseTab.append (lineDiv);
                    }
                    keyboard.append (caseTab);
                };
            })();
        }
        
        // constructor //
        {
            spawnTab (layout, lowerTab);
            spawnTab (LAYOUT, upperTab);
            currentTab.show();
            entry.show();
        }
    };
    
})(jQuery);

