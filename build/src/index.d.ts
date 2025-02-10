import { EventEmitter } from 'node:events';
import { type GaxiosResponse } from 'gaxios';
import { type CheckOptions } from './options.js';
import { Queue } from './queue.js';
export { getConfig } from './config.js';
export declare enum LinkState {
    OK = "OK",
    BROKEN = "BROKEN",
    SKIPPED = "SKIPPED",
    REDIRECT = "REDIRECT"
}
export type RetryInfo = {
    url: string;
    secondsUntilRetry: number;
    status: number;
};
export type LinkResult = {
    url: string;
    redirectUrl?: string;
    status?: number;
    state: LinkState;
    parent?: string;
    failureDetails?: Array<Error | GaxiosResponse>;
};
export type CrawlResult = {
    passed: boolean;
    links: LinkResult[];
};
type CrawlOptions = {
    url: URL;
    parent?: string;
    crawl: boolean;
    results: LinkResult[];
    cache: Set<string>;
    delayCache: Map<string, number>;
    retryErrorsCache: Map<string, number>;
    checkOptions: CheckOptions;
    queue: Queue;
    rootPath: string;
    retry: boolean;
    retryErrors: boolean;
    retryErrorsCount: number;
    retryErrorsJitter: number;
};
/**
 * Instance class used to perform a crawl job.
 */
export declare class LinkChecker extends EventEmitter {
    on(event: 'link', listener: (result: LinkResult) => void): this;
    on(event: 'pagestart', listener: (link: string) => void): this;
    on(event: 'retry', listener: (details: RetryInfo) => void): this;
    /**
     * Crawl a given url or path, and return a list of visited links along with
     * status codes.
     * @param options Options to use while checking for 404s
     */
    check(options_: CheckOptions): Promise<{
        links: LinkResult[];
        passed: boolean;
    }>;
    /**
     * Crawl a given url with the provided options.
     * @pram opts List of options used to do the crawl
     * @private
     * @returns A list of crawl results consisting of urls and status codes
     */
    crawl(options: CrawlOptions): Promise<void>;
    /**
     * Check the incoming response for a `retry-after` header.  If present,
     * and if the status was an HTTP 429, calculate the date at which this
     * request should be retried. Ensure the delayCache knows that we're
     * going to wait on requests for this entire host.
     * @param response GaxiosResponse returned from the request
     * @param opts CrawlOptions used during this request
     */
    shouldRetryAfter(response: GaxiosResponse, options: CrawlOptions): boolean;
    /**
     * If the response is a 5xx or synthetic 0 response retry N times.
     * @param status Status returned by request or 0 if request threw.
     * @param opts CrawlOptions used during this request
     */
    shouldRetryOnError(status: number, options: CrawlOptions): boolean;
}
/**
 * Convenience method to perform a scan.
 * @param options CheckOptions to be passed on
 */
export declare function check(options: CheckOptions): Promise<{
    links: LinkResult[];
    passed: boolean;
}>;
export type { CheckOptions } from './options.js';
