<?php
namespace Ob_Ivan\KoreanTranscription;

class Convert
{
    const MODE_NAME = 0;
    const MODE_TEXT = 1;

    const STRING_KEY_CODE = 0;
    const STRING_KEY_JAMO = 1;

    const SYLLABLE_KEY_LAT = 0;
    const SYLLABLE_KEY_RUS = 1;

    const KOREAN_ENCODING = 'UCS-2BE';
    const OUTPUT_ENCODING = 'UTF-8';

    static protected $jamo = array (
        1 => array ('g', 'gg', 'n', 'd', 'dd', 'r', 'm', 'b', 'bb', 's', 'ss', '', 'j', 'jj', 'ch', 'kh', 'th', 'ph', 'h'),
        2 => array (
            'a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oi', 'yo', 'u', 'wo', 'we', 'wi',
            'yu', 'eu', 'ui', 'i'
        ),
        3 => array (
            '', 'g', 'gg', 'gs', 'n', 'nj', 'nh', 'd', 'r', 'rg', 'rm', 'rb', 'rs', 'rth', 'rph', 'rh', 'm', 'b',
            'bs', 's', 'ss', 'ng', 'j', 'ch', 'kh', 'th', 'ph', 'h'
        ),
    );

    protected $rus = '';
    protected $lat = '';

    /**
     * @param string  $text utf-8 encoded korean string
     * @param integer $mode MODE_NAME for name conversion, MODE_TEXT for text conversion
    **/
    public function __construct ($text, $mode)
    {
        $text = iconv (self::OUTPUT_ENCODING, self::KOREAN_ENCODING, $text);
        switch ($mode)
        {
            case self::MODE_NAME: $this->name($text); break;
            case self::MODE_TEXT: $this->text($text); break;
        }
    }

    public function __get($name)
    {
        if ($name == 'rus' || $name == 'lat')
        {
            return $this->$name;
        }
        throw new Exception ('Property get access is denied: ' . __CLASS__ . '::' . $name);
    }

    protected function text($text)
    {
        $string = self::makeStringArray($text);
        $rus = $lat = '';

        for (
            $l = count($string), $o = null, $c = $string[$i = 0];
            $i < $l;
            $o = $c, $i++
        ) {
            $c = $string[$i];

            // передать некорейские символы как есть.
            if (! isset ($c[self::STRING_KEY_JAMO])) {
                $new = iconv ('UCS-2BE', 'UTF-8', chr ($c[self::STRING_KEY_CODE] >> 8) . chr ($c[self::STRING_KEY_CODE] & 0xff));
                $rus .= $new;
                $lat .= $new;
                continue;
            }

            // o is for old (prev).
            // n is for next.
            $n = isset ($string[$i + 1]) ? $string[$i + 1] : null;

            $s = self::syllable($c, $o, $n);

            $lat .= $s[self::SYLLABLE_KEY_LAT];
            $rus .= $s[self::SYLLABLE_KEY_RUS];
        }

        $this->rus = $rus;
        $this->lat = $lat;
    }

    protected function name($text)
    {
        $this->rus = $this->lat = '';
        if (empty ($text))
        {
            return;
        }

        $string = self::makeStringArray($text);

        // позиция деления на фамилию и имя.
        $space = self::findStringSpace($string);
        while (0 === $space)
        {
            array_shift ($string);
            $space = self::findStringSpace($string);
            if (empty ($string))
            {
                return;
            }
        }
        if (! $space || $space > 2)
        {
            $space = 1;
            array_splice($string, 3);
        }
        else
        {
            array_splice($string, $space, 1);
            array_splice($string, $space + 2);
        }
        $length = count($string);

        for ($pos = 0; $pos < $space; ++$pos)
        {
            $prev = isset ($string[$pos - 1]) ? $string[$pos - 1] : null;
            $next = $pos < $space - 1 && isset ($string[$pos + 1]) ? $string[$pos + 1] : null;
            // fns is for Family Name Syllable.
            $fns = self::syllable($string[$pos], $prev, $next);
            $this->lat .= mb_strtoupper($fns[self::SYLLABLE_KEY_LAT]);
            $this->rus .= mb_strtoupper($fns[self::SYLLABLE_KEY_RUS]);
        }
        if ($this->lat == 'I' || $this->lat == 'RI')
        {
            $this->rus = 'ЛИ';
        }
        elseif ($this->lat == 'IM' || $this->lat == 'RIM')
        {
            $this->rus = 'ЛИМ';
        }

        for ($pos = $space; $pos < $length; ++$pos)
        {
            // gns is for Given Name Syllable
            $gns = self::syllable($string[$pos], $string[$pos - 1], isset ($string[$pos + 1]) ? $string[$pos + 1] : null);
            $lat = $gns[self::SYLLABLE_KEY_LAT];
            $rus = $gns[self::SYLLABLE_KEY_RUS];
            if ($pos == $space)
            {
                $lat = ' ' . mb_convert_case(str_replace ('\'', '', $lat), MB_CASE_TITLE);
                $rus = ' ' . mb_convert_case($rus, MB_CASE_TITLE);
            }
            $this->lat .= $lat;
            $this->rus .= $rus;
        }
    }

