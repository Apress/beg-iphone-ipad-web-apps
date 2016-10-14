<?php require_once("index_code.php"); ?>
<!DOCTYPE html>
<html>
<head>
    <title>Gallery Demo</title>
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="viewport" content="initial-scale=1.0;
        maximum-scale=1.0; user-scalable=no">

    <link rel="stylesheet" href="styles/main.css">
    <link rel="stylesheet" href="styles/gallery.css">
    <script src="scripts/main.js"></script>
    <script>
        var images = <?php writeImages('images'); ?>;
    </script>
    <script src="scripts/gallery.js"></script>
</head>

<body onload="showImages()">
    <div class="view">
        <div class="header-wrapper">
            <h1>Gallery</h1>
        </div>
    
        <div id="gallery"></div>
    </div>
</body>
</html>