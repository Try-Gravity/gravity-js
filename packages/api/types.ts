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
 * Placement positions for ad rendering
 * @description Specifies where ads should appear relative to the AI response
 */
export type Placement =
  | 'above_response'
  | 'below_response'
  | 'inline_response'
  | 'left_response'
  | 'right_response';

/**
 * Individual ad placement specification
 * @description Defines a single ad slot with its position and optional tracking ID
 * @example
 * ```typescript
 * const placement: PlacementObject = {
 *   placement: 'below_response',
 *   placement_id: 'sidebar-1'
 * };
 * ```
 */
export interface PlacementObject {
  /** Position where the ad should appear (required) */
  placement: Placement;
  /** Tracking ID for this specific ad slot (required) */
  placement_id: string;
}

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
  /** User's IP address for geo-targeting (required) */
  ip: string;
  /** Browser user-agent string (optional for non-web publishers like IDEs, CLIs, mobile apps) */
  ua?: string;
  /** ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB', 'DE') */
  country?: string;
  /** Operating system name (e.g., 'macOS', 'Windows', 'iOS', 'Android') */
  os?: string;
  /** Identifier for Advertisers (mobile advertising ID) */
  ifa?: string;
  /** Additional device properties (timezone, locale, browser, device_type, screen dimensions, etc.) */
  [key: string]: string | number | boolean | undefined;
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
  /** Unique user identifier for improving ad relevance */
  uid?: string;
  /** User's gender for demographic targeting */
  gender?: Gender;
  /** Age range string (e.g., '18-24', '25-34', '35-44', '45-54', '55-64', '65+') */
  age?: string;
  /** Comma-separated keywords representing user interests */
  keywords?: string;
  /** Additional user properties (email, subscription_tier, user_interests, company_size, etc.) */
  [key: string]: string | string[] | number | boolean | Gender | undefined;
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
 *   sessionId: 'session-123',
 *   placements: [{ placement: 'below_response' }],
 *   userId: 'user-456',
 *   user: { gender: 'male', age: '25-34' },
 *   device: { ip: '1.2.3.4', country: 'US' },
 *   excludedTopics: ['politics'],
 *   relevancy: 0.5
 * };
 * ```
 */
export interface AdParams {
  /** Array of conversation messages for contextual targeting (required) */
  messages: MessageObject[];
  /** Session identifier for ad relevance (required) */
  sessionId: string;
  /** Ad placement specifications (required). Array of 1-10 placements. */
  placements: PlacementObject[];
  /** Unique user identifier */
  userId?: string;
  /** Device and location information */
  device?: DeviceObject;
  /** User demographic and interest data */
  user?: UserObject;
  /** Topics to exclude from ad matching (e.g., ['politics', 'religion']) */
  excludedTopics?: string[];
  /** Minimum relevancy score threshold (0-1). Higher = more relevant but fewer ads */
  relevancy?: number | null;
  /** Returns a test ad when true (no billing, for integration testing) */
  testAd?: boolean;
  /**
   * Additional custom fields for publisher-specific targeting
   * @description Any additional key-value pairs will be passed to the API
   */
  [key: string]: unknown;
}

/**
 * Single ad object in responses.
 * @description Contains ad creative and tracking data. Returned as a flat array from v1 API.
 * @example
 * ```typescript
 * const ad: Ad = {
 *   adText: 'Check out our amazing laptops!',
 *   title: 'Dell XPS 15',
 *   cta: 'Shop Now',
 *   brandName: 'Dell',
 *   url: 'https://dell.com/xps',
 *   impUrl: 'https://tracking.example.com/imp?id=123',
 *   clickUrl: 'https://tracking.example.com/click?id=123'
 * };
 * ```
 */
export interface Ad {
  /** The advertisement copy text */
  adText: string;
  /** Ad title */
  title?: string;
  /** Call-to-action text (e.g., 'Learn More', 'Shop Now') */
  cta?: string;
  /** Brand/advertiser name */
  brandName?: string;
  /** Landing page URL */
  url?: string;
  /** Favicon URL */
  favicon?: string;
  /** Impression tracking URL - fire this when ad is displayed */
  impUrl?: string;
  /** Click-through tracking URL - use this as href for ad clicks */
  clickUrl?: string;
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
