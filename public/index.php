<?php

// инициализация движка

$timeStart = microtime(1);

$currentDir  = dirname(__FILE__);
$libDir      = $currentDir . '/lib';
$templateDir = $currentDir . '/template';
$logDir      = $currentDir . '/log';

require_once $libDir . '/Autoload.php';
require_once $libDir . '/Error.php';

Autoload::registerClass('Compile',    $libDir . '/Compile.php');
Autoload::registerClass('Convert',    $libDir . '/Convert.php');
Autoload::registerClass('KoreanPage', $libDir . '/KoreanPage.php');
Autoload::registerClass('LogFile',    $libDir . '/LogFile.php');

mb_internal_encoding ('UTF-8');

$debugMode = false !== strpos($currentDir, 'localhost');
$showXml = isset($_GET['show']) && $_GET['show'] == 'xml';

// полезная работа

try
{
    $compile = new Compile($templateDir);
    $page = new KoreanPage($compile);
    if ($showXml)
    {
        header ('Content-Type: text/xml; charset=utf-8');
        print $page->showXml();
        die;
    }
    header ('Content-Type: text/html; charset=utf-8');
    $output = $page->getOutput();
    unset($page, $compile);
    print $output . '<!-- page generation time = ' . round((microtime(1) - $timeStart) * 1000, 2) . ' ms -->';
}
catch (Exception $e)
{
    // обработка ошибок
    
    if ($debugMode)
    {
        print_r($e);
    }
    else
    {
        $log = new LogFile($logDir . '/korean.log');
        $log->write (print_r($e, 1));
        print 'Прости, у меня ничего не получается. Попроси ob-ivan\'а разобраться.';
    }
}
die;
