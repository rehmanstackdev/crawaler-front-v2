import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

type Flags = {
  fullResponse?: boolean;
  errorsRedirect?: boolean;
};

type RequestFunction = Promise<AxiosResponse<any>>;

type ErrorType = {
  response?: {
    status: number;
  };
};

const errorsRedirectHandler = (error: any): void => {
  if (!error.response) {
    console.error("Unknown error", error);
    throw error; // Rethrow unknown errors
  }

  const { status } = error.response;

  if ([401, 400, 404, 409, 500].includes(status)) {
    throw error; // Rethrow specific status codes
  } else if (status === 403) {
    document.location.href = "/";
  } else {
    console.log(error);
    throw error; // Rethrow other errors
  }
};

export default class BaseRequestService {
  async request(fn: RequestFunction, flags: Flags = {}): Promise<any> {
    try {
      const result = await fn;

      if (!result.status && flags.errorsRedirect) {
        return errorsRedirectHandler(result);
      }

      return flags.fullResponse ? result : result.data;
    } catch (error) {
      if (flags.errorsRedirect) {
        errorsRedirectHandler(error as ErrorType);
      }
      throw error; // Always rethrow the error to propagate it to the caller
    }
  }

  async get(url: string, config?: AxiosRequestConfig, flags: Flags = {}): Promise<any> {
    const promise = axios.get(url, config);
    return this.request(promise, flags);
  }

  async post(url: string, data?: any, config?: AxiosRequestConfig, flags: Flags = {}): Promise<any> {
    const promise = axios.post(url, data, config);
    return this.request(promise, flags);
  }

  async delete(url: string, config?: AxiosRequestConfig, flags: Flags = {}): Promise<any> {
    const promise = axios.delete(url, config);
    return this.request(promise, flags);
  }

  async patch(url: string, data?: any, config?: AxiosRequestConfig, flags: Flags = {}): Promise<any> {
    const promise = axios.patch(url, data, config);
    return this.request(promise, flags);
  }

  async put(url: string, data?: any, config?: AxiosRequestConfig, flags: Flags = {}): Promise<any> {
    const promise = axios.put(url, data, config);
    return this.request(promise, flags);
  }
}