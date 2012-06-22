<?php

class LogFile
{
    const DATE_FORMAT = 'Y-m-d H:i:s';
    
    public function __construct ($filePath)
    {
        $this->filePath = $filePath;
        $this->write(self::makeSeparator('open'));
    }
    
    public function write ($message)
    {
        if (! $this->directoryExists)
        {
            $dirName = dirname($this->filePath);
            if (! is_dir ($dirName))
            {
                mkdir($dirName, 0777, 1);
            }
            if (! is_dir ($dirName))
            {
                throw new Exception('Cannot create log directory');
            }
            $this->directoryExists = true;
        }
        $file = fopen($this->filePath, 'a');
        fwrite($file, self::makeMessage($message));
        fclose($file);
    }
    
    public function __destruct()
    {
        $this->write(self::makeSeparator('close'));
    }
    
    ///////////////////////////////////////////////////////////////////////////////////////////////
    // private sector
    
    protected $filePath = '';
    protected $directoryExists = false;
    const SEPARATOR = '========================================';
    
    protected function makeMessage($message)
    {
        return '[' . date(self::DATE_FORMAT) . '] ' . $message . "\n";
    }
    
    protected function makeSeparator($message)
    {
        return "\n" . self::SEPARATOR . ' ' . date(self::DATE_FORMAT) . ' [' . $message . '] ' . self::SEPARATOR . "\n\n";
    }
}
