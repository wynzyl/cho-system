/**
 * Barangay seed data for Urdaneta City, Pangasinan
 * Source: https://www.philatlas.com/luzon/r01/pangasinan/urdaneta.html
 */
export const BARANGAY_DATA = [
  { code: "ANONAS", name: "Anonas" },
  { code: "BACTAD_EAST", name: "Bactad East" },
  { code: "BAYAOAS", name: "Bayaoas" },
  { code: "BOLAOEN", name: "Bolaoen" },
  { code: "CABARUAN", name: "Cabaruan" },
  { code: "CABULOAN", name: "Cabuloan" },
  { code: "CAMANANG", name: "Camanang" },
  { code: "CAMANTILES", name: "Camantiles" },
  { code: "CASANTAAN", name: "Casantaan" },
  { code: "CATABLAN", name: "Catablan" },
  { code: "CAYAMBANAN", name: "Cayambanan" },
  { code: "CONSOLACION", name: "Consolacion" },
  { code: "DILAN_PAURIDO", name: "Dilan Paurido" },
  { code: "DR_PEDRO_T_ORATA", name: "Dr. Pedro T. Orata" },
  { code: "LABIT_PROPER", name: "Labit Proper" },
  { code: "LABIT_WEST", name: "Labit West" },
  { code: "MABANOGBOG", name: "Mabanogbog" },
  { code: "MACALONG", name: "Macalong" },
  { code: "NANCALOBASAAN", name: "Nancalobasaan" },
  { code: "NANCAMALIRAN_EAST", name: "Nancamaliran East" },
  { code: "NANCAMALIRAN_WEST", name: "Nancamaliran West" },
  { code: "NANCAYASAN", name: "Nancayasan" },
  { code: "OLTAMA", name: "Oltama" },
  { code: "PALINA_EAST", name: "Palina East" },
  { code: "PALINA_WEST", name: "Palina West" },
  { code: "PINMALUDPOD", name: "Pinmaludpod" },
  { code: "POBLACION", name: "Poblacion" },
  { code: "SAN_JOSE", name: "San Jose" },
  { code: "SAN_VICENTE", name: "San Vicente" },
  { code: "SANTA_LUCIA", name: "Santa Lucia" },
  { code: "SANTO_DOMINGO", name: "Santo Domingo" },
  { code: "SUGCONG", name: "Sugcong" },
  { code: "TIPUSO", name: "Tipuso" },
  { code: "TULONG", name: "Tulong" },
] as const

export type BarangayCode = (typeof BARANGAY_DATA)[number]["code"]
export type BarangayName = (typeof BARANGAY_DATA)[number]["name"]
