/**
 * Request object for process operations
 * @export
 * @interface ProcessRequest
 */
export interface ProcessRequest {
    /**
     * Name of the process
     * @type {string}
     * @memberof ProcessRequest
     */
    'name'?: string;
    /**
     * BPMN file for deployment
     * @type {File} // 前端保持 File 類型，後端改為 MultipartFile
     * @memberof ProcessRequest
     */
    'file'?: File;
    /**
     * Process definition ID
     * @type {string}
     * @memberof ProcessRequest
     */
    'processDefinitionId'?: string;
    /**
     * Variables for process instance
     * @type {{ [key: string]: object; }}
     * @memberof ProcessRequest
     */
    'variables'?: { [key: string]: object; };
}