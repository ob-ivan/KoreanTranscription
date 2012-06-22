<?php

/**

Формирует аутпут из входного массива и файла XSL-шаблона.

Использование:

$data = array ();
// делаем что-то, наполняя $data данными.
$templatePath = DOCUMENT_ROOT . '/template';
$templateName = 'main';

$compile = new Compile($templatePath);
$compile->setTemplate ($templateName);
$compile->setData ($data);
$output = $compile->getOutput();

или:

$compile = new Compile($templatePath, $templateName, $data);
$output = $compile->getOutput();

----

**/
class Compile {

    private $templatePath = '';
    private $templateName = '';
    
    private $templateSet = false;
    private $dataSet = false;
    private $compilationDone = false;
    
    private $dataXML = null;
    private $outputXML = null;

    public function __construct ($templatePath, $templateName = false, $data = false) {
        if (! file_exists ($templatePath)) {
            throw new Exception ('Не найден путь: ' . $templatePath);
        }
        if (! is_dir ($templatePath)) {
            throw new Exception ('Путь не является директорией: ' . $templatePath);
        }
        if (! is_readable ($templatePath)) {
            throw new Exception ('Директория не может быть прочтена: ' . $templatePath);
        }
        
        $this->templatePath = $templatePath;
        
        if ($templateName) {
            $this->setTemplate ($templateName);
        }
        if ($data) {
            $this->setData ($data);
        }
    }
    
    public function setTemplate ($templateName) {
        if ($this->templateSet) {
            throw new Exception ('Шаблон уже назначен, переназначение невозможно.');
        }
        $filename = $this->templatePath . '/' . $templateName . '.xsl';
        if (! file_exists ($filename)) {
            throw new Exception ('Не найден путь: ' . $filename);
        }
        if (! is_readable ($filename)) {
            throw new Exception ('Директория не может быть прочтена: ' . $filename);
        }
        $this->templateName = $filename;
        $this->templateSet = true;
    }
    
    private function arrayToXML ($data, $tagName = false) {
        if (! strlen($tagName)) {
            throw new Exception ('Имя тэга не может быть пустым.');
        }
        $id = 0;
        if (is_numeric ($tagName)) {
            $id = $tagName;
            $tagName = 'row';
        }
        $xml = '<' . $tagName . ($id ? ' id="' . $id . '"' : '') . '>';
        if (is_array ($data)) {
            foreach ($data as $key => $value) {
                $xml .= $this->arrayToXML ($value, $key);
            }
        }
        else {
            $xml .= '<![CDATA[' . $data . ']]>';
        }
        $xml .= '</' . $tagName . '>';
        return $xml;
    }
    
    public function setData ($data) {
        if ($this->dataSet) {
            throw new Exception ('Данные уже назначены, переназначение невозможно.');
        }
        if (! is_array ($data)) {
            throw new Exception ('Данные должны быть массивом.');
        }
        $this->dataXML = $this->arrayToXML ($data, 'data');
        $this->dataSet = true;
    }
    
    private function compile () {
        if ($this->compilationDone) {
            throw new Exception ('Повторная компиляция невозможна.');
        }
        if (! $this->templateSet) {
            throw new Exception ('Компиляция невозможна без шаблона.');
        }
        if (! $this->dataSet) {
            throw new Exception ('Компиляция невозможна без данных.');
        }
        
        $xml = new DOMDocument();
        $xml->loadXML ($this->dataXML);
        
        $xsl = new DOMDocument();
        $xsl->substituteEntities = true;
        $xsl->load ($this->templateName);
        
        $xslt = new XSLTProcessor();
        $xslt->importStylesheet ($xsl);
        
        $this->outputXML = $xslt->transformToXML ($xml);
        $this->compilationDone = true;
    }
    
    public function getOutput () {
        if (! $this->compilationDone) {
            $this->compile ();
        }
        return $this->outputXML;
    }
    
    public function getInput () {
        if (! $this->dataSet) {
            throw new Exception ('Невозможно отдать XML, пока не загружены данные.');
        }
        return $this->dataXML;
    }

}

?>
