export type Role = 'user' | 'assistant';

export type Gender = 'male' | 'female' | 'other';

export interface MessageObject {
  role: Role;
  content: string;
}

export interface DeviceObject {
  ip: string;
  country: string;
  ua: string;
  os?: string;
  ifa?: string;
}

export interface UserObject {
  uid?: string;
  gender?: Gender;
  age?: string;
  keywords?: string;
}

export interface AdParams {
  apiKey?: string;
  messages: MessageObject[];
  device?: DeviceObject;
  user?: UserObject;
  excludedTopics?: string[];
  // Allow open-ended fields per publisher
  [key: string]: any;
}

export interface AdResponse {
  adText: string;
  impUrl?: string;
  clickUrl?: string;
  payout?: number;
}

/**
 * API error response structure
 */
export interface ApiErrorResponse {
    error: string;
    message?: string;
    statusCode?: number;
  }