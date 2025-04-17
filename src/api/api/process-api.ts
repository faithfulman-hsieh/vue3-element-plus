import type { Configuration } from '../configuration';
import type { AxiosPromise, AxiosInstance, RawAxiosRequestConfig } from 'axios';
import globalAxios from 'axios';
import { DUMMY_BASE_URL, assertParamExists, setApiKeyToObject, setBasicAuthToObject, setBearerAuthToObject, setOAuthToObject, setSearchParams, serializeDataIfNeeded, toPathString, createRequestFunction } from '../common';
import { BASE_PATH, COLLECTION_FORMATS, type RequestArgs, BaseAPI, RequiredError, operationServerMap } from '../base';
import type { Process } from '../models';
import type { ProcessRequest } from '../models';
import type { FormField } from '../models';

export const ProcessAPIAxiosParamCreator = function (configuration?: Configuration) {
    return {
        deployProcess: async (request: ProcessRequest, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            assertParamExists('deployProcess', 'request', request);
            const localVarPath = `/api/process/deploy`;
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options };
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;
            const localVarFormParams = new FormData();

            if (request.name) {
                localVarFormParams.append('name', request.name);
            }
            if (request.file) {
                localVarFormParams.append('file', request.file);
            }

            localVarHeaderParameter['Content-Type'] = 'multipart/form-data';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
            localVarRequestOptions.data = localVarFormParams;

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        getAllDefinitions: async (options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/api/process/definitions`;
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
        getAllInstances: async (options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/api/process/instances`;
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
        getProcessInstanceDiagram: async (id: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            assertParamExists('getProcessInstanceDiagram', 'id', id);
            const localVarPath = `/api/process/instances/{id}/diagram`
                .replace(`{${"id"}}`, encodeURIComponent(String(id)));
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
        getProcessDefinitionDiagram: async (id: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            assertParamExists('getProcessDefinitionDiagram', 'id', id);
            const localVarPath = `/api/process/definitions/{id}/diagram`
                .replace(`{${"id"}}`, encodeURIComponent(String(id)));
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
        getProcessFormFields: async (id: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            assertParamExists('getProcessFormFields', 'id', id);
            const localVarPath = `/api/process/definitions/{id}/form`
                .replace(`{${"id"}}`, encodeURIComponent(String(id)));
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
        getTaskFormFields: async (id: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            assertParamExists('getTaskFormFields', 'id', id);
            const localVarPath = `/api/process/tasks/{id}/form`
                .replace(`{${"id"}}`, encodeURIComponent(String(id)));
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
        startProcess: async (processRequest: ProcessRequest, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            assertParamExists('startProcess', 'processRequest', processRequest);
            const localVarPath = `/api/process/start`;
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options };
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            localVarHeaderParameter['Content-Type'] = 'application/json';

            // 確保 variables 被正確序列化為 JSON
            const serializedRequest = {
                processDefinitionId: processRequest.processDefinitionId,
                variables: processRequest.variables || {}
            };

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };
            localVarRequestOptions.data = JSON.stringify(serializedRequest);

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        toggleProcessStatus: async (id: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            assertParamExists('toggleProcessStatus', 'id', id);
            const localVarPath = `/api/process/definitions/{id}/toggle`
                .replace(`{${"id"}}`, encodeURIComponent(String(id)));
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
    };
};

export const ProcessAPIFp = function (configuration?: Configuration) {
    const localVarAxiosParamCreator = ProcessAPIAxiosParamCreator(configuration);
    return {
        async deployProcess(request: ProcessRequest, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Process>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.deployProcess(request, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['ProcessAPI.deployProcess']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        async getAllDefinitions(options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Process[]>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getAllDefinitions(options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['ProcessAPI.getAllDefinitions']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        async getAllInstances(options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Process[]>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getAllInstances(options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['ProcessAPI.getAllInstances']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        async getProcessInstanceDiagram(id: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<{ bpmnXml: string, currentTask: string | null }>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getProcessInstanceDiagram(id, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['ProcessAPI.getProcessInstanceDiagram']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        async getProcessDefinitionDiagram(id: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<{ bpmnXml: string, currentTask: string | null }>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getProcessDefinitionDiagram(id, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['ProcessAPI.getProcessDefinitionDiagram']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        async getProcessFormFields(id: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<FormField[]>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getProcessFormFields(id, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['ProcessAPI.getProcessFormFields']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        async getTaskFormFields(id: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<FormField[]>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getTaskFormFields(id, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['ProcessAPI.getTaskFormFields']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        async startProcess(processRequest: ProcessRequest, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Process>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.startProcess(processRequest, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['ProcessAPI.startProcess']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        async toggleProcessStatus(id: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Process>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.toggleProcessStatus(id, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['ProcessAPI.toggleProcessStatus']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
    };
};

export const ProcessAPIFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = ProcessAPIFp(configuration);
    return {
        deployProcess(requestParameters: ProcessAPIDeployProcessRequest, options?: RawAxiosRequestConfig): AxiosPromise<Process> {
            return localVarFp.deployProcess(requestParameters.request, options).then((request) => request(axios, basePath));
        },
        getAllDefinitions(options?: RawAxiosRequestConfig): AxiosPromise<Process[]> {
            return localVarFp.getAllDefinitions(options).then((request) => request(axios, basePath));
        },
        getAllInstances(options?: RawAxiosRequestConfig): AxiosPromise<Process[]> {
            return localVarFp.getAllInstances(options).then((request) => request(axios, basePath));
        },
        getProcessInstanceDiagram(requestParameters: ProcessAPIGetProcessInstanceDiagramRequest, options?: RawAxiosRequestConfig): AxiosPromise<{ bpmnXml: string, currentTask: string | null }> {
            return localVarFp.getProcessInstanceDiagram(requestParameters.id, options).then((request) => request(axios, basePath));
        },
        getProcessDefinitionDiagram(requestParameters: ProcessAPIGetProcessDefinitionDiagramRequest, options?: RawAxiosRequestConfig): AxiosPromise<{ bpmnXml: string, currentTask: string | null }> {
            return localVarFp.getProcessDefinitionDiagram(requestParameters.id, options).then((request) => request(axios, basePath));
        },
        getProcessFormFields(requestParameters: ProcessAPIGetProcessFormFieldsRequest, options?: RawAxiosRequestConfig): AxiosPromise<FormField[]> {
            return localVarFp.getProcessFormFields(requestParameters.id, options).then((request) => request(axios, basePath));
        },
        getTaskFormFields(requestParameters: ProcessAPIGetTaskFormFieldsRequest, options?: RawAxiosRequestConfig): AxiosPromise<FormField[]> {
            return localVarFp.getTaskFormFields(requestParameters.id, options).then((request) => request(axios, basePath));
        },
        startProcess(requestParameters: ProcessAPIStartProcessRequest, options?: RawAxiosRequestConfig): AxiosPromise<Process> {
            return localVarFp.startProcess(requestParameters.processRequest, options).then((request) => request(axios, basePath));
        },
        toggleProcessStatus(requestParameters: ProcessAPIToggleProcessStatusRequest, options?: RawAxiosRequestConfig): AxiosPromise<Process> {
            return localVarFp.toggleProcessStatus(requestParameters.id, options).then((request) => request(axios, basePath));
        },
    };
};

export interface ProcessAPIDeployProcessRequest {
    readonly request: ProcessRequest;
}

export interface ProcessAPIGetProcessInstanceDiagramRequest {
    readonly id: string;
}

export interface ProcessAPIGetProcessDefinitionDiagramRequest {
    readonly id: string;
}

export interface ProcessAPIGetProcessFormFieldsRequest {
    readonly id: string;
}

export interface ProcessAPIGetTaskFormFieldsRequest {
    readonly id: string;
}

export interface ProcessAPIStartProcessRequest {
    readonly processRequest: ProcessRequest;
}

export interface ProcessAPIToggleProcessStatusRequest {
    readonly id: string;
}

export class ProcessAPI extends BaseAPI {
    public deployProcess(requestParameters: ProcessAPIDeployProcessRequest, options?: RawAxiosRequestConfig) {
        return ProcessAPIFp(this.configuration).deployProcess(requestParameters.request, options).then((request) => request(this.axios, this.basePath));
    }

    public getAllDefinitions(options?: RawAxiosRequestConfig) {
        return ProcessAPIFp(this.configuration).getAllDefinitions(options).then((request) => request(this.axios, this.basePath));
    }

    public getAllInstances(options?: RawAxiosRequestConfig) {
        return ProcessAPIFp(this.configuration).getAllInstances(options).then((request) => request(this.axios, this.basePath));
    }

    public getProcessInstanceDiagram(requestParameters: ProcessAPIGetProcessInstanceDiagramRequest, options?: RawAxiosRequestConfig) {
        return ProcessAPIFp(this.configuration).getProcessInstanceDiagram(requestParameters.id, options).then((request) => request(this.axios, this.basePath));
    }

    public getProcessDefinitionDiagram(requestParameters: ProcessAPIGetProcessDefinitionDiagramRequest, options?: RawAxiosRequestConfig) {
        return ProcessAPIFp(this.configuration).getProcessDefinitionDiagram(requestParameters.id, options).then((request) => request(this.axios, this.basePath));
    }

    public getProcessFormFields(requestParameters: ProcessAPIGetProcessFormFieldsRequest, options?: RawAxiosRequestConfig) {
        return ProcessAPIFp(this.configuration).getProcessFormFields(requestParameters.id, options).then((request) => request(this.axios, this.basePath));
    }

    public getTaskFormFields(requestParameters: ProcessAPIGetTaskFormFieldsRequest, options?: RawAxiosRequestConfig) {
        return ProcessAPIFp(this.configuration).getTaskFormFields(requestParameters.id, options).then((request) => request(this.axios, this.basePath));
    }

    public startProcess(requestParameters: ProcessAPIStartProcessRequest, options?: RawAxiosRequestConfig) {
        return ProcessAPIFp(this.configuration).startProcess(requestParameters.processRequest, options).then((request) => request(this.axios, this.basePath));
    }

    public toggleProcessStatus(requestParameters: ProcessAPIToggleProcessStatusRequest, options?: RawAxiosRequestConfig) {
        return ProcessAPIFp(this.configuration).toggleProcessStatus(requestParameters.id, options).then((request) => request(this.axios, this.basePath));
    }
}

export interface FormField {
    key: string;
    label: string;
    type: 'text' | 'select';
    options?: { label: string; value: string }[];
}