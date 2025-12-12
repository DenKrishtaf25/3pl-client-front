export interface IAuthForm {
  email: string
  password: string
}

export interface IUser {
    id: string
    email: string
    name: string | null
    role: 'USER' | 'ADMIN'
    createdAt: string
    updatedAt: string
    clients?: IClient[]
}

export interface IClient {
    id: string
    TIN: string
    companyName: string
    createdAt: string
    updatedAt: string
    _count?: {
        users: number
        stocks: number
        registries: number
    }
}

export interface IUserCreate {
    email: string
    name?: string
    password: string
    role?: 'USER' | 'ADMIN'
    clientIds?: string[]
    TINs?: string[] // TIN для отправки на сервер
}

export interface IUserUpdate {
    email?: string
    name?: string
    role?: 'USER' | 'ADMIN'
    password?: string
    clientIds?: string[]
    TINs?: string[] // TIN для отправки на сервер
}

export interface IClientCreate {
    TIN: string
    companyName: string
    userIds?: string[] // Опционально - пользователи для привязки
}

export interface IClientUpdate {
    TIN?: string
    companyName?: string
    userIds?: string[]
}

export interface IAuthResponse {
    accessToken: string
    user: IUser
}

export type TypeUserForm = Omit<IUser, 'id'> & { password?: string }

export interface IPaginationMeta {
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface IPaginatedResponse<T> {
    data: T[]
    meta: IPaginationMeta
}

export interface IClientQueryParams {
    search?: string
    page?: number
    limit?: number
    sortBy?: 'companyName' | 'createdAt'
    sortOrder?: 'asc' | 'desc'
}

export interface IStockQueryParams {
    search?: string
    page?: number
    limit?: number
    sortBy?: 'article' | 'quantity'
    sortOrder?: 'asc' | 'desc'
    clientTIN?: string // Может быть несколько через запятую: "123,456"
    warehouse?: string // Фильтр по складу
    nomenclature?: string // Фильтр по номенклатуре
    article?: string // Фильтр по артикулу
}

export interface IRegistryQueryParams {
    search?: string
    page?: number
    limit?: number
    sortBy?: 'orderNumber' | 'acceptanceDate' | 'unloadingDate' | 'shipmentPlan' | 'departureDate'
    sortOrder?: 'asc' | 'desc'
    clientTIN?: string // Может быть несколько через запятую: "123,456"
    shipmentPlanFrom?: string // Дата планового прибытия с (ISO format: YYYY-MM-DD или YYYY-MM-DDTHH:mm:ss)
    shipmentPlanTo?: string // Дата планового прибытия до (ISO format: YYYY-MM-DD или YYYY-MM-DDTHH:mm:ss)
    unloadingDateFrom?: string // Дата фактического прибытия с (ISO format: YYYY-MM-DD)
    unloadingDateTo?: string // Дата фактического прибытия до (ISO format: YYYY-MM-DD)
    departureDateFrom?: string // Дата убытия с (ISO format: YYYY-MM-DD или YYYY-MM-DDTHH:mm:ss)
    departureDateTo?: string // Дата убытия до (ISO format: YYYY-MM-DD или YYYY-MM-DDTHH:mm:ss)
    branch?: string // Фильтр по филиалу
    counterparty?: string // Фильтр по контрагенту
    vehicleNumber?: string // Фильтр по номеру ТС
    driverName?: string // Фильтр по ФИО водителя
    orderNumber?: string // Фильтр по номеру заказа
    orderType?: string // Фильтр по типу прихода
    status?: string // Фильтр по статусу ТС
    processingType?: string // Фильтр по типу обработки
}

export interface IOrderQueryParams {
    search?: string
    page?: number
    limit?: number
    sortBy?: 'orderNumber' | 'acceptanceDate' | 'exportDate' | 'shipmentDate'
    sortOrder?: 'asc' | 'desc'
    clientTIN?: string // Может быть несколько через запятую: "123,456"
    acceptanceDateFrom?: string // Дата приемки с (ISO format: YYYY-MM-DD)
    acceptanceDateTo?: string // Дата приемки до (ISO format: YYYY-MM-DD)
    exportDateFrom?: string // Дата выгрузки с (ISO format: YYYY-MM-DD)
    exportDateTo?: string // Дата выгрузки до (ISO format: YYYY-MM-DD)
    shipmentDateFrom?: string // Дата отгрузки с (ISO format: YYYY-MM-DD или YYYY-MM-DDTHH:mm:ss)
    shipmentDateTo?: string // Дата отгрузки до (ISO format: YYYY-MM-DD или YYYY-MM-DDTHH:mm:ss)
    branch?: string // Фильтр по филиалу
    counterparty?: string // Фильтр по контрагенту
    orderNumber?: string // Фильтр по номеру заказа
    orderType?: string // Фильтр по типу заказа
    status?: string // Фильтр по статусу
    kisNumber?: string // Фильтр по номеру КИС
}

export interface IFinanceQueryParams {
    search?: string
    page?: number
    limit?: number
    sortBy?: 'date' | 'amount' | 'completionDate' | 'closingDate'
    sortOrder?: 'asc' | 'desc'
    branch?: string // Фильтр по филиалу
    status?: string // Фильтр по статусу
    dateFrom?: string // Дата с (ISO format: YYYY-MM-DD)
    dateTo?: string // Дата до (ISO format: YYYY-MM-DD)
    amountFrom?: number // Минимальная сумма
    completionDateFrom?: string // Дата завершения с (ISO format: YYYY-MM-DD)
    completionDateTo?: string // Дата завершения до (ISO format: YYYY-MM-DD)
    closingDateFrom?: string // Дата закрытия с (ISO format: YYYY-MM-DD)
    closingDateTo?: string // Дата закрытия до (ISO format: YYYY-MM-DD)
}

export interface IComplaintQueryParams {
    search?: string
    page?: number
    limit?: number
    sortBy?: 'creationDate' | 'complaintNumber' | 'complaintType' | 'status'
    sortOrder?: 'asc' | 'desc'
    branch?: string // Фильтр по филиалу
    status?: string // Фильтр по статусу
    complaint_type?: string // Фильтр по типу претензии (snake_case для API)
    dateFrom?: string // Дата с (ISO format: YYYY-MM-DD)
    dateTo?: string // Дата до (ISO format: YYYY-MM-DD)
    confirmation?: boolean // Фильтр по подтверждению
}
