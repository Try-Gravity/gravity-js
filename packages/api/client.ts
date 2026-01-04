import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  AdParams,
  AdResponse,
  ApiErrorResponse,
  ContextualAdParams,
  SummaryAdParams,
  NonContextualAdParams,
  BidParams,
  RenderParams,
  AdResponseV1,
  BidResponse,
} from './types';

/**
 * Configuration options for the Gravity API Client
 * @description Pass these options when creating a new Client instance
 * @example
 * ```typescript
 * const params: ClientParams = {
 *   endpoint: 'https://custom.gravity.server',
 *   excludedTopics: ['politics', 'religion'],
 *   relevancy: 0.5
 * };
 * ```
 */
export interface ClientParams {
  /** 
   * Custom API endpoint URL
   * @default 'https://server.trygravity.ai'
   */
  endpoint?: string;
  /** 
   * Topics to exclude from all ad requests
   * @description These exclusions apply to all getAd() calls unless overridden
   * @example ['politics', 'religion', 'adult']
   */
  excludedTopics?: string[];
  /** 
   * Default minimum relevancy threshold (0-1)
   * @description Higher values return more relevant ads but may reduce fill rate
   * @default null (no threshold)
   */
  relevancy?: number | null;
}

/** Default API endpoint for Gravity */
const DEFAULT_ENDPOINT = 'https://server.trygravity.ai';

/** Request timeout in milliseconds */
const REQUEST_TIMEOUT = 10000;

/**
 * Gravity API Client
 * 
 * @description The main client for interacting with the Gravity AI advertising API.
 * Use this client to fetch contextually relevant advertisements based on conversation content.
 * 
 * @example Basic usage
 * ```typescript
 * import { Client } from '@gravity-ai/api';
 * 
 * const client = new Client('your-api-key');
 * 
 * const ad = await client.getAd({
 *   messages: [
 *     { role: 'user', content: 'What laptop should I buy?' }
 *   ]
 * });
 * 
 * if (ad) {
 *   console.log(ad.adText);
 * }
 * ```
 * 
 * @example With configuration options
 * ```typescript
 * const client = new Client('your-api-key', {
 *   endpoint: 'https://custom.server.com',
 *   excludedTopics: ['politics'],
 *   relevancy: 0.7
 * });
 * ```
 */
export class Client {
  /** The API key used for authentication */
  private apiKey: string;
  
  /** The API endpoint URL */
  private endpoint: string;
  
  /** Topics to exclude from ad matching */
  private excludedTopics: string[];
  
  /** Minimum relevancy threshold */
  private relevancy: number | null;
  
  /** Axios HTTP client instance */
  private axios: AxiosInstance;

