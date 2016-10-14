<?php
    $code = ($_COOKIE['online'] == 'true') ? 410 : 200;
    header('Content-type: text/cache-manifest', true, $code);

?>CACHE MANIFEST

# Our cached resources

CACHE:
index.html
styles/main.css
scripts/main.js
scripts/BigSpinner.js
scripts/storage.js

NETWORK:
proxy.php

FALLBACK:
proxy.php    default.xml
