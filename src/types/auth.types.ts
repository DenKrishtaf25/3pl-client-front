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
