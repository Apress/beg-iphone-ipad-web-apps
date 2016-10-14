<?php

if ($url = $_GET["url"]) {

    #    Process the request using cURL API.
    if ($curl = curl_init($url)) {
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, 1);
        $data = curl_exec($curl);

        # Read response information
        $code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $type = curl_getinfo($curl, CURLINFO_CONTENT_TYPE);
  
        # Return the content and quit.
        if ($code == 200) {
            header("Content-Type: $type", true, $code);
            exit($data);
        }
    }
}

# If there is no valid content, we send a HTTP 500 error response.
header('Content-Type: text/plain', true, 500);
echo 'UNEXPECTED RESPONSE';

?>