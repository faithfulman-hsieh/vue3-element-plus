/* tslint:disable */
/* eslint-disable */
/**
 * Chat API definition
 * Manual implementation following the project pattern
 */

import type { Configuration } from '../configuration';
import type { AxiosPromise, AxiosInstance, RawAxiosRequestConfig } from 'axios';
import globalAxios from 'axios';
import { DUMMY_BASE_URL, setSearchParams, serializeDataIfNeeded, toPathString, createRequestFunction } from '../common';
import { BASE_PATH, RequestArgs, BaseAPI } from '../base';

/**
 * ChatAPI - axios parameter creator
 * @export
 */
export const ChatAPIAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Retrieves public chat history
         * @summary Get public chat history
         * @param {*} [options] Override http request option.
         */
        getPublicHistory: async (options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/api/chat/public-history`;
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options };
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Sends a chat message via REST (alternative to WebSocket)
         * @summary Send chat message
         * @param {ChatMessageDto} chatMessage
         * @param {*} [options] Override http request option.
         */
        sendMessage: async (chatMessage: ChatMessageDto, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/api/chat/send`;
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options };
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
            localVarRequestOptions.data = serializeDataIfNeeded(chatMessage, localVarRequestOptions, configuration);

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    };
};

/**
 * ChatAPI - functional programming interface
 * @export
 */
export const ChatAPIFp = function (configuration?: Configuration) {
    const localVarAxiosParamCreator = ChatAPIAxiosParamCreator(configuration);
    return {
        async getPublicHistory(options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Array<ChatMessageDto>>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getPublicHistory(options);
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, basePath);
        },
        async sendMessage(chatMessage: ChatMessageDto, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.sendMessage(chatMessage, options);
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, basePath);
        },
    };
};

/**
 * ChatAPI - factory interface
 * @export
 */
export const ChatAPIFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = ChatAPIFp(configuration);
    return {
        getPublicHistory(options?: RawAxiosRequestConfig): AxiosPromise<Array<ChatMessageDto>> {
            return localVarFp.getPublicHistory(options).then((request) => request(axios, basePath));
        },
        sendMessage(chatMessage: ChatMessageDto, options?: RawAxiosRequestConfig): AxiosPromise<void> {
            return localVarFp.sendMessage(chatMessage, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * ChatAPI - object-oriented interface
 * @export
 */
export class ChatAPI extends BaseAPI {
    public getPublicHistory(options?: RawAxiosRequestConfig) {
        return ChatAPIFp(this.configuration).getPublicHistory(options).then((request) => request(this.axios, this.basePath));
    }
    public sendMessage(chatMessage: ChatMessageDto, options?: RawAxiosRequestConfig) {
        return ChatAPIFp(this.configuration).sendMessage(chatMessage, options).then((request) => request(this.axios, this.basePath));
    }
}

// DTOs
export interface ChatMessageDto {
    sender: string;
    receiver?: string;
    content: string;
    type: string; // 'CHAT' | 'JOIN' | 'LEAVE' | 'NOTIFICATION'
    time?: string;
    data?: string;
}