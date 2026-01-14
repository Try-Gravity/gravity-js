import axios, { AxiosInstance, AxiosError } from 'axios';
import { Ad, AdParams, ApiErrorResponse } from './types';

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
 * const ads = await client.getAd({
 *   messages: [
 *     { role: 'user', content: 'What laptop should I buy?' }
 *   ],
 *   sessionId: 'session-123',
 *   placements: [{ placement: 'below_response' }]
 * });
 *
 * if (ads) {
 *   console.log(ads[0].adText);
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
   * Request contextually relevant advertisements
   *
   * @description Fetches ads based on the provided conversation context and targeting parameters.
   * Returns `null` if no relevant ad is available or if an error occurs.
   *
   * @param params - Ad request parameters including conversation messages
   * @returns Promise resolving to Ad array or null if no ads available
   *
   * @example Basic request
   * ```typescript
   * const ads = await client.getAd({
   *   messages: [
   *     { role: 'user', content: 'I need a new laptop for programming' },
   *     { role: 'assistant', content: 'What is your budget range?' }
   *   ],
   *   sessionId: 'session-123',
   *   placements: [{ placement: 'below_response' }]
   * });
   *
   * if (ads) {
   *   console.log(ads[0].adText);
   * }
   * ```
   *
   * @example With targeting options
   * ```typescript
   * const ads = await client.getAd({
   *   messages: [...],
   *   sessionId: 'session-123',
   *   placements: [{ placement: 'below_response' }],
   *   userId: 'user-456',
   *   user: { gender: 'male', age: '25-34' },
   *   device: { ip: '192.168.1.1', country: 'US' },
   *   excludedTopics: ['gambling'],
   *   relevancy: 0.8
   * });
   * ```
   *
   * @example Displaying and tracking
   * ```typescript
   * const ads = await client.getAd({ messages, sessionId, placements });
   *
   * if (ads && ads.length > 0) {
   *   const ad = ads[0];
   *   // Display the ad
   *   showAd(ad.adText, ad.cta);
   *
   *   // Track impression when ad is displayed
   *   if (ad.impUrl) {
   *     new Image().src = ad.impUrl;
   *   }
   *
   *   // Use clickUrl as the href for clicks
   *   adLink.href = ad.clickUrl || ad.url;
   * }
   * ```
   */
  async getAd(params: AdParams): Promise<Ad[] | null> {
    try {
      const body = {
        ...params,
        excludedTopics: params.excludedTopics ?? this.excludedTopics,
        relevancy: params.relevancy ?? this.relevancy,
      };

      const response = await this.axios.post<Ad[]>('/api/v1/ad/contextual', body);

      if (response.status === 204) {
        return null;
      }

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }

      return null;
    } catch (error) {
      this.handleError(error, 'getAd');
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