  /**
   * Create a new Gravity API client
   * 
   * @param apiKey - Your Gravity API key (required)
   * @param params - Optional configuration parameters
   * 
   * @throws Will not throw - invalid API key errors occur on first request
   * 
   * @example
   * ```typescript
   * // Basic initialization
   * const client = new Client('your-api-key');
   * 
   * // With custom options
   * const client = new Client('your-api-key', {
   *   excludedTopics: ['gambling', 'alcohol'],
   *   relevancy: 0.6
   * });
   * ```
   */
  constructor(apiKey: string, params: ClientParams = {}) {
    this.apiKey = apiKey;
    this.endpoint = params.endpoint || DEFAULT_ENDPOINT;
    this.excludedTopics = params.excludedTopics || [];
    this.relevancy = params.relevancy ?? null;
    
    this.axios = axios.create({
      baseURL: this.endpoint,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Request a contextually relevant advertisement
   * 
   * @description Fetches an ad based on the provided conversation context and targeting parameters.
   * Returns `null` if no relevant ad is available or if an error occurs.
   * 
   * @param params - Ad request parameters including conversation messages
   * @returns Promise resolving to AdResponse or null if no ad available
   * 
   * @example Basic request
   * ```typescript
   * const ad = await client.getAd({
   *   messages: [
   *     { role: 'user', content: 'I need a new laptop for programming' },
   *     { role: 'assistant', content: 'What is your budget range?' }
   *   ]
   * });
   * ```
   * 
   * @example Full request with targeting
   * ```typescript
   * const ad = await client.getAd({
   *   messages: [...],
   *   user: {
   *     uid: 'user-123',
   *     gender: 'male',
   *     age: '25-34'
   *   },
   *   device: {
   *     ip: '192.168.1.1',
   *     country: 'US',
   *     ua: navigator.userAgent
   *   },
   *   excludedTopics: ['gambling'],
   *   relevancy: 0.8
   * });
   * ```
   * 
   * @example Handling the response
   * ```typescript
   * const ad = await client.getAd({ messages });
   * 
   * if (ad) {
   *   // Display the ad
   *   showAd(ad.adText);
   *   
   *   // Track impression
   *   if (ad.impUrl) {
   *     new Image().src = ad.impUrl;
   *   }
   * }
   * ```
   */
  async getAd(params: AdParams): Promise<AdResponse | null> {
    try {
      // Build request body, merging request params with client defaults
      const body: AdParams = {
        ...params,
        // Use request-level excludedTopics, or fall back to client-level
        excludedTopics: params.excludedTopics ?? this.excludedTopics,
        // Use request-level relevancy, or fall back to client-level
        relevancy: params.relevancy ?? this.relevancy,
      };

      const response = await this.axios.post<AdResponse>('/ad', body);

      // 204 No Content means no relevant ad was found
      if (response.status === 204) {
        return null;
      }

      // Validate response has required ad data
      if (response.data && response.data.adText) {
        return {
          adText: response.data.adText,
          impUrl: response.data.impUrl,
          clickUrl: response.data.clickUrl,
          payout: response.data.payout,
        };
      }

      return null;
    } catch (error) {
      this.handleError(error, 'getAd');
      return null;
    }
  }

  // ===========================================================================
  // v1 API Methods
  // ===========================================================================

  /**
   * Request contextual advertisements (v1 API)
   *
   * @description Fetches ads based on conversation context. Requires messages array.
   * Returns null if no relevant ad is available or on error.
   *
   * @param params - Request parameters including messages array
   * @returns Promise resolving to AdResponseV1 or null if no ad available
   *
   * @example
   * ```typescript
   * const response = await client.contextualAd({
   *   messages: [
   *     { role: 'user', content: 'What laptop should I buy?' }
   *   ],
   *   sessionId: 'session-123',
   *   userId: 'user-456',
   * });
   *
   * if (response) {
   *   const ad = response.ads[0];
   *   console.log(ad.adText);
   * }
   * ```
   */
  async contextualAd(params: ContextualAdParams): Promise<AdResponseV1 | null> {
    try {
      const body = {
        ...params,
        excludedTopics: params.excludedTopics ?? this.excludedTopics,
        relevancy: params.relevancy ?? this.relevancy,
      };

      const response = await this.axios.post<AdResponseV1>('/api/v1/ad/contextual', body);

      if (response.status === 204) {
        return null;
      }

      if (response.data && response.data.ads && response.data.ads.length > 0) {
        return response.data;
      }

      return null;
    } catch (error) {
      this.handleError(error, 'contextualAd');
      return null;
    }
  }

  /**
   * Request summary-based advertisements (v1 API)
   *
   * @description Fetches ads based on a search/summary query string.
   * Returns null if no relevant ad is available or on error.
   *
   * @param params - Request parameters including queryString
   * @returns Promise resolving to AdResponseV1 or null if no ad available
   *
   * @example
   * ```typescript
   * const response = await client.summaryAd({
   *   queryString: 'best laptops for programming 2025',
   *   sessionId: 'session-123',
   * });
   *
   * if (response) {
   *   const ad = response.ads[0];
   *   console.log(ad.adText);
   * }
   * ```
   */
  async summaryAd(params: SummaryAdParams): Promise<AdResponseV1 | null> {
    try {
      const body = {
        ...params,
        excludedTopics: params.excludedTopics ?? this.excludedTopics,
        relevancy: params.relevancy ?? this.relevancy,
      };

      const response = await this.axios.post<AdResponseV1>('/api/v1/ad/summary', body);

      if (response.status === 204) {
        return null;
      }

      if (response.data && response.data.ads && response.data.ads.length > 0) {
        return response.data;
      }

      return null;
    } catch (error) {
      this.handleError(error, 'summaryAd');
      return null;
    }
  }

  /**
   * Request non-contextual advertisements (v1 API)
   *
   * @description Fetches ads without context matching. Useful for brand awareness placements.
   * Returns null if no ad is available or on error.
   *
   * @param params - Optional request parameters
   * @returns Promise resolving to AdResponseV1 or null if no ad available
   *
   * @example
   * ```typescript
   * const response = await client.nonContextualAd({
   *   sessionId: 'session-123',
   *   numAds: 2,
   * });
   *
   * if (response) {
   *   response.ads.forEach(ad => console.log(ad.adText));
   * }
   * ```
   */
  async nonContextualAd(params: NonContextualAdParams = {}): Promise<AdResponseV1 | null> {
    try {
      const body = {
        ...params,
        excludedTopics: params.excludedTopics ?? this.excludedTopics,
      };

      const response = await this.axios.post<AdResponseV1>('/api/v1/ad/non-contextual', body);

      if (response.status === 204) {
        return null;
      }

      if (response.data && response.data.ads && response.data.ads.length > 0) {
        return response.data;
      }

      return null;
    } catch (error) {
      this.handleError(error, 'nonContextualAd');
      return null;
    }
  }

  /**
   * Request a bid price for contextual ad placement (v1 API)
   *
   * @description First phase of two-phase ad flow. Returns bid price and bidId.
   * Use the bidId with render() to generate the actual ad creative.
   * Returns null if no bid is available or on error.
   *
   * @param params - Request parameters including messages array
   * @returns Promise resolving to BidResponse or null if no bid available
   *
   * @example
   * ```typescript
   * const bidResult = await client.bid({
   *   messages: [
   *     { role: 'user', content: 'I need help with my code' }
   *   ],
   *   sessionId: 'session-123',
   * });
   *
   * if (bidResult) {
   *   console.log(`Bid price: $${bidResult.bid} CPM`);
   *   // Decide whether to show ad based on price...
   *   const ad = await client.render({
   *     bidId: bidResult.bidId,
   *     realizedPrice: bidResult.bid,
   *   });
   * }
   * ```
   */
  async bid(params: BidParams): Promise<BidResponse | null> {
    try {
      const response = await this.axios.post<{ data: BidResponse }>('/api/v1/bid', params);

      if (response.status === 204) {
        return null;
      }

      // Unwrap the { data: { bid, bidId } } response
      if (response.data && response.data.data) {
        return {
          bid: response.data.data.bid,
          bidId: response.data.data.bidId,
        };
      }

      return null;
    } catch (error) {
      this.handleError(error, 'bid');
      return null;
    }
  }

  /**
   * Render an ad from a cached bid (v1 API)
   *
   * @description Second phase of two-phase ad flow. Generates ad creative using cached bid context.
   * Returns null if bid expired (404) or on error. Bid expires after 60 seconds.
   *
   * @param params - Request parameters including bidId and realizedPrice
   * @returns Promise resolving to AdResponseV1 or null if bid expired/error
   *
   * @example
   * ```typescript
   * // After getting a bid...
   * const ad = await client.render({
   *   bidId: bidResult.bidId,
   *   realizedPrice: bidResult.bid,
   * });
   *
   * if (ad) {
   *   const firstAd = ad.ads[0];
   *   displayAd(firstAd);
   * }
   * ```
   */
  async render(params: RenderParams): Promise<AdResponseV1 | null> {
    try {
      const response = await this.axios.post<AdResponseV1>('/api/v1/render', params);

      if (response.status === 204) {
        return null;
      }

      if (response.data && response.data.ads && response.data.ads.length > 0) {
        return response.data;
      }

      return null;
    } catch (error) {
      // 404 means bid expired - treat as null, not an error
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      this.handleError(error, 'render');
      return null;
    }
  }

  /**
   * Handle and log API errors
   * 
   * @description Processes errors from API calls and logs appropriate messages.
   * Distinguishes between network errors, server errors, and unexpected errors.
   * 
   * @param error - The error object from the failed request
   * @param method - The name of the method where the error occurred
   * 
   * @internal This method is for internal use only
   */
  private handleError(error: unknown, method: string): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      if (axiosError.response) {
        // Server responded with an error status code (4xx, 5xx)
        console.error(`[GravityClient.${method}] API Error:`, {
          status: axiosError.response.status,
          statusText: axiosError.response.statusText,
          data: axiosError.response.data,
        });
      } else if (axiosError.request) {
        // Request was made but no response was received (network error)
        console.error(`[GravityClient.${method}] Network Error:`, {
          message: 'No response received from server',
          code: axiosError.code,
        });
      } else {
        // Error occurred while setting up the request
        console.error(`[GravityClient.${method}] Request Error:`, axiosError.message);
      }
    } else {
      // Non-axios error (unexpected)
      console.error(`[GravityClient.${method}] Unexpected Error:`, error);
    }
  }
}
