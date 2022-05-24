# OCTRA Backend - mono repository

---
**!Please notice: This project is under big reconstruction. A lot of work is in progress like refactoring and moving to
NestJS. At the moment the documentation is deprecated and it is going to be updated as soon as the implementation of the
backend has been finished.**
---

<img src="https://raw.githubusercontent.com/IPS-LMU/octra-backend/main/images/octra-backend-diagram.png" />

## Overview

This repository is a mono-repository created with Nx. It contains all projects related to the OCTRA backend (server
side).

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
