/**
 * Role type for conversation messages
 * @description Indicates whether a message is from the user or the AI assistant
 */
export type Role = 'user' | 'assistant';

/**
 * Gender type for user targeting
 * @description Used for demographic targeting of advertisements
 */
export type Gender = 'male' | 'female' | 'other';

/**
 * Represents a single message in a conversation
 * @description Used to provide conversation context for contextual ad targeting
 * @example
 * ```typescript
 * const message: MessageObject = {
 *   role: 'user',
 *   content: 'I need help finding a new laptop.'
 * };
 * ```
 */
export interface MessageObject {
  /** The role of the message sender - either 'user' or 'assistant' */
  role: Role;
  /** The text content of the message */
  content: string;
}

/**
 * Device and location information for ad targeting
 * @description Provides device-level context for better ad relevance and compliance
 * @example
 * ```typescript
 * const device: DeviceObject = {
 *   ip: '192.168.1.1',
 *   country: 'US',
 *   ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...',
 *   os: 'macOS'
 * };
 * ```
 */
export interface DeviceObject {
  /** User's IP address for geo-targeting */
  ip: string;
  /** ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB', 'DE') */
  country: string;
  /** User agent string from the browser */
  ua: string;
  /** Operating system name (e.g., 'macOS', 'Windows', 'iOS', 'Android') */
  os?: string;
  /** Identifier for Advertisers (mobile advertising ID) */
  ifa?: string;
}

/**
 * User profile information for ad targeting
 * @description Demographic and interest data for personalized ad delivery
 * @example
 * ```typescript
 * const user: UserObject = {
 *   uid: 'user-123',
 *   gender: 'male',
 *   age: '25-34',
 *   keywords: 'technology,programming,gaming'
 * };
 * ```
 */
export interface UserObject {
  /** Unique user identifier for frequency capping and tracking */
  uid?: string;
  /** User's gender for demographic targeting */
  gender?: Gender;
  /** Age range string (e.g., '18-24', '25-34', '35-44', '45-54', '55-64', '65+') */
  age?: string;
  /** Comma-separated keywords representing user interests */
  keywords?: string;
}

/**
 * Parameters for requesting an advertisement
 * @description The complete request payload for the getAd() method
 * @example
 * ```typescript
 * const params: AdParams = {
 *   messages: [
 *     { role: 'user', content: 'What laptop should I buy?' },
 *     { role: 'assistant', content: 'What is your budget?' }
 *   ],
 *   user: { gender: 'male', age: '25-34' },
 *   device: { ip: '1.2.3.4', country: 'US', ua: 'Mozilla/5.0...' },
 *   excludedTopics: ['politics'],
 *   relevancy: 0.5
 * };
 * ```
 */
export interface AdParams {
  /** Override the client's API key for this request */
  apiKey?: string;
  /** Array of conversation messages for contextual targeting (required) */
  messages: MessageObject[];
  /** Device and location information */
  device?: DeviceObject;
  /** User demographic and interest data */
  user?: UserObject;
  /** Topics to exclude from ad matching (e.g., ['politics', 'religion']) */
  excludedTopics?: string[];
  /** Minimum relevancy score threshold (0-1). Higher = more relevant but fewer ads */
  relevancy?: number | null;
  /** 
   * Additional custom fields for publisher-specific targeting
   * @description Any additional key-value pairs will be passed to the API
   */
  [key: string]: unknown;
}

/**
 * Response from the Gravity API containing ad data
 * @description Returned by getAd() when a relevant advertisement is found
 * @example
 * ```typescript
 * const ad: AdResponse = {
 *   adText: 'Check out our amazing laptops!',
 *   impUrl: 'https://tracking.example.com/imp?id=123',
 *   clickUrl: 'https://example.com/laptops',
 *   payout: 0.50
 * };
 * ```
 */
export interface AdResponse {
  /** The advertisement copy text to display to the user */
  adText: string;
  /** 
   * Impression tracking URL - fire this when the ad is viewed
   * @description Should be loaded (e.g., via image beacon) when ad becomes visible
   */
  impUrl?: string;
  /** 
   * Click-through URL - navigate user here when ad is clicked
   * @description The destination page when the user clicks the ad
   */
  clickUrl?: string;
  /** 
   * Payout amount in USD for this ad impression
   * @description The revenue earned for displaying this ad
   */
  payout?: number;
}

/**
 * Error response structure from the Gravity API
 * @description Returned when the API encounters an error processing the request
 */
export interface ApiErrorResponse {
  /** Error code or type identifier */
  error: string;
  /** Human-readable error description */
  message?: string;
  /** HTTP status code */
  statusCode?: number;
}
