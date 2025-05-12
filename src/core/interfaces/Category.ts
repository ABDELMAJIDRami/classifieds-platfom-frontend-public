import {Subcategory} from "@/core/interfaces/Subcategory";


export interface Category {
  id: number;
  name: string;
  description: string;
  subcategories?: Array<Subcategory>
}
