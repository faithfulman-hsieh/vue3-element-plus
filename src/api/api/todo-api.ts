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
import type { Todo } from '../models';
// @ts-ignore
import type { TodoRequest } from '../models';
/**
 * TodoAPI - axios parameter creator
 * @export
 */
export const TodoAPIAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Marks a todo task as completed with the specified action and priority
         * @summary Complete a todo
         * @param {number} id ID of the todo task
         * @param {string} action Action to complete the todo
         * @param {string} priority Priority of the todo
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        completeTodo: async (id: number, action: string, priority: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            assertParamExists('completeTodo', 'id', id)
            // verify required parameter 'action' is not null or undefined
            assertParamExists('completeTodo', 'action', action)
            // verify required parameter 'priority' is not null or undefined
            assertParamExists('completeTodo', 'priority', priority)
            const localVarPath = `/api/todos/{id}/complete`
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

            if (action !== undefined) {
                localVarQueryParameter['action'] = action;
            }

            if (priority !== undefined) {
                localVarQueryParameter['priority'] = priority;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Creates a new todo task with the provided details
         * @summary Create a new todo
         * @param {TodoRequest} todoRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createTodo: async (todoRequest: TodoRequest, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'todoRequest' is not null or undefined
            assertParamExists('createTodo', 'todoRequest', todoRequest)
            const localVarPath = `/api/todos/addTodo`;
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
            localVarRequestOptions.data = serializeDataIfNeeded(todoRequest, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Retrieves a list of all todo tasks
         * @summary Get all todos
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getAllTodos: async (options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/api/todos`;
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
         * Retrieves the process diagram and current task for a specific todo by ID
         * @summary Get process diagram
         * @param {number} id ID of the todo task
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getProcessDiagram: async (id: number, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            assertParamExists('getProcessDiagram', 'id', id)
            const localVarPath = `/api/todos/{id}/diagram`
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
         * Retrieves the status of a specific todo task by ID
         * @summary Get todo status
         * @param {number} id ID of the todo task
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getTodoStatus: async (id: number, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            assertParamExists('getTodoStatus', 'id', id)
            const localVarPath = `/api/todos/{id}/status`
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
    }
};

/**
 * TodoAPI - functional programming interface
 * @export
 */
export const TodoAPIFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = TodoAPIAxiosParamCreator(configuration)
    return {
        /**
         * Marks a todo task as completed with the specified action and priority
         * @summary Complete a todo
         * @param {number} id ID of the todo task
         * @param {string} action Action to complete the todo
         * @param {string} priority Priority of the todo
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async completeTodo(id: number, action: string, priority: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.completeTodo(id, action, priority, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['TodoAPI.completeTodo']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        /**
         * Creates a new todo task with the provided details
         * @summary Create a new todo
         * @param {TodoRequest} todoRequest 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async createTodo(todoRequest: TodoRequest, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Todo>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.createTodo(todoRequest, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['TodoAPI.createTodo']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        /**
         * Retrieves a list of all todo tasks
         * @summary Get all todos
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getAllTodos(options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Todo>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getAllTodos(options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['TodoAPI.getAllTodos']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        /**
         * Retrieves the process diagram and current task for a specific todo by ID
         * @summary Get process diagram
         * @param {number} id ID of the todo task
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getProcessDiagram(id: number, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<string>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getProcessDiagram(id, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['TodoAPI.getProcessDiagram']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        /**
         * Retrieves the status of a specific todo task by ID
         * @summary Get todo status
         * @param {number} id ID of the todo task
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async getTodoStatus(id: number, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<string>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getTodoStatus(id, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['TodoAPI.getTodoStatus']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
    }
};

/**
 * TodoAPI - factory interface
 * @export
 */
export const TodoAPIFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = TodoAPIFp(configuration)
    return {
        /**
         * Marks a todo task as completed with the specified action and priority
         * @summary Complete a todo
         * @param {TodoAPICompleteTodoRequest} requestParameters Request parameters.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        completeTodo(requestParameters: TodoAPICompleteTodoRequest, options?: RawAxiosRequestConfig): AxiosPromise<void> {
            return localVarFp.completeTodo(requestParameters.id, requestParameters.action, requestParameters.priority, options).then((request) => request(axios, basePath));
        },
        /**
         * Creates a new todo task with the provided details
         * @summary Create a new todo
         * @param {TodoAPICreateTodoRequest} requestParameters Request parameters.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createTodo(requestParameters: TodoAPICreateTodoRequest, options?: RawAxiosRequestConfig): AxiosPromise<Todo> {
            return localVarFp.createTodo(requestParameters.todoRequest, options).then((request) => request(axios, basePath));
        },
        /**
         * Retrieves a list of all todo tasks
         * @summary Get all todos
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getAllTodos(options?: RawAxiosRequestConfig): AxiosPromise<Todo> {
            return localVarFp.getAllTodos(options).then((request) => request(axios, basePath));
        },
        /**
         * Retrieves the process diagram and current task for a specific todo by ID
         * @summary Get process diagram
         * @param {TodoAPIGetProcessDiagramRequest} requestParameters Request parameters.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getProcessDiagram(requestParameters: TodoAPIGetProcessDiagramRequest, options?: RawAxiosRequestConfig): AxiosPromise<string> {
            return localVarFp.getProcessDiagram(requestParameters.id, options).then((request) => request(axios, basePath));
        },
        /**
         * Retrieves the status of a specific todo task by ID
         * @summary Get todo status
         * @param {TodoAPIGetTodoStatusRequest} requestParameters Request parameters.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        getTodoStatus(requestParameters: TodoAPIGetTodoStatusRequest, options?: RawAxiosRequestConfig): AxiosPromise<string> {
            return localVarFp.getTodoStatus(requestParameters.id, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * Request parameters for completeTodo operation in TodoAPI.
 * @export
 * @interface TodoAPICompleteTodoRequest
 */
export interface TodoAPICompleteTodoRequest {
    /**
     * ID of the todo task
     * @type {number}
     * @memberof TodoAPICompleteTodo
     */
    readonly id: number

    /**
     * Action to complete the todo
     * @type {string}
     * @memberof TodoAPICompleteTodo
     */
    readonly action: string

    /**
     * Priority of the todo
     * @type {string}
     * @memberof TodoAPICompleteTodo
     */
    readonly priority: string
}

/**
 * Request parameters for createTodo operation in TodoAPI.
 * @export
 * @interface TodoAPICreateTodoRequest
 */
export interface TodoAPICreateTodoRequest {
    /**
     * 
     * @type {TodoRequest}
     * @memberof TodoAPICreateTodo
     */
    readonly todoRequest: TodoRequest
}

/**
 * Request parameters for getProcessDiagram operation in TodoAPI.
 * @export
 * @interface TodoAPIGetProcessDiagramRequest
 */
export interface TodoAPIGetProcessDiagramRequest {
    /**
     * ID of the todo task
     * @type {number}
     * @memberof TodoAPIGetProcessDiagram
     */
    readonly id: number
}

/**
 * Request parameters for getTodoStatus operation in TodoAPI.
 * @export
 * @interface TodoAPIGetTodoStatusRequest
 */
export interface TodoAPIGetTodoStatusRequest {
    /**
     * ID of the todo task
     * @type {number}
     * @memberof TodoAPIGetTodoStatus
     */
    readonly id: number
}

/**
 * TodoAPI - object-oriented interface
 * @export
 * @class TodoAPI
 * @extends {BaseAPI}
 */
export class TodoAPI extends BaseAPI {
    /**
     * Marks a todo task as completed with the specified action and priority
     * @summary Complete a todo
     * @param {TodoAPICompleteTodoRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TodoAPI
     */
    public completeTodo(requestParameters: TodoAPICompleteTodoRequest, options?: RawAxiosRequestConfig) {
        return TodoAPIFp(this.configuration).completeTodo(requestParameters.id, requestParameters.action, requestParameters.priority, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Creates a new todo task with the provided details
     * @summary Create a new todo
     * @param {TodoAPICreateTodoRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TodoAPI
     */
    public createTodo(requestParameters: TodoAPICreateTodoRequest, options?: RawAxiosRequestConfig) {
        return TodoAPIFp(this.configuration).createTodo(requestParameters.todoRequest, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Retrieves a list of all todo tasks
     * @summary Get all todos
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TodoAPI
     */
    public getAllTodos(options?: RawAxiosRequestConfig) {
        return TodoAPIFp(this.configuration).getAllTodos(options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Retrieves the process diagram and current task for a specific todo by ID
     * @summary Get process diagram
     * @param {TodoAPIGetProcessDiagramRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TodoAPI
     */
    public getProcessDiagram(requestParameters: TodoAPIGetProcessDiagramRequest, options?: RawAxiosRequestConfig) {
        return TodoAPIFp(this.configuration).getProcessDiagram(requestParameters.id, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Retrieves the status of a specific todo task by ID
     * @summary Get todo status
     * @param {TodoAPIGetTodoStatusRequest} requestParameters Request parameters.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof TodoAPI
     */
    public getTodoStatus(requestParameters: TodoAPIGetTodoStatusRequest, options?: RawAxiosRequestConfig) {
        return TodoAPIFp(this.configuration).getTodoStatus(requestParameters.id, options).then((request) => request(this.axios, this.basePath));
    }
}

