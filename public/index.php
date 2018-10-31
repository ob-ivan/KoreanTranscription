<?php
use Ob_Ivan\KoreanTranscription\Compile;
use Ob_Ivan\KoreanTranscription\ErrorHandler;
use Ob_Ivan\KoreanTranscription\KoreanPage;

$timeStart = microtime(true);
$projectRoot = dirname(__DIR__);
require_once $projectRoot . '/vendor/autoload.php';

set_error_handler([new ErrorHandler(), 'handleError']);
$templateDir = $projectRoot . '/templates';
$logDir      = $projectRoot . '/var/log';

$debugMode = isset($_GET['debug']) && $_GET['debug'] == 'on';
$showXml = isset($_GET['show']) && $_GET['show'] == 'xml';

try {
    $compile = new Compile($templateDir);
    $page = new KoreanPage($compile);
    if ($showXml) {
        header ('Content-Type: text/xml; charset=utf-8');
        print $page->showXml();
        die;
    }
    header ('Content-Type: text/html; charset=utf-8');
    $output = $page->getOutput();
    unset($page, $compile);
    print $output . '<!-- page generation time = ' . round((microtime(1) - $timeStart) * 1000, 2) . ' ms -->';
} catch (Exception $e) {
    if ($debugMode) {
        print_r($e);
    } else {
        $log = new LogFile($logDir . '/korean.log');
        $log->write(print_r($e, true));
        print "Sorry, I can't get it working. Ask ob-ivan to handle this.";
    }
}
die;
