<?php

function __autoload($className)
{
    $fullPath = Autoload::getPath($className);
    if ($fullPath)
    {
        require_once $fullPath;
    }
}

/**
 * Интерфейс для регистрации классов в системе.
 *
 * Autoload::registerClass($className, $fullPath)
**/
final class Autoload
{
    /**
     * Отображение имён классов в полные пути до файлов, их содержащих.
    **/
    static private $classPath = array();
    
    static public function registerClass($className, $fullPath)
    {
        self::$classPath[$className] = $fullPath;
    }
    
    static public function getPath($className)
    {
        if (isset (self::$classPath[$className]))
        {
            return self::$classPath[$className];
        }
        return false;
    }
}
