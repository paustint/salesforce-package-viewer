// This is here so that webpack knows about file changes
export const NULL = null;

export type MessageAction =
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'LOGIN_TO_SALESFORCE' }
  | {
      type: 'LOGIN_STATE_CHANGE';
      payload: { loggedIn: true; loginInfo: AuthInfo; userInfo: UserIdentity } | { loggedIn: false; error?: string };
    }
  | { type: 'GET_LOGIN_STATE' }
  | { type: 'API_ERROR_RESPONSE'; payload: { error: string } }
  | { type: 'API_LIST_PACKAGES' }
  | { type: 'API_LIST_PACKAGES_RESPONSE'; payload: { records: Package2Version[] } };

export interface AuthInfo {
  access_token: string;
  id: string;
  instance_url: string;
  issued_at: string;
  refresh_token: string;
  scope: string;
  signature: string;
  state: string;
  token_type: string;
}

export interface UserIdentity {
  id: string;
  asserted_user: boolean;
  user_id: string;
  organization_id: string;
  username: string;
  nick_name: string;
  display_name: string;
  email: string;
  email_verified: boolean;
  first_name: string;
  last_name: string;
  timezone: string;
  photos: {
    picture: string;
    thumbnail: string;
  };
  addr_street: any;
  addr_city: any;
  addr_state: any;
  addr_country: string;
  addr_zip: any;
  mobile_phone: any;
  mobile_phone_verified: boolean;
  is_lightning_login_user: boolean;
  status: {
    created_date: any;
    body: any;
  };
  urls: {
    enterprise: string;
    metadata: string;
    partner: string;
    rest: string;
    sobjects: string;
    search: string;
    query: string;
    recent: string;
    tooling_soap: string;
    tooling_rest: string;
    profile: string;
    feeds: string;
    groups: string;
    users: string;
    feed_items: string;
    feed_elements: string;
    custom_domain: string;
  };
  active: boolean;
  user_type: string;
  language: string;
  locale: string;
  utcOffset: number;
  last_modified_date: string;
  is_app_installed: boolean;
}

export interface QueryResults<T> {
  size: number;
  totalSize: number;
  done: boolean;
  queryLocator: any;
  entityTypeName: string;
  records: T[];
}

export interface BaseRecord {
  attributes: {
    type: string;
    url: string;
  };
  Id: string;
}

export interface Package2Version extends BaseRecord {
  Name: string;
  CodeCoverage?: {
    apexCodeCoveragePercentage: number;
  };
  CreatedDate: string;
  HasMetadataRemoved: boolean;
  HasPassedCodeCoverageCheck: boolean;
  InstallKey?: string;
  IsDeprecated: boolean;
  IsPasswordProtected: boolean;
  IsReleased: boolean;
  LastModifiedDate: string;
  MajorVersion: number;
  MinorVersion: number;
  Package2Id: string;
  Package2: {
    Id: string;
    Name: string;
  };
  PatchVersion: number;
  ReleaseVersion: number;
  Tag?: string;
  ValidationSkipped: boolean;
  SubscriberPackageVersion: {
    Id: string;
  };
}

export interface Attributes {
  type: string;
  url: string;
}

export interface CodeCoverage {
  apexCodeCoveragePercentage: number;
}
