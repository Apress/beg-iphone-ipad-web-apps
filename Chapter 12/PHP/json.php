<?php

$json = json_encode(requestData());

# We have a callback, process a JSONP behavior
if ($callback = $_GET['callback']) {
    header('Content-Type: text/javascript');
    echo "$callback($json);";

# No callback, send a classic JSON content
} else {
    header('Content-Type: application/json');
    echo $json;
}

# Request data from database or whatever...
function requestData() {
    return array(
        'firstname' => 'John',
        'lastname' => 'Doe'
    );
}

?>