/* tslint:disable */
/* eslint-disable */
/**
 * OpenAPI definition
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: v0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import type { Configuration } from '../configuration';
import type { AxiosPromise, AxiosInstance, RawAxiosRequestConfig } from 'axios';
import globalAxios from 'axios';
// Some imports not used depending on template conditions
// @ts-ignore
import { DUMMY_BASE_URL, assertParamExists, setApiKeyToObject, setBasicAuthToObject, setBearerAuthToObject, setOAuthToObject, setSearchParams, serializeDataIfNeeded, toPathString, createRequestFunction } from '../common';
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS, type RequestArgs, BaseAPI, RequiredError, operationServerMap } from '../base';
// @ts-ignore
import type { Task } from '../models';
// @ts-ignore
import type { TaskFormRequest } from '../models';
// @ts-ignore
import type { TaskJumpRequest } from '../models';
// @ts-ignore
import type { TaskReassignRequest } from '../models';
/**
 * TaskAPI - axios parameter creator
 * @export
 */
export const TaskAPIAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Retrieves tasks assigned to the current user
         * @summary Get user\'s tasks
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getMyTasks: async (options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/api/task/my-tasks`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Retrieves the form structure for a task
         * @summary Get task form
         * @param {string} id 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getTaskForm: async (id: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            assertParamExists('getTaskForm', 'id', id)
            const localVarPath = `/api/task/{id}/form`
                .replace(`{${"id"}}`, encodeURIComponent(String(id)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Jumps the process to a specific task
         * @summary Jump to task
         * @param {string} instanceId 
         * @param {TaskJumpRequest} taskJumpRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        jumpToTask: async (instanceId: string, taskJumpRequest: TaskJumpRequest, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'instanceId' is not null or undefined
            assertParamExists('jumpToTask', 'instanceId', instanceId)
            // verify required parameter 'taskJumpRequest' is not null or undefined
            assertParamExists('jumpToTask', 'taskJumpRequest', taskJumpRequest)
            const localVarPath = `/api/task/{instanceId}/jump`
                .replace(`{${"instanceId"}}`, encodeURIComponent(String(instanceId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(taskJumpRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Reassigns a task to a new user
         * @summary Reassign task
         * @param {string} id 
         * @param {TaskReassignRequest} taskReassignRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        reassignTask: async (id: string, taskReassignRequest: TaskReassignRequest, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            assertParamExists('reassignTask', 'id', id)
            // verify required parameter 'taskReassignRequest' is not null or undefined
            assertParamExists('reassignTask', 'taskReassignRequest', taskReassignRequest)
            const localVarPath = `/api/task/{id}/reassign`
                .replace(`{${"id"}}`, encodeURIComponent(String(id)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(taskReassignRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Submits form data for a task
         * @summary Submit task form
         * @param {string} id 
         * @param {TaskFormRequest} taskFormRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        submitTaskForm: async (id: string, taskFormRequest: TaskFormRequest, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            assertParamExists('submitTaskForm', 'id', id)
            // verify required parameter 'taskFormRequest' is not null or undefined
            assertParamExists('submitTaskForm', 'taskFormRequest', taskFormRequest)
            const localVarPath = `/api/task/{id}/submit`
                .replace(`{${"id"}}`, encodeURIComponent(String(id)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(taskFormRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * TaskAPI - functional programming interface
 * @export
 */
export const TaskAPIFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = TaskAPIAxiosParamCreator(configuration)
    return {
        /**
         * Retrieves tasks assigned to the current user
         * @summary Get user\'s tasks
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getMyTasks(options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Task>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getMyTasks(options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['TaskAPI.getMyTasks']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        /**
         * Retrieves the form structure for a task
         * @summary Get task form
         * @param {string} id 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getTaskForm(id: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<string>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getTaskForm(id, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['TaskAPI.getTaskForm']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        /**
         * Jumps the process to a specific task
         * @summary Jump to task
         * @param {string} instanceId 
         * @param {TaskJumpRequest} taskJumpRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async jumpToTask(instanceId: string, taskJumpRequest: TaskJumpRequest, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.jumpToTask(instanceId, taskJumpRequest, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['TaskAPI.jumpToTask']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        /**
         * Reassigns a task to a new user
         * @summary Reassign task
         * @param {string} id 
         * @param {TaskReassignRequest} taskReassignRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async reassignTask(id: string, taskReassignRequest: TaskReassignRequest, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.reassignTask(id, taskReassignRequest, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['TaskAPI.reassignTask']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        /**
         * Submits form data for a task
         * @summary Submit task form
         * @param {string} id 
         * @param {TaskFormRequest} taskFormRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async submitTaskForm(id: string, taskFormRequest: TaskFormRequest, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.submitTaskForm(id, taskFormRequest, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['TaskAPI.submitTaskForm']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
    }
};

/**
 * TaskAPI - factory interface
 * @export
 */
export const TaskAPIFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = TaskAPIFp(configuration)
    return {
        /**
         * Retrieves tasks assigned to the current user
         * @summary Get user\'s tasks
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getMyTasks(options?: RawAxiosRequestConfig): AxiosPromise<Task> {
            return localVarFp.getMyTasks(options).then((request) => request(axios, basePath));
        },
        /**
         * Retrieves the form structure for a task
         * @summary Get task form
         * @param {TaskAPIGetTaskFormRequest} requestParameters Request parameters.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getTaskForm(requestParameters: TaskAPIGetTaskFormRequest, options?: RawAxiosRequestConfig): AxiosPromise<string> {
            return localVarFp.getTaskForm(requestParameters.id, options).then((request) => request(axios, basePath));
        },
        /**
         * Jumps the process to a specific task
         * @summary Jump to task
         * @param {TaskAPIJumpToTaskRequest} requestParameters Request parameters.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        jumpToTask(requestParameters: TaskAPIJumpToTaskRequest, options?: RawAxiosRequestConfig): AxiosPromise<void> {
            return localVarFp.jumpToTask(requestParameters.instanceId, requestParameters.taskJumpRequest, options).then((request) => request(axios, basePath));
        },
        /**
         * Reassigns a task to a new user
         * @summary Reassign task
         * @param {TaskAPIReassignTaskRequest} requestParameters Request parameters.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        reassignTask(requestParameters: TaskAPIReassignTaskRequest, options?: RawAxiosRequestConfig): AxiosPromise<void> {
            return localVarFp.reassignTask(requestParameters.id, requestParameters.taskReassignRequest, options).then((request) => request(axios, basePath));
        },
        /**
         * Submits form data for a task
         * @summary Submit task form
         * @param {TaskAPISubmitTaskFormRequest} requestParameters Request parameters.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        submitTaskForm(requestParameters: TaskAPISubmitTaskFormRequest, options?: RawAxiosRequestConfig): AxiosPromise<void> {
            return localVarFp.submitTaskForm(requestParameters.id, requestParameters.taskFormRequest, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * Request parameters for getTaskForm operation in TaskAPI.
 * @export
 * @interface TaskAPIGetTaskFormRequest
 */
export interface TaskAPIGetTaskFormRequest {
    /**
     * 
     * @type {string}
     * @memberof TaskAPIGetTaskForm
     */
    readonly id: string
}

/**
 * Request parameters for jumpToTask operation in TaskAPI.
 * @export
 * @interface TaskAPIJumpToTaskRequest
 */
export interface TaskAPIJumpToTaskRequest {
    /**
     * 
     * @type {string}
     * @memberof TaskAPIJumpToTask
     */
    readonly instanceId: string

    /**
     * 
     * @type {TaskJumpRequest}
     * @memberof TaskAPIJumpToTask
     */
    readonly taskJumpRequest: TaskJumpRequest
}

/**
 * Request parameters for reassignTask operation in TaskAPI.
 * @export
 * @interface TaskAPIReassignTaskRequest
 */
export interface TaskAPIReassignTaskRequest {
    /**
     * 
     * @type {string}
     * @memberof TaskAPIReassignTask
     */
    readonly id: string

    /**
     * 
     * @type {TaskReassignRequest}
     * @memberof TaskAPIReassignTask
     */
    readonly taskReassignRequest: TaskReassignRequest
}

/**
 * Request parameters for submitTaskForm operation in TaskAPI.
 * @export
 * @interface TaskAPISubmitTaskFormRequest
 */
export interface TaskAPISubmitTaskFormRequest {
    /**
     * 
     * @type {string}
     * @memberof TaskAPISubmitTaskForm
     */
    readonly id: string

    /**
     * 
     * @type {TaskFormRequest}
     * @memberof TaskAPISubmitTaskForm
     */
    readonly taskFormRequest: TaskFormRequest
}

/**
 * TaskAPI - object-oriented interface
 * @export
 * @class TaskAPI
 * @extends {BaseAPI}
 */
export class TaskAPI extends BaseAPI {
    /**
     * Retrieves tasks assigned to the current user
     * @summary Get user\'s tasks
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TaskAPI
     */
    public getMyTasks(options?: RawAxiosRequestConfig) {
        return TaskAPIFp(this.configuration).getMyTasks(options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Retrieves the form structure for a task
     * @summary Get task form
     * @param {TaskAPIGetTaskFormRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TaskAPI
     */
    public getTaskForm(requestParameters: TaskAPIGetTaskFormRequest, options?: RawAxiosRequestConfig) {
        return TaskAPIFp(this.configuration).getTaskForm(requestParameters.id, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Jumps the process to a specific task
     * @summary Jump to task
     * @param {TaskAPIJumpToTaskRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TaskAPI
     */
    public jumpToTask(requestParameters: TaskAPIJumpToTaskRequest, options?: RawAxiosRequestConfig) {
        return TaskAPIFp(this.configuration).jumpToTask(requestParameters.instanceId, requestParameters.taskJumpRequest, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Reassigns a task to a new user
     * @summary Reassign task
     * @param {TaskAPIReassignTaskRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TaskAPI
     */
    public reassignTask(requestParameters: TaskAPIReassignTaskRequest, options?: RawAxiosRequestConfig) {
        return TaskAPIFp(this.configuration).reassignTask(requestParameters.id, requestParameters.taskReassignRequest, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Submits form data for a task
     * @summary Submit task form
     * @param {TaskAPISubmitTaskFormRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TaskAPI
     */
    public submitTaskForm(requestParameters: TaskAPISubmitTaskFormRequest, options?: RawAxiosRequestConfig) {
        return TaskAPIFp(this.configuration).submitTaskForm(requestParameters.id, requestParameters.taskFormRequest, options).then((request) => request(this.axios, this.basePath));
    }
}

