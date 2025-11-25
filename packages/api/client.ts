import axios, { AxiosInstance, AxiosError } from 'axios';
import { AdParams, AdResponse, ApiErrorResponse } from './types';


export interface ClientParams {
    endpoint?: string;
    excludedTopics?: string[];
    relevancy?: number | null;
  }

/**
 * Client for the Gravity API
 */
export class Client {
  private apiKey: string;
  private endpoint?: string;
  private excludedTopics?: string[];
  private relevancy?: number | null;
  private axios: AxiosInstance;

  constructor(apiKey: string, params: ClientParams = {}) {
    this.apiKey = apiKey;
    this.endpoint = params.endpoint || 'https://server.trygravity.ai';
    this.excludedTopics = params.excludedTopics || [];
    this.relevancy = params.relevancy || null;
    this.axios = axios.create({
      baseURL: this.endpoint,
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }
 
  /**
   * Request a text advertisement. Returns null if there is no relevant ad found.
   * @param params - AdParams matching the server schema
   * @returns Promise<BidResponse | null>
   */
  async getAd(params: AdParams): Promise<AdResponse | null> {
    try {
      const body: AdParams = {
        ...params,
        // prefer explicit apiKey in params, else default to client's apiKey
        apiKey: params.apiKey ?? this.apiKey,
        // supply top-level excludedTopics if not provided
        excludedTopics: params.excludedTopics ?? this.excludedTopics,
        // supply top-level relevancy if not provided
        relevancy: params.relevancy ?? this.relevancy,
      };
      const response = await this.axios.post<AdResponse>('/ad', body);

      // Check if response contains valid ad data
      if (response.status === 204) return null;

      if (response.data && response.data.adText) {
        const payload = response.data as AdResponse;
        return {
          adText: payload.adText,
          impUrl: payload.impUrl,
          clickUrl: payload.clickUrl,
          payout: payload.payout,
        };
      }
          
    } catch (error) {
      this.handleError(error, 'getAd');
      return null;
    }
    return null;
  }

  /**
   * Handle API errors with logging
   * @param error - The error object
   * @param method - The method name where error occurred
   */
  private handleError(error: any, method: string): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      
      if (axiosError.response) {
        // Server responded with error status
        console.error(`[GravityClient.${method}] API Error:`, {
          status: axiosError.response.status,
          statusText: axiosError.response.statusText,
          data: axiosError.response.data,
        });
      } else if (axiosError.request) {
        // Request was made but no response received
        console.error(`[GravityClient.${method}] Network Error:`, {
          message: 'No response received from server',
          code: axiosError.code,
        });
      } else {
        // Something else happened
        console.error(`[GravityClient.${method}] Request Error:`, axiosError.message);
      }
    } else {
      // Non-axios error
      console.error(`[GravityClient.${method}] Unexpected Error:`, error);
    }
  }
}