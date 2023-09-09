<?php
header('Content-Type: image/svg+xml');
header('Cache-Control: no-cache');

function compress($buffer): array|string|null
{
    $search = array('/>[^\S ]+/', '/[^\S ]+</', '/(\s)+/', '/> </', '/:\s+/', '/\{\s+/', '/\s+}/');
    $replace = array('>', '<', '\\1', '><', ':', '{', '}');
    return preg_replace($search, $replace, $buffer);
}

function fetch($message, $web): array|string|null
{
    $opts = array('http' =>
        array(
            'method'  => 'POST',
            'header'  => 'Content-type: application/json',
            'content' => json_encode(array('message' => $message, 'web' => $web))
        )
    );

    $context  = stream_context_create($opts);
    $response = @file_get_contents("http://localhost:8094/card", false, $context);
    $ok = $response !== false;
    return $ok ? json_decode($response, true) : null;
}

function get($param, $default = null)
{
    return $_GET[$param] ?? $default;
}
