import {City} from "@/core/interfaces/City";

export interface Country {
  id: number;
  name: string;
  code: string;
  cities: City[];
}
