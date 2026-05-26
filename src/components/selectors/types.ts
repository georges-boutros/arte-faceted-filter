import { FacetColumn, FacetOption } from "../../models/Facet";
import { FacetStrings } from "../../services/localizationService";

export interface SelectorProps {
  facet: FacetColumn;
  options: FacetOption[];
  strings: FacetStrings;
  onChange: (keys: string[]) => void;
}
