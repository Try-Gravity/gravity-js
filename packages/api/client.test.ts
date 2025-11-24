import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { Client } from './client';
import { AdParams } from './types';

// Mock axios
vi.mock('axios');

describe('Gravity Client', () => {
  let client: Client;
  const apiKey = 'test-api-key';
  // Mock for the axios instance
  const mockPost = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup axios.create mock to return our mock instance
    // We cast to any here to bypass strict typing on the mock implementation return value
    (axios.create as any).mockReturnValue({
        post: mockPost
    });
    
    // Also mock isAxiosError implementation
    (axios.isAxiosError as any) = vi.fn((payload) => payload?.isAxiosError === true);

    client = new Client(apiKey);
  });

  it('should initialize with default endpoint', () => {
    expect(axios.create).toHaveBeenCalledWith(expect.objectContaining({
        baseURL: 'https://server.trygravity.ai',
        headers: expect.objectContaining({
            'Authorization': `Bearer ${apiKey}`
        })
    }));
  });

  it('should initialize with custom endpoint', () => {
    const customEndpoint = 'https://custom.api.com';
    new Client(apiKey, { endpoint: customEndpoint });
    
    expect(axios.create).toHaveBeenCalledWith(expect.objectContaining({
        baseURL: customEndpoint
    }));
  });

  it('should return ad response when API returns success', async () => {
    const mockResponse = {
        data: {
            adText: 'Buy our product!',
            impUrl: 'http://imp.url',
            clickUrl: 'http://click.url',
            payout: 0.5
        },
        status: 200
    };
    mockPost.mockResolvedValue(mockResponse);

    const params: AdParams = {
        messages: [{ role: 'user', content: 'hello' }]
    };

    const result = await client.getAd(params);
    
    expect(result).toEqual({
        adText: 'Buy our product!',
        impUrl: 'http://imp.url',
        clickUrl: 'http://click.url',
        payout: 0.5
    });
  });

  it('should return null when API returns 204 (no content)', async () => {
    mockPost.mockResolvedValue({ status: 204 });

    const params: AdParams = {
        messages: [{ role: 'user', content: 'hello' }]
    };

    const result = await client.getAd(params);
    expect(result).toBeNull();
  });
  
  it('should return null and log error on API failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const error = {
        isAxiosError: true,
        message: 'Network Error',
        response: {
            status: 500,
            statusText: 'Internal Server Error',
            data: { error: 'fail' }
        }
    };
    mockPost.mockRejectedValue(error);

    const params: AdParams = {
        messages: [{ role: 'user', content: 'hello' }]
    };

    const result = await client.getAd(params);
    
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});

