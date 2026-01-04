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

// =============================================================================
// v1 API Types
// =============================================================================

/**
 * Base fields shared across all v1 ad requests.
 * @description Mirrors engine's AdRequestBaseV1. All fields are optional.
 */
export interface AdRequestBaseV1 {
  /** Session identifier for tracking user sessions */
  sessionId?: string;
  /** Unique user identifier */
  userId?: string;
  /** Device and location information */
  device?: DeviceObject;
  /** User demographic and interest data */
  user?: UserObject;
  /** Topics to exclude from ad matching */
  excludedTopics?: string[];
  /** Minimum relevancy score threshold (0-1) */
  relevancy?: number | null;
  /** Number of ads to return (1-3, default 1) */
  numAds?: number;
  /** Returns a test ad when true */
  testAd?: boolean;
  /** Additional custom fields */
  [key: string]: unknown;
}

/**
 * POST /api/v1/ad/contextual
 * @description Requires messages array for contextual targeting.
 */
export interface ContextualAdParams extends AdRequestBaseV1 {
  /** Array of conversation messages (required) */
  messages: MessageObject[];
}

/**
 * POST /api/v1/ad/summary
 * @description Requires queryString for summary-based targeting.
 */
export interface SummaryAdParams extends AdRequestBaseV1 {
  /** Search/summary query string (required) */
  queryString: string;
}

/**
 * POST /api/v1/ad/non-contextual
 * @description No context required - returns ads without context matching.
 */
export interface NonContextualAdParams extends AdRequestBaseV1 {}

/**
 * POST /api/v1/bid
 * @description Two-phase bid request. Returns bid price and bidId.
 * @note Does NOT extend AdRequestBaseV1 - has its own field set.
 */
export interface BidParams {
  /** Array of conversation messages (required) */
  messages: MessageObject[];
  /** Session identifier */
  sessionId?: string;
  /** Unique user identifier */
  userId?: string;
  /** Chat/conversation identifier */
  chatId?: string;
  /** Device and location information */
  device?: DeviceObject;
}

/**
 * POST /api/v1/render
 * @description Two-phase render request using cached bid context.
 */
export interface RenderParams {
  /** Bid identifier from the bid phase (required) */
  bidId: string;
  /** Realized price to charge (required) */
  realizedPrice: number;
}

// =============================================================================
// v1 Response Types
// =============================================================================

/**
 * Single ad object in v1 responses.
 * @description Contains all ad creative and tracking data.
 */
export interface AdV1 {
  /** The advertisement copy text */
  adText: string;
  /** Unique ad identifier */
  adId: string;
  /** Ad title */
  title?: string;
  /** Brand/advertiser name */
  brandName?: string;
  /** Brand logo image URL */
  brandImage?: string;
  /** Landing page URL */
  url?: string;
  /** Favicon URL */
  favicon?: string;
  /** Impression tracking URL */
  impUrl?: string;
  /** Click-through tracking URL */
  clickUrl?: string;
  /** Payout amount in USD */
  payout?: number;
}

/**
 * v1 ad response (multi-ad support).
 * @description Returned by contextual, summary, non-contextual, and render endpoints.
 */
export interface AdResponseV1 {
  /** Array of ad objects */
  ads: AdV1[];
  /** Number of ads returned */
  numAds: number;
  /** Total payout across all ads */
  totalPayout?: number;
}

/**
 * v1 bid response.
 * @description Returned by the bid endpoint.
 */
export interface BidResponse {
  /** Clearing price (CPM) */
  bid: number;
  /** Bid identifier for the render phase */
  bidId: string;
}
