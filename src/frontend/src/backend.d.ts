import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AuditLog {
    id: string;
    action: string;
    hotelId?: bigint;
    timestamp: Time;
    details: string;
    actorPrincipal: Principal;
}
export type Time = bigint;
export interface TaskComment {
    author: Principal;
    comment: string;
    taskId: string;
    timestamp: Time;
}
export interface Hotel {
    id: bigint;
    name: string;
    isActive: boolean;
}
export interface Task {
    id: string;
    status: string;
    title: string;
    creator: Principal;
    hotelIds: Array<bigint>;
    dueDate: Time;
    description: string;
    priority: string;
    assignedUsers: Array<Principal>;
}
export interface UserProfile {
    username: string;
    password: string;
    name: string;
    role: UserRole;
    hotelId?: bigint;
    isActive: boolean;
    securityManager?: string;
    contactNumber?: string;
}
export enum UserRole {
    admin = "admin",
    user = "user"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(taskId: string, comment: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    assignTaskToAllUsersOfHotel(taskId: string, hotelId: bigint): Promise<void>;
    assignTaskToAllUsersOfHotels(taskId: string, hotelIds: Array<bigint>): Promise<void>;
    assignUserToTask(taskId: string, user: Principal): Promise<void>;
    createManualHotel(id: bigint, name: string, isActive: boolean): Promise<void>;
    createTask(title: string, description: string, dueDate: Time, priority: string, hotelIds: Array<bigint>): Promise<string>;
    createUser(userPrincipal: Principal, name: string, username: string, hotelId: bigint | null, securityManager: string | null, contactNumber: string | null, password: string, role: UserRole): Promise<void>;
    deleteHotel(hotelId: bigint): Promise<void>;
    deleteUser(userPrincipal: Principal): Promise<void>;
    getAllHotels(): Promise<Array<Hotel>>;
    getAllTasks(): Promise<Array<Task>>;
    getAllUsersProfiles(): Promise<Array<[Principal, UserProfile]>>;
    getAuditLogs(): Promise<Array<AuditLog>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getTask(taskId: string): Promise<Task | null>;
    getTaskComments(taskId: string): Promise<Array<TaskComment>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateHotel(hotelId: bigint, name: string, isActive: boolean): Promise<void>;
    updateUser(userPrincipal: Principal, name: string, username: string, hotelId: bigint | null, securityManager: string | null, contactNumber: string | null, isActive: boolean, password: string, role: UserRole): Promise<void>;
}
