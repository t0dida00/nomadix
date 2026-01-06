import { countryToContinent } from "@/constants/countries";

export function getContinentByIso(
    iso: string | null | undefined
): string | null {
    if (!iso) return null;

    if (iso in countryToContinent) {
        return countryToContinent[
            iso as keyof typeof countryToContinent
        ];
    }

    return null;
}