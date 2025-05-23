import type { Configuration } from '../configuration';
import type { AxiosPromise, AxiosInstance, RawAxiosRequestConfig } from 'axios';
import globalAxios from 'axios';
import { DUMMY_BASE_URL, assertParamExists, setApiKeyToObject, setBasicAuthToObject, setBearerAuthToObject, setOAuthToObject, setSearchParams, serializeDataIfNeeded, toPathString, createRequestFunction } from '../common';
import { BASE_PATH, COLLECTION_FORMATS, type RequestArgs, BaseAPI, RequiredError, operationServerMap } from '../base';
import type { Process, ProcessRequest, FormField, FlowNode, User } from '../models';

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
        getUsers: async (options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/api/process/users`;
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
        getFlowNodes: async (processInstanceId: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            assertParamExists('getFlowNodes', 'processInstanceId', processInstanceId);
            const localVarPath = `/api/process/instances/{processInstanceId}/nodes`
                .replace(`{${"processInstanceId"}}`, encodeURIComponent(String(processInstanceId)));
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
        reassignTask: async (processInstanceId: string, newAssignee: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            assertParamExists('reassignTask', 'processInstanceId', processInstanceId);
            assertParamExists('reassignTask', 'newAssignee', newAssignee);
            const localVarPath = `/api/process/instances/{processInstanceId}/reassign`
                .replace(`{${"processInstanceId"}}`, encodeURIComponent(String(processInstanceId)));
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
            localVarRequestOptions.data = JSON.stringify({ newAssignee });

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        jumpToNode: async (processInstanceId: string, targetNode: string, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            assertParamExists('jumpToNode', 'processInstanceId', processInstanceId);
            assertParamExists('jumpToNode', 'targetNode', targetNode);
            const localVarPath = `/api/process/instances/{processInstanceId}/jump`
                .replace(`{${"processInstanceId"}}`, encodeURIComponent(String(processInstanceId)));
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
            localVarRequestOptions.data = JSON.stringify({ targetNode });

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
        async getUsers(options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<User[]>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getUsers(options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['ProcessAPI.getUsers']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        async getFlowNodes(processInstanceId: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<FlowNode[]>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.getFlowNodes(processInstanceId, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['ProcessAPI.getFlowNodes']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        async reassignTask(processInstanceId: string, newAssignee: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.reassignTask(processInstanceId, newAssignee, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['ProcessAPI.reassignTask']?.[localVarOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, localVarOperationServerBasePath || basePath);
        },
        async jumpToNode(processInstanceId: string, targetNode: string, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<void>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.jumpToNode(processInstanceId, targetNode, options);
            const localVarOperationServerIndex = configuration?.serverIndex ?? 0;
            const localVarOperationServerBasePath = operationServerMap['ProcessAPI.jumpToNode']?.[localVarOperationServerIndex]?.url;
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
        getUsers(options?: RawAxiosRequestConfig): AxiosPromise<User[]> {
            return localVarFp.getUsers(options).then((request) => request(axios, basePath));
        },
        getFlowNodes(requestParameters: ProcessAPIGetFlowNodesRequest, options?: RawAxiosRequestConfig): AxiosPromise<FlowNode[]> {
            return localVarFp.getFlowNodes(requestParameters.processInstanceId, options).then((request) => request(axios, basePath));
        },
        reassignTask(requestParameters: ProcessAPIReassignTaskRequest, options?: RawAxiosRequestConfig): AxiosPromise<void> {
            return localVarFp.reassignTask(requestParameters.processInstanceId, requestParameters.newAssignee, options).then((request) => request(axios, basePath));
        },
        jumpToNode(requestParameters: ProcessAPIJumpToNodeRequest, options?: RawAxiosRequestConfig): AxiosPromise<void> {
            return localVarFp.jumpToNode(requestParameters.processInstanceId, requestParameters.targetNode, options).then((request) => request(axios, basePath));
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

export interface ProcessAPIGetFlowNodesRequest {
    readonly processInstanceId: string;
}

export interface ProcessAPIReassignTaskRequest {
    readonly processInstanceId: string;
    readonly newAssignee: string;
}

export interface ProcessAPIJumpToNodeRequest {
    readonly processInstanceId: string;
    readonly targetNode: string;
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

    public getUsers(options?: RawAxiosRequestConfig) {
        return ProcessAPIFp(this.configuration).getUsers(options).then((request) => request(this.axios, this.basePath));
    }

    public getFlowNodes(requestParameters: ProcessAPIGetFlowNodesRequest, options?: RawAxiosRequestConfig) {
        return ProcessAPIFp(this.configuration).getFlowNodes(requestParameters.processInstanceId, options).then((request) => request(this.axios, this.basePath));
    }

    public reassignTask(requestParameters: ProcessAPIReassignTaskRequest, options?: RawAxiosRequestConfig) {
        return ProcessAPIFp(this.configuration).reassignTask(requestParameters.processInstanceId, requestParameters.newAssignee, options).then((request) => request(this.axios, this.basePath));
    }

    public jumpToNode(requestParameters: ProcessAPIJumpToNodeRequest, options?: RawAxiosRequestConfig) {
        return ProcessAPIFp(this.configuration).jumpToNode(requestParameters.processInstanceId, requestParameters.targetNode, options).then((request) => request(this.axios, this.basePath));
    }
}

export interface FormField {
    key: string;
    label: string;
    type: 'text' | 'select';
    options?: { label: string; value: string }[];
}

export interface FlowNode {
    id: string;
    name: string;
}

export interface User {
    label: string;
    value: string;
}