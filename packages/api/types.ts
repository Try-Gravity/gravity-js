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
  /** Optional tracking ID for this specific ad slot */
  placement_id?: string;
}

/**
 * Describes how your app will display the ad
 * @description Contains placement array and rendering capabilities for ad customization
 * @example
 * ```typescript
 * const renderContext: RenderContextObject = {
 *   placements: [
 *     { placement: 'below_response' },
 *     { placement: 'right_response', placement_id: 'sidebar' }
 *   ],
 *   max_ad_length: 200
 * };
 * ```
 */
export interface RenderContextObject {
  /** Where you plan to show the ad(s). Array of 1-3 placements, must match numAds. */
  placements: PlacementObject[];
  /** Character limit you can display, so we don't send copy that gets truncated */
  max_ad_length?: number;
  /** Whether you can render markdown-formatted text */
  supports_markdown?: boolean;
  /** Whether you can render clickable links */
  supports_links?: boolean;
  /** Whether you can display images (brand logos, product images) */
  supports_images?: boolean;
  /** Whether you can render CTA buttons */
  supports_cta_button?: boolean;
  /** Additional render context properties (supports JSON objects) */
  [key: string]: PlacementObject[] | string | number | boolean | object | null | undefined;
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
 *   numAds: 1,
 *   render_context: {
 *     placements: [{ placement: 'below_response' }]
 *   },
 *   userId: 'user-456',
 *   testAd: true,
 *   user: { gender: 'male', age: '25-34' },
 *   device: { ip: '1.2.3.4', country: 'US', ua: 'Mozilla/5.0...' },
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
  /** Render context with placements array (required). Length of placements must match numAds. */
  render_context: RenderContextObject;
  /** Number of ads to return (1-3). Must match render_context.placements length. */
  numAds?: number;
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
  /** Returns a test ad when true */
  testAd?: boolean;
  /**
   * Additional custom fields for publisher-specific targeting
   * @description Any additional key-value pairs will be passed to the API
   */
  [key: string]: unknown;
}

/**
 * Single ad object in responses.
 * @description Contains all ad creative and tracking data.
 */
export interface Ad {
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
 * Response from the Gravity API containing ad data
 * @description Returned by getAd() when a relevant advertisement is found
 * @example
 * ```typescript
 * const response: AdResponse = {
 *   ads: [{
 *     adText: 'Check out our amazing laptops!',
 *     adId: 'ad-123',
 *     impUrl: 'https://tracking.example.com/imp?id=123',
 *     clickUrl: 'https://example.com/laptops',
 *     payout: 0.50
 *   }],
 *   numAds: 1,
 *   totalPayout: 0.50
 * };
 * ```
 */
export interface AdResponse {
  /** Array of ad objects */
  ads: Ad[];
  /** Number of ads returned */
  numAds: number;
  /** Total payout across all ads */
  totalPayout?: number;
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
// Alternative Ad Request Types (for advanced use cases)
// =============================================================================

/**
 * Base fields shared across all ad requests.
 */
export interface AdRequestBase {
  /** Session identifier for ad relevance (required) */
  sessionId: string;
  /** Render context with placements array (required). Length of placements must match numAds. */
  render_context: RenderContextObject;
  /** Number of ads to return (1-3). Must match render_context.placements length. */
  numAds?: number;
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
  /** Returns a test ad when true */
  testAd?: boolean;
  /** Additional custom fields */
  [key: string]: unknown;
}

/**
 * POST /api/v1/ad/summary
 * @description Requires queryString for summary-based targeting.
 */
export interface SummaryAdParams extends AdRequestBase {
  /** Search/summary query string (required) */
  queryString: string;
}

/**
 * POST /api/v1/ad/non-contextual
 * @description No context required - returns ads without context matching.
 */
export interface NonContextualAdParams extends AdRequestBase {}

/**
 * POST /api/v1/bid
 * @description Two-phase bid request. Returns bid price and bidId.
 */
export interface BidParams {
  /** Array of conversation messages (required) */
  messages: MessageObject[];
  /** Session identifier for ad relevance (required) */
  sessionId: string;
  /** Render context with placements array (required). Length of placements must match numAds. */
  render_context: RenderContextObject;
  /** Number of ads to return (1-3). Must match render_context.placements length. */
  numAds?: number;
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
// Bid/Render Types (for advanced two-phase flow)
// =============================================================================

/**
 * Bid response.
 * @description Returned by the bid endpoint.
 */
export interface BidResponse {
  /** Clearing price (CPM) */
  bid: number;
  /** Bid identifier for the render phase */
  bidId: string;
}
