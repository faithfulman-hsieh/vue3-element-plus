/* tslint:disable */
/* eslint-disable */
/**
 * Chat API definition
 */

import type { Configuration } from '../configuration';
import type { AxiosPromise, AxiosInstance, RawAxiosRequestConfig } from 'axios';
import globalAxios from 'axios';
import { DUMMY_BASE_URL, setSearchParams, serializeDataIfNeeded, toPathString, createRequestFunction } from '../common';
import { BASE_PATH, RequestArgs, BaseAPI } from '../base';

export const ChatAPIAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 獲取公開頻道歷史訊息
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
         * 發送訊息 (REST)
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
        /**
         * ★★★ 新增：獲取私訊歷史 ★★★
         */
        getPrivateHistory: async (contact: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            if (contact === null || contact === undefined) {
                throw new Error('Required parameter contact was null or undefined when calling getPrivateHistory.');
            }
            const localVarPath = `/api/chat/history/{contact}`
                .replace(`{${"contact"}}`, encodeURIComponent(String(contact)));
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
         * ★★★ 新增：獲取未讀數量 ★★★
         */
        getUnreadCount: async (contact: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            if (contact === null || contact === undefined) {
                throw new Error('Required parameter contact was null or undefined when calling getUnreadCount.');
            }
            const localVarPath = `/api/chat/unread/{contact}`
                .replace(`{${"contact"}}`, encodeURIComponent(String(contact)));
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
         * ★★★ 新增：標記已讀 ★★★
         */
        markAsRead: async (contact: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            if (contact === null || contact === undefined) {
                throw new Error('Required parameter contact was null or undefined when calling markAsRead.');
            }
            const localVarPath = `/api/chat/read/{contact}`
                .replace(`{${"contact"}}`, encodeURIComponent(String(contact)));
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options };
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
         * ★★★ 新增：獲取線上使用者名單 ★★★
         */
        getOnlineUsers: async (options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/api/chat/online-users`;
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
    };
};

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
        // ★★★ 新增 ★★★
        async getPrivateHistory(contact: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Array<ChatMessageDto>>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getPrivateHistory(contact, options);
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, basePath);
        },
        // ★★★ 新增 ★★★
        async getUnreadCount(contact: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<number>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getUnreadCount(contact, options);
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, basePath);
        },
        // ★★★ 新增 ★★★
        async markAsRead(contact: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.markAsRead(contact, options);
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, basePath);
        },
        // ★★★ 新增 ★★★
        async getOnlineUsers(options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Array<string>>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getOnlineUsers(options);
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, basePath);
        },
    };
};

export const ChatAPIFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = ChatAPIFp(configuration);
    return {
        getPublicHistory(options?: RawAxiosRequestConfig): AxiosPromise<Array<ChatMessageDto>> {
            return localVarFp.getPublicHistory(options).then((request) => request(axios, basePath));
        },
        sendMessage(chatMessage: ChatMessageDto, options?: RawAxiosRequestConfig): AxiosPromise<void> {
            return localVarFp.sendMessage(chatMessage, options).then((request) => request(axios, basePath));
        },
        // ★★★ 新增 ★★★
        getPrivateHistory(contact: string, options?: RawAxiosRequestConfig): AxiosPromise<Array<ChatMessageDto>> {
            return localVarFp.getPrivateHistory(contact, options).then((request) => request(axios, basePath));
        },
        // ★★★ 新增 ★★★
        getUnreadCount(contact: string, options?: RawAxiosRequestConfig): AxiosPromise<number> {
            return localVarFp.getUnreadCount(contact, options).then((request) => request(axios, basePath));
        },
        // ★★★ 新增 ★★★
        markAsRead(contact: string, options?: RawAxiosRequestConfig): AxiosPromise<void> {
            return localVarFp.markAsRead(contact, options).then((request) => request(axios, basePath));
        },
        // ★★★ 新增 ★★★
        getOnlineUsers(options?: RawAxiosRequestConfig): AxiosPromise<Array<string>> {
            return localVarFp.getOnlineUsers(options).then((request) => request(axios, basePath));
        },
    };
};

export class ChatAPI extends BaseAPI {
    public getPublicHistory(options?: RawAxiosRequestConfig) {
        return ChatAPIFp(this.configuration).getPublicHistory(options).then((request) => request(this.axios, this.basePath));
    }
    public sendMessage(chatMessage: ChatMessageDto, options?: RawAxiosRequestConfig) {
        return ChatAPIFp(this.configuration).sendMessage(chatMessage, options).then((request) => request(this.axios, this.basePath));
    }
    // ★★★ 新增 ★★★
    public getPrivateHistory(contact: string, options?: RawAxiosRequestConfig) {
        return ChatAPIFp(this.configuration).getPrivateHistory(contact, options).then((request) => request(this.axios, this.basePath));
    }
    // ★★★ 新增 ★★★
    public getUnreadCount(contact: string, options?: RawAxiosRequestConfig) {
        return ChatAPIFp(this.configuration).getUnreadCount(contact, options).then((request) => request(this.axios, this.basePath));
    }
    // ★★★ 新增 ★★★
    public markAsRead(contact: string, options?: RawAxiosRequestConfig) {
        return ChatAPIFp(this.configuration).markAsRead(contact, options).then((request) => request(this.axios, this.basePath));
    }
    // ★★★ 新增 ★★★
    public getOnlineUsers(options?: RawAxiosRequestConfig) {
        return ChatAPIFp(this.configuration).getOnlineUsers(options).then((request) => request(this.axios, this.basePath));
    }
}

export interface ChatMessageDto {
    sender: string;
    receiver?: string;
    content: string;
    type: string;
    time?: string;
    data?: string;
}