/**
 * OCTRA API
 * # Introduction The OCTRA-API is a REST-API that allows apps to interact with the OCTRA-DB.  <img src=\"./assets/octra-backend-diagram.jpg\" alt=\"octra diagram\" />  In order to use this API you should meet the following requirements:  1. You have a valid App Token. You can request an APP Token from the administrator (contact ?).<br/>     The app token have to be send with each HTTP-Request in a HTTP-header called \"X-App-Token\". For example:<br/>     <code>X-App-Token: 7328z4093u4ß92u4902u348</code><br/><br/>     Apptokens are bound to specific domains (aka \"origins\").<br/><br/>  2. Most of the HTTP-requests needs the user to be authenticated. The OCTRA-API uses JWT for authentication and authorization.     A successful <a href=\"#tag/Authentication/operation/login\">login request</a> returns the JWT. This JWT must be appended to the \"Authorization\" HTTP-Header. For example:<br/>     <code>Authorization: Bearer 7328z40293i84ß034293ß02934</code><br/><br/>  ## Role model  This API makes use of a role model. There are general roles and project-specific roles. Each user has exactly one general role and for each project one role (at maximum).  ### General roles  <table> <tbody> <tr> <td><code>administrator</code></td> <td>System administrator with full access to all API functions.</td> </tr> <tr> <td><code>user</code></td> <td>Default role for users with normal access rights.</td> </tr> </tbody> </table>  ### Project-specific roles  <table> <tbody> <tr> <td><code>project_admin</code></td> <td>Project administrator with administrative access rights for the project he or she is assigned with.</td> </tr> <tr> <td><code>data_delivery</code></td> <td>Data deliverer with limited access rights.</td> </tr> <tr> <td><code>transcriber</code></td> <td>Person who is directly assigned to transcribe for a project.</td> </tr> </tbody> </table>
 *
 * OpenAPI spec version: 0.5.6
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import {ProjectRoleDto} from './ProjectRoleDto';

export class ProjectDto {
  /**
   * Primary, unique identifier for this entry
   */
  'id': string;
  /**
   * date of creation
   */
  'creationdate': Date;
  /**
   * date of latest update
   */
  'updatedate': Date;
  /**
   * name of the project.
   */
  'name': string;
  /**
   * describes if the project is active
   */
  'active': boolean;
  /**
   * visibility of the project.
   */
  'visibility': ProjectDtoVisibilityEnum;
  /**
   * short identifier of the project.
   */
  'shortname'?: string;
  /**
   * short description of the project
   */
  'description'?: string;
  /**
   * projectConfiguration
   */
  'configuration'?: any;
  /**
   * start date of the project (ISO 8601)
   */
  'startdate'?: string;
  /**
   * end date of the project (ISO 8601)
   */
  'enddate'?: string;
  'roles': Array<ProjectRoleDto>;

  static readonly discriminator: string | undefined = undefined;

  static readonly attributeTypeMap: Array<{ name: string, baseName: string, type: string, format: string }> = [
    {
      'name': 'id',
      'baseName': 'id',
      'type': 'string',
      'format': ''
    },
    {
      'name': 'creationdate',
      'baseName': 'creationdate',
      'type': 'Date',
      'format': 'date-time'
    },
    {
      'name': 'updatedate',
      'baseName': 'updatedate',
      'type': 'Date',
      'format': 'date-time'
    },
    {
      'name': 'name',
      'baseName': 'name',
      'type': 'string',
      'format': ''
    },
    {
      'name': 'active',
      'baseName': 'active',
      'type': 'boolean',
      'format': ''
    },
    {
      'name': 'visibility',
      'baseName': 'visibility',
      'type': 'ProjectDtoVisibilityEnum',
      'format': ''
    },
    {
      'name': 'shortname',
      'baseName': 'shortname',
      'type': 'string',
      'format': ''
    },
    {
      'name': 'description',
      'baseName': 'description',
      'type': 'string',
      'format': ''
    },
    {
      'name': 'configuration',
      'baseName': 'configuration',
      'type': 'any',
      'format': ''
    },
    {
      'name': 'startdate',
      'baseName': 'startdate',
      'type': 'string',
      'format': ''
    },
    {
      'name': 'enddate',
      'baseName': 'enddate',
      'type': 'string',
      'format': ''
    },
    {
      'name': 'roles',
      'baseName': 'roles',
      'type': 'Array<ProjectRoleDto>',
      'format': ''
    }];

  static getAttributeTypeMap() {
    return ProjectDto.attributeTypeMap;
  }

  public constructor() {
  }
}


export type ProjectDtoVisibilityEnum = 'public' | 'private';

