
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
        var UnicodeSyllableStart = 44032;
        var UnicodeFirstStep = 588; // = vowelCount * vowelStep
        var UnicodeVowelStep = 28;  // = lastCount
        var UnicodeLastStep  = 1;
        
        /**
         * map keyboard keys to name
        **/
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
    
    // private //
    {
        /**
         *  interface Jamo
         *  {
         *      integer? first;
         *      integer? vowel;
         *      integer? last;
         *      string   hangul;
         *      string?  cyril;
         *
         *      boolean Jamo::exists (string name);
         *      Jamo    Jamo::get    (string name);
         *  }
        **/
        var Jamo = (function()
        {
            // const //
            {
                /**
                 *  {
                 *      <name> : {
                 *          [first : <offset>,]
                 *          [vowel : <offset>,]
                 *          [last  : <offset>,]
                 *          hangul : <...>,
                 *          [cyril : <...>,]
                 *      },
                 *      ...
                 *  }
                **/
                var JamoInfo = {
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
            }
            
            // constructor //
            var Jamo = function Jamo (name)
            {
                if (! name in JamoInfo)
                {
                    throw new Error ('Jamo: name = "' + name + '", not in JamoInfo');
                }
                
                this.name = name;
                for (var property in JamoInfo[name])
                {
                    if (! JamoInfo[name].hasOwnProperty(property))
                    {
                        continue;
                    }
                    this[property] = JamoInfo[name][property];
                }
            };
            
            // static var //
            {
                var registry = {};
            }
            
            // static public //
            {
                Jamo.exists = function exists (name)
                {
                    return typeof JamoInfo[name] !== 'undefined';
                };
                
                Jamo.get = function get (name)
                {
                    if (typeof registry[name] === 'undefined')
                    {
                        registry[name] = new Jamo (name);
                    }
                    return registry[name];
                };
            }
            
            return Jamo;
        })();
    
        var Syllable = function Syllable (previous)
        {
            // init //
            {
                if (! this instanceof Syllable)
                {
                    return new Syllable (previous);
                }
                
                if (previous)
                {
                    if (! previous instanceof Syllable)
                    {
                        throw new TypeError ('Syllable: previous must be instance of Syllable');
                    }
                }
            }
            
            // const //
            {
                var PART_FIRST = 1;
                var PART_VOWEL = 2;
                var PART_LAST  = 3;
            }
            
            // var //
            {
                /**
                 *  {
                 *      <PART_FIRST> : [Jamo, Jamo],
                 *      <PART_VOWEL> : [Jamo, Jamo],
                 *      <PART_LAST>  : [Jamo, Jamo]
                 *  }
                **/
                var queue = {};
                var prevSyllable, // instanceof Syllable
                    nextSyllable; // instanceof Syllable
                
                /**
                 *  {
                 *      <PART_FIRST> : Jamo,
                 *      <PART_VOWEL> : Jamo,
                 *      <PART_LAST>  : Jamo
                 *  }
                **/
                var compiled = {};
                var hangul = ''; // string
            }
            
            // private //
            {
                var makeHangul = function makeHangul()
                {
                    if (compiled[PART_FIRST])
                    {
                        if (compiled[PART_VOWEL])
                        {
                            // assert: a syllable.
                            var code =
                                UnicodeSyllableStart +
                                compiled[PART_FIRST].first * UnicodeFirstStep +
                                compiled[PART_VOWEL].vowel * UnicodeVowelStep
                            ;
                            if (compiled[PART_LAST])
                            {
                                code += compiled[PART_LAST].last;
                            }
                            hangul = String.fromCharCode (code);
                        }
                        else
                        {
                            // assert: a single first.
                            hangul = compiled[PART_FIRST].hangul;
                        }
                    }
                    else if (compiled[PART_VOWEL])
                    {
                        // assert: a single vowel
                        hangul = compiled[PART_VOWEL].hangul;
                    }
                    else
                    {
                        hangul = '';
                    }
                };
            
                var compilePart = function compilePart (part)
                {
                    if (! (part === PART_FIRST || part === PART_VOWEL || part === PART_LAST))
                    {
                        throw new Error ('Syllable.compilePart: part must be one of PART_FIRST, PART_VOWEL, PART_LAST');
                    }
                    
                    if (queue[part].length > 1)
                    {
                        var compiledName = queue[part][0].name + queue[part][1].name;
                        if (! Jamo.exists (compiledName))
                        {
                            throw new Error ('Syllable/compileLast: compiledName does not exist in Jamo');
                        }
                        compiled[part] = Jamo.get (compiledName);
                    }
                    else if (queue[part].length > 0)
                    {
                        compiled[part] = queue[part][0];
                    }
                    else
                    {
                        compiled[part] = null;
                    }
                    makeHangul();
                };
            }
            
            // public //
            {
                /**
                 *  @param  {Jamo}      jamo
                 *  @return {Syllable}          reference to the new tail.
                **/
                this.append = function append (jamo)
                {
                    if (! jamo instanceof Jamo)
                    {
                        throw new TypeError ('Syllable.append: jamo must be instance of Jamo');
                    }
                    if (nextSyllable)
                    {
                        return nextSyllable.append (jamo);
                    }
                    
                    if (typeof jamo.vowel !== 'undefined')
                    {
                        // assert: jamo is a vowel.
                        if (queue[PART_LAST].length > 0)
                        {
                            // Detach last.
                            var nextFirst = queue[PART_LAST].pop();
                            compilePart (PART_LAST);
                            
                            if (typeof nextFirst.first === 'undefined')
                            {
                                throw new Error ('Syllable.append: nextFirst.first is undefined');
                            }
                            
                            // Compose next.
                            nextSyllable = new Syllable (this);
                            nextSyllable.append (nextFirst);
                            return nextSyllable.append (jamo);
                        }
                        else if (queue[PART_VOWEL].length > 1)
                        {
                            // No place for jamo. Compose next.
                            nextSyllable = new Syllable (this);
                            return nextSyllable.append (jamo);
                        }
                        else if (queue[PART_VOWEL].length > 0)
                        {
                            // jamo either can be combined with vowel or not.
                            var combinedName = queue[PART_VOWEL][0].name + jamo.name;
                            if (Jamo.exists (combinedName))
                            {
                                // combinable.
                                queue[PART_VOWEL].push (jamo);
                                compilePart (PART_VOWEL);
                                return this;
                            }
                            else
                            {
                                // Not combinable. Compose next.
                                nextSyllable = new Syllable (this);
                                return nextSyllable.append (jamo);
                            }
                        }
                        else
                        {
                            // assert: no vowel in the current syllable.
                            if (queue[PART_FIRST].length > 1)
                            {
                                // first either can start a syllable or not.
                                if (typeof compiled[PART_FIRST].first !== 'undefined')
                                {
                                    // first can start a syllable. add vowel.
                                    queue[PART_VOWEL].push (jamo);
                                    compilePart (PART_VOWEL);
                                    return this;
                                }
                                else
                                {
                                    // first cannot start a syllable. detach one.
                                    var nextFirst = queue[PART_FIRST].pop();
                                    compilePart (PART_FIRST);
                                    
                                    if (typeof nextFirst.first === 'undefined')
                                    {
                                        throw new Error ('Syllable.append: nextFirst.first is undefined');
                                    }
                                    
                                    // Compose next.
                                    nextSyllable = new Syllable (this);
                                    nextSyllable.append (nextFirst);
                                    return nextSyllable.append (jamo);
                                }
                            }
                            else
                            {
                                queue[PART_VOWEL].push (jamo);
                                compilePart (PART_VOWEL);
                                return this;
                            }
                        }
                    }
                    else
                    {
                        // jamo is a consonant.
                        if (queue[PART_LAST].length > 1)
                        {
                            // No place for consonant. Compose next.
                            nextSyllable = new Syllable (this);
                            return nextSyllable.append (jamo);
                        }
                        else if (queue[PART_LAST].length > 0)
                        {
                            // jamo either can be combined with last or not.
                            var combinedName = queue[PART_LAST][0].name + jamo.name;
                            if (Jamo.exists (combinedName))
                            {
                                // combinable.
                                queue[PART_LAST].push (jamo);
                                compilePart (PART_LAST);
                                return this;
                            }
                            else
                            {
                                // Not combinable. Compose next.
                                nextSyllable = new Syllable (this);
                                return nextSyllable.append (jamo);
                            }
                        }
                        else if (queue[PART_VOWEL].length > 0)
                        {
                            // vowel is either single or in a syllable.
                            if (queue[PART_FIRST].length > 0)
                            {
                                // A syllable. jamo either can be last or not.
                                if (typeof jamo.last !== 'undefined')
                                {
                                    // Append as last.
                                    queue[PART_LAST].push (jamo);
                                    compilePart (PART_LAST);
                                    return this;
                                }
                                else
                                {
                                    // Not appendable. Compose next.
                                    nextSyllable = new Syllable (this);
                                    return nextSyllable.append (jamo);
                                }
                            }
                            else
                            {
                                // A single vowel. Compose next.
                                nextSyllable = new Syllable (this);
                                return nextSyllable.append (jamo);
                            }
                        }
                        else if (queue[PART_FIRST].length > 0)
                        {
                            // jamo either can be combined with first or not.
                            var combinedName = queue[PART_FIRST][0].name + jamo.name;
                            if (Jamo.exists (combinedName))
                            {
                                // combinable.
                                queue[PART_FIRST].push (jamo);
                                compilePart (PART_FIRST);
                                return this;
                            }
                            else
                            {
                                // Not combinable. Compose next.
                                nextSyllable = new Syllable (this);
                                return nextSyllable.append (jamo);
                            }
                        }
                        else
                        {
                            // assert: current syllable is empty.
                            if (typeof jamo.first === 'undefined')
                            {
                                throw new Error ('Syllable.append: jamo.first is undefined');
                            }
                            queue[PART_FIRST].push (jamo);
                            compilePart (PART_FIRST);
                            return this;
                        }
                    }
                };
                
                this.toString = function toString()
                {
                    return hangul;
                };
            
                this.getNext = function getNext()
                {
                    return nextSyllable;
                };
            }
        
            // constructor //
            {
                prevSyllable = previous;
                
                queue[PART_FIRST] = [];
                queue[PART_VOWEL] = [];
                queue[PART_LAST]  = [];
                
                compiled[PART_FIRST] = null;
                compiled[PART_VOWEL] = null;
                compiled[PART_LAST]  = null;
            }
        };
        
        var SyllableChain = function SyllableChain()
        {
            // var //
            {
                var head, // instanceof Syllable
                    tail; // instanceof Syllable
                var hangul = '';
            }
            
            // private //
            {
                var makeHangul = function makeHangul()
                {
                    var result = '';
                    if (head)
                    {
                        for (var syllable = head; syllable; syllable = syllable.getNext())
                        {
                            result += syllable;
                        }
                    }
                    return result;
                };
            }
            
            // public //
            {
                this.append = function append (jamo)
                {
                    if (! jamo instanceof Jamo)
                    {
                        throw new TypeError ('SyllableChain.append: jamo must be instance of Jamo');
                    }
                    
                    if (! head)
                    {
                        head = tail = new Syllable;
                    }
                    tail = tail.append (jamo);
                    hangul = makeHangul();
                };
                
                // TODO: this.deleteJamo
                // TODO: this.deleteSyllable
                
                this.toString = function toString()
                {
                    return hangul;
                }
            }
        };
    }
                
    return function HangulEntry (korean)
    {
        // init //
        {
            if (typeof Korean === 'undefined')
            {
                throw new ReferenceError ('HangulEntry: Korean is undefined');
            }
            if (! korean instanceof Korean)
            {
                throw new TypeError ('HangulEntry: korean must be instance of Korean');
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
            var syllableChain = new SyllableChain;
        }
        
        // private //
        {
            var spawnTab = (function()
            {
                // private //
                {
                    var redrawQueue = function redrawQueue()
                    {
                        var text = syllableChain.toString();
                        
                        // TODO: Заменить результат вместо предыдущего, если он ещё выделен.
                        // И вообще разобраться с тем, как это всё должно происходить.
                        
                        // DEBUG
                        var input = korean.getActiveInput();
                        input.val (text);
                    };
                    
                    var addJamo = function addJamo (jamo)
                    {
                        syllableChain.append (jamo);
                        redrawQueue();
                    };
                    
                    // backspace
                    var deleteJamo = function deleteJamo()
                    {
                        syllableChain.deleteJamo();
                        redrawQueue();
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
                        
                        // TODO: Если был нажат "экранный шифт", после нажатия следующей кнопки
                        // кнопки надо сбросить на нижний регистр. Если клавиатурный -- то оставить.
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
                    
                    // TODO: spacebar
                    
                    var getJamoClick = function getJamoClick (jamo)
                    {
                        return function ()
                        {
                            addJamo (jamo);
                        };
                    }
                    
                    var getSpecialClick = function getSpecialClick (key)
                    {
                        if (key === 'backspace')
                        {
                            return deleteJamo;
                        }
                        if (key === 'BACKSPACE')
                        {
                            return deleteSyllable;
                        }
                        if (key === 'shift')
                        {
                            return showUpperTab;
                        }
                        if (key === 'SHIFT')
                        {
                            return showLowerTab;
                        }
                        // TODO: spacebar
                    };
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
                            
                            var name = layoutVariant[lineNum][key];
                            var inner = '';
                            var click = false;
                            if (Jamo.exists (name))
                            {
                                // jamo
                                var jamo = Jamo.get (name);
                                click = getJamoClick (jamo);
                                inner =
                                    '<table class="key">' +
                                        '<tr>' +
                                            '<td align="center">' + key + '</td>' +
                                            '<td align="center">' + jamo.hangul + '</td>' +
                                        '</tr>' +
                                        '<tr>' +
                                            '<td></td>' +
                                            '<td align="center">' + jamo.cyril + '</td>' +
                                        '</tr>' +
                                    '</table>'
                                ;
                            }
                            else
                            {
                                // specials
                                inner = '<table class="key special"><tr><td>' + name + ' ' + key + '</td></tr></table>';
                                click = getSpecialClick (key);
                            }
                            
                            var keyDiv = $(inner);
                            keyDiv.click (click);
                            // TODO: handle keydown event
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
