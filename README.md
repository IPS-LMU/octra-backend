**! Please notice: This project is still in development. At the moment the documentation is deprecated and it is going
to be updated step for step.**

# OCTRA Backend

This repository is a mono-repository for all packages and applications related to the backend of OCTRA. Applications can
use the OCTRA-API in order to connect with the OCTRA-DB (Database). The OCTRA-API allows features like user management,
project management and the definition of annotation tasks. Users can authenticate via credentials or Shibboleth.

<img src="https://github.com/IPS-LMU/octra-backend/raw/main/images/octra-backend-diagram.jpg" />

## Overview

<table>
<tbody>
<tr>
<td>
OCTRA-API
</td>
<td>API for communication with the OCTRA-Database.</td>
<td>
<a href="https://github.com/IPS-LMU/octra-backend/tree/main/apps/api/">more information</a>
</td>
</tr>
<tr>
<td>
Web-Backend
</td>
<td>Backend website for OCTRA users doing administrative tasks or changing personal information.</td>
<td>
<a href="https://github.com/IPS-LMU/octra-backend/tree/main/apps/web-backend/">more information</a>
</td>
</tr>
<tr>
<td>
OCTRA-DB
</td>
<td>Typedefinitions for typescript development.</td>
<td>
<a href="https://github.com/IPS-LMU/octra-backend/tree/main/libs/api-types/">more information</a>
</td>
</tr>
<tr>
<td>
Angular OCTRA-API library
</td>
<td>Library for Angular projects to easily connect with the Octra-API.</td>
<td>
<a href="https://github.com/IPS-LMU/octra-backend/tree/main/libs/ngx-octra-api/">more information</a>
</td>
</tr>
<tr>
<td>
Angular OCTRA-CLI
</td>
<td>CLI for server side administration using the terminal. This tool is needed for upgrade/installation of the DB.</td>
<td>
<a href="https://github.com/IPS-LMU/octra-backend/tree/main/libs/cli/">more information</a>
</td>
</tr>
</tbody>
</table>
