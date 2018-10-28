<?php

/*
usage:

$compile = new Compile($templatePath);
$kp = new KoreanPage($compile);
print $kp->getOutput();
die;

*/

class KoreanPage
{
    const TEMPLATE_NAME   = 'korean';
    const PAGE_TITLE      = 'Транскрипция корейского языка';
    const LAYOUT_COLUMNS  = 30;
    const LAYOUT_ROWS_MIN =  5;
    
    /**
     * Принимает иницилизированный компилятор.
    **/
    public function __construct (Compile $compile)
    {
        $this->compile = $compile;
    }
    
    public function getOutput()
    {
        if (! ($this->status & self::STATUS_OUTPUT_READY))
        {
            $this->generateOutput();
        }
        return $this->output;
    }
    
    public function showXml()
    {
        if (! ($this->status & self::STATUS_OUTPUT_READY))
        {
            $this->generateOutput();
        }
        return $this->compile->getInput();
    }
    
    ///////////////////////////////////////////////////////////////////////////////////////////////
    // частный сектор
    
    private $compile;
    private $output;
    private $data;
    
    const STATUS_OUTPUT_READY = 0x01;
    private $status = 0;
    
    protected function generateOutput()
    {
        if ($this->status & self::STATUS_OUTPUT_READY)
        {
            return;
        }
        
        $this->generateData();
        $this->compileOutput();
        
        $this->status |= self::STATUS_OUTPUT_READY;
    }
    
    protected function generateData()
    {
        $data = array (
            'title'  => self::PAGE_TITLE,
            'layout' => array (
                'columns'   => self::LAYOUT_COLUMNS,
                'rows_right'=> self::LAYOUT_ROWS_MIN,
                'rows_left' => 2 * self::LAYOUT_ROWS_MIN + 3,
            ),
            'active_tab' => 'name',
        );
        
        $action = false;
        if (isset ($_POST['action']))
        {
            $action = $_POST['action'];
        }
        
        switch ($action)
        {
            case 'name': {
                $data = self::array_merge_recursive($data, self::convertName());
                break;
            }
            case 'text': {
                $data = self::array_merge_recursive($data, self::convertText());
                break;
            }
        }
        
        $this->data = $data;
    }
    
    static protected function convertName()
    {
        return array (
            'active_tab' => 'name',
            'name' => self::convertGeneric(5, Convert::MODE_NAME)
        );
    }
    
    static protected function convertText()
    {
        $text = self::convertGeneric(1024, Convert::MODE_TEXT);
        
        $rows = intval (2 * strlen ($text['cyrillic']) / 3 / self::LAYOUT_COLUMNS);
        if ($rows < self::LAYOUT_ROWS_MIN)
        {
            $rows = self::LAYOUT_ROWS_MIN;
        }

        return array (
            'active_tab' => 'text',
            'layout' => array (
                'rows_right'=> $rows,
                'rows_left' => 2 * $rows + 3,
            ),
            'text' => $text,
        );
    }
    
    static protected function convertGeneric($length, $mode)
    {
        $kor = mb_substr ($_POST['korean'], 0, $length);
        
        $convert = new Convert($kor, $mode);
        $rus = $convert->rus;
        $lat = $convert->lat;
        unset($convert);

        return array (
            'korean'    => $kor,
            'cyrillic'  => $rus,
            'latin'     => $lat,
        );
    }
    
    protected function compileOutput()
    {
        $this->compile->setTemplate (self::TEMPLATE_NAME);
        $this->compile->setData ($this->data);
        $this->output = $this->compile->getOutput();
    }
    
    static protected function array_merge_recursive($a, $b)
    {
        foreach ($b as $k => $v)
        {
            if (isset($a[$k]) && is_array($a[$k]) && is_array ($v))
            {
                $a[$k] = self::array_merge_recursive($a[$k], $v);
            }
            else
            {
                $a[$k] = $v;
            }
        }
        return $a;
    }
}
