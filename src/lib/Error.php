<?php

// Покрадено с php.net. Теперь вместо стандартных php-ошибок будут летать эксепшны.

function error_handler($number, $string, $file, $line, $context) {

    // Determine if this error is one of the enabled ones in php config (php.ini, .htaccess, etc)
    $error_is_enabled = (bool)($number & ini_get('error_reporting') );
   
    // -- FATAL ERROR
    // throw an Error Exception, to be handled by whatever Exception handling logic is available in this context
    if ( in_array($number, array(E_USER_ERROR, E_RECOVERABLE_ERROR, E_WARNING)) && $error_is_enabled ) {
        throw new ErrorException($string, 0, $number, $file, $line);
    }
   
    // -- NON-FATAL ERROR/WARNING/NOTICE
    // Log the error if it's enabled, otherwise just ignore it
    elseif ( $error_is_enabled ) {
        error_log ( $string, 0 );
        return false; // Make sure this ends up in $php_errormsg, if appropriate
    }
}

set_error_handler('error_handler');

?>
