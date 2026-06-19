// Map common Bangladesh cities to their division (state equivalent for Meta CAPI).
// Lowercase keys; matched after normalizing the user-entered city.
const CITY_TO_DIVISION: Record<string, string> = {
  dhaka: 'dhaka',
  savar: 'dhaka',
  gazipur: 'dhaka',
  narayanganj: 'dhaka',
  tangail: 'dhaka',
  manikganj: 'dhaka',
  munshiganj: 'dhaka',
  narsingdi: 'dhaka',
  faridpur: 'dhaka',
  kishoreganj: 'dhaka',
  madaripur: 'dhaka',
  rajbari: 'dhaka',
  shariatpur: 'dhaka',
  gopalganj: 'dhaka',

  chittagong: 'chittagong',
  chattogram: 'chittagong',
  comilla: 'chittagong',
  cumilla: 'chittagong',
  feni: 'chittagong',
  brahmanbaria: 'chittagong',
  chandpur: 'chittagong',
  lakshmipur: 'chittagong',
  noakhali: 'chittagong',
  coxsbazar: 'chittagong',
  'cox\'s bazar': 'chittagong',
  bandarban: 'chittagong',
  rangamati: 'chittagong',
  khagrachari: 'chittagong',

  sylhet: 'sylhet',
  moulvibazar: 'sylhet',
  habiganj: 'sylhet',
  sunamganj: 'sylhet',

  rajshahi: 'rajshahi',
  bogura: 'rajshahi',
  bogra: 'rajshahi',
  pabna: 'rajshahi',
  sirajganj: 'rajshahi',
  natore: 'rajshahi',
  naogaon: 'rajshahi',
  joypurhat: 'rajshahi',
  chapainawabganj: 'rajshahi',

  rangpur: 'rangpur',
  dinajpur: 'rangpur',
  kurigram: 'rangpur',
  gaibandha: 'rangpur',
  lalmonirhat: 'rangpur',
  nilphamari: 'rangpur',
  panchagarh: 'rangpur',
  thakurgaon: 'rangpur',

  khulna: 'khulna',
  jessore: 'khulna',
  jashore: 'khulna',
  satkhira: 'khulna',
  bagerhat: 'khulna',
  kushtia: 'khulna',
  magura: 'khulna',
  meherpur: 'khulna',
  narail: 'khulna',
  chuadanga: 'khulna',
  jhenaidah: 'khulna',

  barisal: 'barisal',
  barishal: 'barisal',
  bhola: 'barisal',
  patuakhali: 'barisal',
  pirojpur: 'barisal',
  barguna: 'barisal',
  jhalokati: 'barisal',

  mymensingh: 'mymensingh',
  jamalpur: 'mymensingh',
  netrokona: 'mymensingh',
  sherpur: 'mymensingh',
};

export function cityToDivision(city: string): string | undefined {
  const key = city.trim().toLowerCase().replace(/\s+/g, '');
  if (CITY_TO_DIVISION[key]) return CITY_TO_DIVISION[key];
  const spaced = city.trim().toLowerCase();
  return CITY_TO_DIVISION[spaced];
}
