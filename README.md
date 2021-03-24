
<h1 align="center">OCTRA API</h1>

<p align="center">
<b>! THIS PROJECT IS STILL IN DEVELOPMENT !</b>
<img width="600" height="521" style="border:1px solid gray;" src="https://github.com/IPS-LMU/octra-api/raw/main/screenshots/api.png">
 <br/>
    <br/>
    
New REST API for annotation database used by OCTRA. It  using JTW (JSON web tokens) for Authentication and automatically generated API reference.
</p>

## Features

- Easy implementation of additional API commands thanks to its modular structure.
- Auto-generated API reference of existing commands.
- Security features:
    - app authentication: one app token for each app that uses the API.
    - [JSON Web Token (JWT)](https://jwt.io/) for user authentication and authorisation and session management.
    - Validation of incoming requests and responses by the API with JSON schemata.

## Development

1. Clone this repository, switch to its directory and call `npm install`.
2. Copy and rename the config_sample.json to config.json.
3. Now you can start the server.

### Scripts

<table>
<tbody>
<tr>
<td style="font-weight:bold;">
npm start
</td>
<td>
    Starts the server in dev mode.
</td>
</tr>

<tr>
<td style="font-weight:bold;">
npm run build
</td>
<td>
    Build & create binary for different targets.
</td>
</tr>

<tr>
<td style="font-weight:bold;">
npm test
</td>
<td>
    Call test script.
</td>
</tr>

</tbody>
</table>


### How to implement additional API commands

The most important feature of this API is its modularity. You can easily add more commands to its system.

1. Duplicate `src/api/v1/commands/sample.command.ts` and rename it. Move the new file to a path that represents the URI of the command.
2. Change the name of the new class.
3. On the most top section of the class there is a comment that contains a Quickstart instruction. Follow this instruction.

After you did these steps, you will see, that your new command was added to the API reference automatically.
