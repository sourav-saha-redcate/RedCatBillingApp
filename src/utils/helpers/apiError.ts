import axios from 'axios';

/**
 * Normalizes backend and network errors into clear, user-friendly messages.
 * Compatible with NestJS/Fastify error envelopes and network failures.
 */
export const getApiErrorMessage = (
  error: any,
  fallbackMessage: string = 'An unexpected error occurred. Please try again.',
): string => {
  if (!error) return fallbackMessage;

  // If already a simple string
  if (typeof error === 'string') return error;

  // If network connection or cancellation error
  if (axios.isCancel(error)) {
    return error.message || 'Request was cancelled.';
  }

  // If timeout
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'Connection timed out. Please check your network and retry.';
  }

  const response = error.response;
  if (!response) {
    if (error.message?.includes('Network Error') || error.message?.includes('Network request failed')) {
      return 'Unable to reach the server. Please verify your internet connection.';
    }
    return error.message || fallbackMessage;
  }

  const data = response.data;
  const status = response.status;

  // Check data.message from backend envelope
  if (data?.message) {
    if (Array.isArray(data.message)) {
      // NestJS class-validator error array
      return data.message.join(', ');
    }
    if (typeof data.message === 'string' && data.message.trim().length > 0) {
      return data.message;
    }
  }

  // Check data.error
  if (typeof data?.error === 'string' && data.error.trim().length > 0) {
    return data.error;
  }

  // Fallbacks by HTTP status code
  switch (status) {
    case 400:
      return 'Invalid request data. Please check the entered information.';
    case 401:
      return 'Authentication required or session expired. Please sign in again.';
    case 403:
      return 'You do not have authorization to perform this action.';
    case 404:
      return 'The requested record or endpoint was not found.';
    case 409:
      return 'A conflict occurred with existing records.';
    case 422:
      return 'Validation failed. Please verify your input fields.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Server is currently unable to process your request. Please try again later.';
    default:
      return fallbackMessage;
  }
};

export default getApiErrorMessage;
