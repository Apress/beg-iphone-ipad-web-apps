<?php

# Parse the given folder and return an array of the collected files

function getImages($path) {
    $handle = opendir($path);
    $files = array();

    if ($handle) {
        while (($name = readdir($handle)) !== false) {
            if (is_file("$path/$name")) {
                $files[] = "$path/$name";
            }
        }
    }

    closedir($handle);
    return $files;
}

# Transform our PHP array into a JavaScript array

function writeImages($path) {
    $all = implode('", "', getImages($path));
    echo !$all ? '[]' : '["'. $all . '"]';
}

?>