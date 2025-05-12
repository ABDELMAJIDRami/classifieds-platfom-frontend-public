import { AdVersion } from "./AdVersion"
import { User } from "./User"

export interface Ad {
  id: number,
  versions: AdVersion[]
  user: User,
  category: {
    id: number,
    name: string,
  },
  subcategory?: {
    id: number,
    name: string,
  },
  city: {
    id: number,
    name: string,
    country: {
      id: number,
      name: string,
    },
  },
  isActive: boolean,
  createdAt: string,
  updatedAt: string
}