import {
  AnnotationStartResponseDataItem,
  AppTokenChangeResponseDataItem,
  AppTokenRefreshResponseDataItem,
  AppTokenResponseDataItem,
  GuidelinesSaveResponseDataItem,
  ProjectCreateResponseDataItem,
  ProjectResponseDataItem,
  ProjectTranscriptsGetResponseDataItem,
  ToolAddResponseDataItem,
  TranscriptAddResponseDataItem,
  TranscriptGetResponseDataItem,
  UserInfoResponseDataItem,
  UserLoginResponseDataItem
} from './response.objects';
import {PreparedAccountRow, PreparedFileProjectRow} from '../db';

export interface APIResponse {
  status: 'success' | 'error';
  token?: string;
  authenticated: boolean;
  message?: string;
  data?: any;
}

export interface AppTokenChangeResponse extends APIResponse {
  data: AppTokenChangeResponseDataItem;
}

export interface AppTokenCreateResponse extends APIResponse {
  data: AppTokenChangeResponseDataItem;
}

export interface AppTokenListResponse extends APIResponse {
  data: AppTokenResponseDataItem[]
}

export interface AppTokenRefreshResponse extends APIResponse {
  data: AppTokenRefreshResponseDataItem;
}

export interface AppTokenRemoveResponse extends APIResponse {
  data: {};
}

export interface DeliveryMediaAddResponse extends APIResponse {
  data: ProjectTranscriptsGetResponseDataItem;
}

export interface MediaAddResponse extends APIResponse {
  data: PreparedFileProjectRow;
}

export interface MediaUploadResponse extends APIResponse {
  data: {
    url: string;
  };
}

export interface ProjectCreateResponse extends APIResponse {
  data: ProjectCreateResponseDataItem;
}

export interface ProjectListResponse extends APIResponse {
  data: ProjectResponseDataItem[];
}

export interface ProjectTranscriptsGetResponse extends APIResponse {
  data: ProjectTranscriptsGetResponseDataItem[];
}

export interface ToolAddResponse extends APIResponse {
  data: ToolAddResponseDataItem;
}

export interface TranscriptAddResponse extends APIResponse {
  data: TranscriptAddResponseDataItem;
}

export interface TranscriptGetResponse extends APIResponse {
  data: TranscriptGetResponseDataItem;
}

export interface UserAssignRolesResponse extends APIResponse {
  data: {}
}

export interface UserCurrentInfoResponse extends APIResponse {
  data: UserInfoResponseDataItem;
}

export interface UserExistsHashResponse extends APIResponse {
  data: boolean;
}

export interface UserInfoResponse extends APIResponse {
  data: UserInfoResponseDataItem;
}

export interface UserListResponse extends APIResponse {
  data: UserInfoResponseDataItem[];
}

export interface UserLoginResponse extends APIResponse {
  token: string;
  data: UserLoginResponseDataItem;
}

export interface UserPasswordChangeResponse extends APIResponse {
  data: {}
}

export interface UserRegisterResponse extends APIResponse {
  token: string;
  data: PreparedAccountRow;
}

export interface UserRemoveResponse extends APIResponse {
  data: {};
}

export interface GuidelinesSaveResponse extends APIResponse {
  data: GuidelinesSaveResponseDataItem[];
}

export interface GuidelinesGetResponse extends APIResponse {
  data: GuidelinesSaveResponseDataItem[];
}

export interface AnnotationStartResponse extends APIResponse {
  data: AnnotationStartResponseDataItem
}
