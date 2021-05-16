<?php
include_once("authShibboleth.config.php");

require("php-jwt/src/BeforeValidException.php");
require("php-jwt/src/ExpiredException.php");
require("php-jwt/src/SignatureInvalidException.php");
require("php-jwt/src/JWK.php");
require("php-jwt/src/JWT.php");

use Firebase\JWT\JWT;

$windowURL = (isset($_GET) && isset($_GET["windowURL"])) ? $_GET["windowURL"] : "";
$windowURL = urlencode($windowURL);
$targetURL = CONFIRM_SHIB_LOCATION."?windowURL=$windowURL";
$errorMessage = "";
$authenticationData = null;
$jwt = null;

if (isset($_SERVER) && isset($_SERVER["Shib-Session-ID"])) {
  $authenticationData = array(
    "shibboleth" => array(
      "applicationID" => $_SERVER["Shib-Application-ID"],
      "identityProvider" => $_SERVER["Shib-Identity-Provider"],
      "sessionID" => $_SERVER["Shib-Session-ID"],
      "authenticationInstant" => $_SERVER["Shib-Authentication-Instant"],
      "authenticationMethod" => $_SERVER["Shib-Authentication-Method"],
      "authenticationContextClass" => $_SERVER["Shib-AuthnContext-Class"],
      "sessionIndex" => $_SERVER["Shib-Session-Index"]
    ),
    "userInformation" => array(
      "affiliation" => $_SERVER["affiliation"],
      "displayName" => $_SERVER["displayName"],
      "entitlement" => $_SERVER["entitlement"],
      "mail" => $_SERVER["mail"],
      "organization" => $_SERVER["o"],
      "oidEduPersonPrincipalName" => $_SERVER["oid-eduPersonPrincipalName"],
      "unscoped-affiliation" => $_SERVER["unscoped-affiliation"]
    )
  );

  $jwt = JWT::encode($authenticationData, SHIB_SECRET);

  // 1. sign jwt
  // 2. post Token back to Octra-API
  // 3.1 Octra-API verifies Token and login is successful
  // 3.2 or Octra-API detects new User and asks for an user name
  // 4. window-auth retrieves JWT and saves it temporary to a cookie.
  // 5. The window closes and the App calls the window-auth page using get and retrieves the token.
} else {
  $errorMessage = "Missing Shibboleth Session ID.";
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Shibboleth Authentication</title>
</head>
<body>
<?php if (!isset($jwt)) { ?>
  <div class="error">
    Authentication failed.
  </div>
<?php } else { ?>
  <noscript>Please enable Javascript.</noscript>
  <form id="jwTForm" method="post" action="<?php echo $targetURL; ?>" style="display:none;">
    <input type="text" value="<?php echo $jwt; ?>" name="shibToken"/>
  </form>
<?php } ?>
<script type="text/javascript">
  var form = document.getElementById('jwTForm');
  form.submit();
</script>
</body>
</html>