    static protected function findStringSpace ($string)
    {
        foreach ($string as $pos => $char)
        {
            if ($char[self::STRING_KEY_CODE] == 32)
            {
                return $pos;
            }
        }
        return false;
    }

    static protected function syllable ($cur, $prev = null, $next = null)
    {
        if (! isset ($cur[self::STRING_KEY_JAMO])) {
            $new = iconv ('UCS-2BE', 'UTF-8', chr ($cur[self::STRING_KEY_CODE] >> 8) . chr ($cur[self::STRING_KEY_CODE] & 0xff));
            return array (
                self::SYLLABLE_KEY_LAT => $new,
                self::SYLLABLE_KEY_RUS => $new,
            );
        }

        // c is for Current character.
        $c = $cur;

        // o is for Old (previous) character.
        $o = $prev ? $prev : array();

        // n is for Next character.
        $n = $next ? $next : array();

        // c is for Cyrillic.
        $c1 = $c2 = $c3 = '';

        // l is for Latin.
        $l1 = $l2 = $l3 = '';

        // сгенерить начальную согласную.
        switch ($l1 = $c[self::STRING_KEY_JAMO][0]){
            case 'g':
                $c1 = 'к';
                if (isset ($o[self::STRING_KEY_JAMO])) {
                    if (in_array ($o[self::STRING_KEY_JAMO][2], array ('', 'n', 'r', 'm', 'ng'))) $c1 = 'г';
                    if (in_array ($o[self::STRING_KEY_JAMO][2], array ('nh', 'h'))) $c1 = 'кх';
                }
            break;
            case 'gg':
                $c1 = 'кк';
                $l1 = 'kk';
            break;
            case 'n': $c1 = 'н'; break;
            case 'd':
                $c1 = 'т';
                if (isset ($o[self::STRING_KEY_JAMO])) {
                    if (in_array ($o[self::STRING_KEY_JAMO][2], array ('', 'n', 'm', 'ng'))) $c1 = 'д';
                    if ($o[self::STRING_KEY_JAMO][2] == 'r') $c1 = 'тт';
                    if (in_array ($o[self::STRING_KEY_JAMO][2], array ('nh', 'h'))) $c1 = 'тх';
                }
            break;
            case 'dd':
                $c1 = 'тт';
                $l1 = 'tt';
            break;
            case 'r':
                $c1 = 'р';
                if (isset ($o[self::STRING_KEY_JAMO])) {
                    if (in_array ($o[self::STRING_KEY_JAMO][2], array ('n', 'r'))) $c1 = 'л';
                    if (in_array ($o[self::STRING_KEY_JAMO][2], array ('g', 'gg', 'kh', 'ng', 'b', 'bb', 'ph', 'm', 'nh'))) $c1 = 'н';
                }
            break;
            case 'm': $c1 = 'м'; break;
            case 'b':
                $c1 = 'п';
                if (isset ($o[self::STRING_KEY_JAMO])) {
                    if (in_array ($o[self::STRING_KEY_JAMO][2], array ('', 'n', 'r', 'm', 'ng'))) $c1 = 'б';
                    if (in_array ($o[self::STRING_KEY_JAMO][2], array ('nh', 'h'))) $c1 = 'пх';
                }
            break;
            case 'bb':
                $c1 = 'пп';
                $l1 = 'pp';
            break;
            case 's': $c1 = 'с'; break;
            case 'ss': $c1 = 'сс'; break;
            case 'j':
                $c1 = 'ч';
                if (isset ($o[self::STRING_KEY_JAMO])) {
                    if (in_array ($o[self::STRING_KEY_JAMO][2], array ('', 'n', 'm', 'ng'))) $c1 = 'дж';
                    if (in_array ($o[self::STRING_KEY_JAMO][2], array ('nh', 'h'))) $c1 = 'чх';
                }
            break;
            case 'jj':
                $c1 = 'чч';
            break;
            case 'ch': $c1 = 'чх'; break;
            case '':
                if (isset ($o[self::STRING_KEY_JAMO])) {
                    if ($o[self::STRING_KEY_JAMO][2] == '')
                    {
                        $l1 = '\'';
                    }
                }
            break;
            case 'kh':
                $c1 = 'кх';
                $l1 = 'k';
            break;
            case 'th':
                $c1 = 'тх';
                $l1 = 't';
            break;
            case 'ph':
                $c1 = 'пх';
                $l1 = 'p';
            break;
            case 'h': $c1 = 'х'; break;
        }

        // сгенерить гласную.
        switch ($l2 = $c[self::STRING_KEY_JAMO][1]) {
            case 'a':   $c2 = 'а'; break;
            case 'ae':  $c2 = 'э'; break;
            case 'ya':  $c2 = 'я'; break;
            case 'yae': $c2 = 'йя'; break;
            case 'eo':  $c2 = 'о'; break;
            case 'e':   $c2 = 'е'; break;
            case 'yeo': $c2 = 'ё'; break;
            case 'ye':
                $c2 = 'йе';
                if ($c1 != ''|| (isset ($o[self::STRING_KEY_JAMO]) && $o[self::STRING_KEY_JAMO][2] != '')) $c2 = 'е';
            break;
            case 'o':   $c2 = 'о'; break;
            case 'wa':  $c2 = 'ва'; break;
            case 'wae': $c2 = 'вэ'; break;
            case 'oi':
                $c2 = 'ве';
                $l2 = 'oe';
            break;
            case 'yo':  $c2 = 'ё'; break;
            case 'u':   $c2 = 'у'; break;
            case 'wo':  $c2 = 'во'; break;
            case 'we':  $c2 = 'ве'; break;
            case 'wi':  $c2 = 'ви'; break;
            case 'yu':  $c2 = 'ю'; break;
            case 'eu':  $c2 = 'ы'; break;
            case 'ui':  $c2 = 'ый'; if ($c1 != '' || isset ($o[self::STRING_KEY_JAMO])) $c2 = 'и'; break;
            case 'i':   $c2 = 'и'; break;
        }

        // сгенерить конечную согласную.
        switch ($l3 = $c[self::STRING_KEY_JAMO][2]) {
            case 'g':
                $c3 = 'к';
                $l3 = 'k';
                if (isset ($n[self::STRING_KEY_JAMO])) {
                    if (in_array ($n[self::STRING_KEY_JAMO][0], array ('n', 'r', 'm'))) {
                        $c3 = 'н';
                        $l3 = 'ng';
                    }
                    if ($n[self::STRING_KEY_JAMO][0] == '') {
                        $c3 = 'г';
                        $l3 = 'g';
                    }
                    if ($n[self::STRING_KEY_JAMO][0] == 'kh') {
                        $l3 = 'k-';
                    }
                }
            break;
            case 'gg':
                $c3 = 'кк';
                $l3 = 'k';
            break;
            case 'gs':
                $c3 = 'к';
                $l3 = 'ks';
                if (isset ($n[self::STRING_KEY_JAMO])) {
                    if ($n[self::STRING_KEY_JAMO][0] == '') $c3 = 'кс';
                }
            break;
            case 'n':
                $c3 = 'н';
                if (isset ($n[self::STRING_KEY_JAMO])) {
                    if ($n[self::STRING_KEY_JAMO][0] == 'r') {
                        $c3 = 'л';
                        $l3 = 'l';
                    }
                    if ($n[self::STRING_KEY_JAMO][0] == 'g') $l3 = 'n-';
                }
            break;
            case 'nj':
                $c3 = 'н';
                if (isset ($n[self::STRING_KEY_JAMO])) {
                    if ($n[self::STRING_KEY_JAMO][0] == '') $c3 = 'ндж';
                }
            break;
            case 'nh': $c3 = 'н'; break;
            case 'd':
                $c3 = 'т';
                $l3 = 't';
                if (isset ($n[self::STRING_KEY_JAMO])) {
                    if ($n[self::STRING_KEY_JAMO][0] == '') {
                        $c3 = 'д';
                        $l3 = 'd';
                    }
                    if (in_array ($n[self::STRING_KEY_JAMO][0], array ('n', 'r', 'm'))) {
                        $l3 = 'n';
                    }
                    if ($n[self::STRING_KEY_JAMO][0] == 'th') {
                        $l3 = 't-';
                    }
                }
            break;
            case 'r':
                $c3 = 'ль';
                $l3 = 'l';
                if (isset ($n[self::STRING_KEY_JAMO])) {
                    if (in_array ($n[self::STRING_KEY_JAMO][0], array ('n', 'r'))) $c3 = 'л';
                    if (in_array ($n[self::STRING_KEY_JAMO][0], array ('', 'h'))) $c3 = 'р';
                    if ($n[self::STRING_KEY_JAMO][0] == '') {
                        $l3 = 'r';
                    }
                }
            break;
            case 'rg':
                $c3 = 'к';
                $l3 = 'lk';
                if (isset ($n[self::STRING_KEY_JAMO])) {
                    if ($n[self::STRING_KEY_JAMO][0] == '') {
                        $c3 = 'льг';
                        $l3 = 'lg';
                    }
                }
            break;
            case 'rm':
                $c3 = 'м';
                $l3 = 'lm';
                if (isset ($n[self::STRING_KEY_JAMO])) {
                    if ($n[self::STRING_KEY_JAMO][0] == '') $c3 = 'льм';
                }
            break;
            case 'rb':
                $c3 = 'ль';
                $l3 = 'lp';
                if (isset ($n[self::STRING_KEY_JAMO])) {
                    if ($n[self::STRING_KEY_JAMO][0] == '') {
                        $c3 = 'льб';
                        $l3 = 'lb';
                    }
                }
            break;
            case 'rs':
                $c3 = 'ль';
                $l3 = 'ls';
                if (isset ($n[self::STRING_KEY_JAMO])) {
                    if ($n[self::STRING_KEY_JAMO][0] == '') $c3 = 'льс';
                }
            break;
            case 'rth':
                $c3 = 'ль';
                $l3 = 'lt';
                if (isset ($n[self::STRING_KEY_JAMO])) {
                    if ($n[self::STRING_KEY_JAMO][0] == '') $c3 = 'льтх';
                }
            break;
            case 'rph':
                $c3 = 'п';
                $l3 = 'lp';
                if (isset ($n[self::STRING_KEY_JAMO])) {
                    if ($n[self::STRING_KEY_JAMO][0] == '') $c3 = 'льпх';
                }
            break;
            case 'rh':
                $c3 = 'ль';
                $l3 = 'lh';
                if (isset ($n[self::STRING_KEY_JAMO])) {
                    if ($n[self::STRING_KEY_JAMO][0] == '') $c3 = 'рх';
                }
            break;
            case 'm': $c3 = 'м'; break;
            case 'b':
                $c3 = 'п';
                $l3 = 'p';
                if (isset ($n[self::STRING_KEY_JAMO])) {
                    if (in_array ($n[self::STRING_KEY_JAMO][0], array ('n', 'r', 'm'))) {
                        $c3 = 'м';
                        $l3 = 'm';
                    }
                    if ($n[self::STRING_KEY_JAMO][0] == '') {
                        $c3 = 'б';
                        $l3 = 'b';
                    }
                    if ($n[self::STRING_KEY_JAMO][0] == 'ph') {
                        $l3 = 'p-';
                    }
                }
            break;
            case 'bs':
                $c3 = 'п';
                if (isset ($n[self::STRING_KEY_JAMO])) {
                    if ($n[self::STRING_KEY_JAMO][0] == '') $c3 = 'пс';
                }
            break;
            case 'ng':
                $c3 = 'н';
                if (isset ($n[self::STRING_KEY_JAMO])) {
                    if ($n[self::STRING_KEY_JAMO][0] == '')
                    {
                        $l3 = 'ng-';
                        $c3 = 'нъ';
                    }
                }
            break;
            case 's':
                $c3 = 'т';
                $l3 = 't';
                if (isset ($n[self::STRING_KEY_JAMO])) {
                    if (in_array ($n[self::STRING_KEY_JAMO][0], array ('', 's', 'ss'))) {
                        $c3 = 'с';
                        $l3 = 's';
                    }
                }
            break;
            case 'ss':
                $c3 = 'т';
                $l3 = 't';
                if (isset ($n[self::STRING_KEY_JAMO])) {
                    if (in_array ($n[self::STRING_KEY_JAMO][0], array ('s', 'ss'))) $c3 = 'с';
                    if ($n[self::STRING_KEY_JAMO][0] == '') {
                        $c3 = 'сс';
                        $l3 = 'ss';
                    }
                }
            break;
            case 'j':
                $c3 = 'т';
                $l3 = 't';
                if (isset ($n[self::STRING_KEY_JAMO])) {
                    if ($n[self::STRING_KEY_JAMO][0] == '') $c3 = 'дж';
                }
            break;
            case 'ch':
                $c3 = 'т';
                $l3 = 't';
                if (isset ($n[self::STRING_KEY_JAMO])) {
                    if ($n[self::STRING_KEY_JAMO][0] == '') $c3 = 'чх';
                }
            break;
            case 'kh':
                $c3 = 'к';
                $l3 = 'k';
                if (isset ($n[self::STRING_KEY_JAMO])) {
                    if ($n[self::STRING_KEY_JAMO][0] == '') $c3 = 'кх';
                }
            break;
            case 'th':
                $c3 = 'т';
                $l3 = 't';
                if (isset ($n[self::STRING_KEY_JAMO])) {
                    if ($n[self::STRING_KEY_JAMO][0] == '') $c3 = 'тх';
                }
            break;
            case 'ph':
                $c3 = 'п';
                $l3 = 'p';
                if (isset ($n[self::STRING_KEY_JAMO])) {
                    if ($n[self::STRING_KEY_JAMO][0] == '') $c3 = 'пх';
                }
            break;
            case 'h':
                $c3 = 'т';
                if (isset ($n[self::STRING_KEY_JAMO])) {
                    if ($n[self::STRING_KEY_JAMO][0] == '')
                        $c3 = 'х';
                    else
                        $c3 = '';
                }
            break;
        }

        return array (
            self::SYLLABLE_KEY_LAT => $l1 . $l2 . $l3,
            self::SYLLABLE_KEY_RUS => $c1 . $c2 . $c3,
        );
    }

    /**
     * Анализирует текст и превращает его в массив:
     *  array (
     *      STRING_KEY_CODE => <code>,
     *      STRING_KEY_JAMO => array (
     *          1 =>
     *          2 =>
     *          3 =>
     *      )
     *  )
    **/
    static protected function makeStringArray($text)
    {
        $string = array();
        for ($i = 0, $l = strlen ($text); $i < $l; $i += 2)
        {
            $n = (ord($text[$i]) << 8) + ord($text[$i + 1]);
            $new = array (self::STRING_KEY_CODE => $n);
            if ($n >= 44032 && $n <= 55203)
            {
                $n -= 44032;
                $j1 = intval (floor ($n / 588));
                $n -= $j1 * 588;
                $j2 = intval (floor ($n / 28));
                $j3 = intval ($n - $j2 * 28);
                $new[self::STRING_KEY_JAMO] = array (
                    self::$jamo[1][$j1],
                    self::$jamo[2][$j2],
                    self::$jamo[3][$j3],
                );
            }
            $string[] = $new;
        }
        return $string;
    }
}
