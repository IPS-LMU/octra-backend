<?php
include_once("window-auth.config.php");
// TODO define origins in config
// header("Access-Control-Allow-Origin: *");

if (isset($_POST) && isset($_POST["token"])) {
  // set cookie with token for 60 seconds
  setcookie(COOKIE_NAME, $_POST["token"], time() + 60, COOKIE_PATH, COOKIE_DOMAIN, true, true);
  echo "<script type=\"application/javascript\">window.close();</script>";
} else if ($_COOKIE[COOKIE_NAME]) {
  $token = $_COOKIE[COOKIE_NAME];
  // remove cookies
  setcookie(COOKIE_NAME, '', time() - 36000, COOKIE_PATH, COOKIE_DOMAIN, true, true);
  header("Content-type: application/json", true);
  echo json_encode(array("token" => $token));
} else {
  // redirect
  $actualURL = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
  $actualURL = urlencode($actualURL);
  header("Location: ".AUTH_SHIB_LOCATION."?windowURL=$actualURL");
  die();
}

?>
