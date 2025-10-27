export interface IInventoryRequest {
  companyName: string;
  tin: string;
  inventoryDate: string; // ISO date string
  warehouse: string;
  contactPerson: string;
  phone: string;
  email: string;
  comment?: string;
}

export interface IInventoryRequestForm extends IInventoryRequest {
  // Дополнительные поля для формы
}

export interface IBitrixTask {
  ID: string;
  TITLE: string;
  CREATED_DATE: string;
  STATUS: string;
  UF_CRM_TASK_INVENTORY_DATE?: string;
  UF_CRM_TASK_COMPANY_NAME?: string;
  UF_CRM_TASK_TIN?: string;
  UF_CRM_TASK_CONTACT_PERSON?: string;
  UF_CRM_TASK_PHONE?: string;
  UF_CRM_TASK_EMAIL?: string;
  UF_CRM_TASK_WAREHOUSE?: string;
  UF_CRM_TASK_COMMENT?: string;
}

export interface IBitrixResponse {
  result: string | number; // ID созданной заявки
}

export interface IBitrixError {
  error: string;
  error_description?: string;
}
