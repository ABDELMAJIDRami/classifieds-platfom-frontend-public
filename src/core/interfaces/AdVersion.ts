import { User } from "./User";

export interface AdVersion {
  id: number,
  title: string,
  description: string,
  price: number,
  status: 'pending' | 'approved' | 'rejected',
  versionNumber: number,
  moderator?: User,
  rejectionReason?: string,
  createdAt: string
}