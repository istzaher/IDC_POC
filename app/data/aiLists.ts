// Comprehensive lists for AI suggestions in SAP Material Master Data

export const MATERIAL_TYPES = [
  { code: 'ZDRL', description: 'Drilling Materials' },
  { code: 'ZCHM', description: 'Chemical Materials' },
  { code: 'ZELE', description: 'Electrical Materials' },
  { code: 'ZPIP', description: 'Piping Materials' },
  { code: 'ZSTL', description: 'Steel Materials' },
  { code: 'ZCEM', description: 'Cement Materials' }
]

export const BASE_UNITS_OF_MEASURE = [
  { code: 'EA', description: 'Each' },
  { code: 'PCS', description: 'Pieces' },
  { code: 'KG', description: 'Kilogram' },
  { code: 'M', description: 'Meter' },
  { code: 'LTR', description: 'Liter' },
  { code: 'FT', description: 'Feet' },
  { code: 'BAG', description: 'Bag' },
  { code: 'MT', description: 'Metric Ton' },
  { code: 'L', description: 'Length' },
  { code: 'CM', description: 'Centimeter' },
  { code: 'MM', description: 'Millimeter' },
  { code: 'IN', description: 'Inch' },
  { code: 'GAL', description: 'Gallon' },
  { code: 'BBL', description: 'Barrel' }
]

export const INDUSTRY_SECTORS = [
  { code: 'O', description: 'Oil & Gas Industry' },
  { code: 'C', description: 'Chemical Industry' },
  { code: 'M', description: 'Manufacturing Industry' },
  { code: 'B', description: 'Construction Industry' },
  { code: 'E', description: 'Electrical Industry' },
  { code: 'P', description: 'Petrochemical Industry' },
  { code: 'R', description: 'Refinery Industry' }
]

export const MATERIAL_GROUPS = {
  ZDRL: [
    { code: '43JDX', description: 'SELF INDEXING GUIDE' },
    { code: '43KLM', description: 'DRILLING TOOLS' },
    { code: '43MNP', description: 'DRILL BITS' },
    { code: '43ABC', description: 'DRILL PIPES' },
    { code: '43DEF', description: 'DRILL COLLARS' },
    { code: '43GHI', description: 'DRILLING ACCESSORIES' }
  ],
  ZCHM: [
    { code: '44ABC', description: 'CHEMICAL COMPOUNDS' },
    { code: '44DEF', description: 'DRILLING FLUIDS' },
    { code: '44GHI', description: 'CEMENT ADDITIVES' },
    { code: '44JKL', description: 'CORROSION INHIBITORS' },
    { code: '44MNO', description: 'CLEANING CHEMICALS' },
    { code: '44PQR', description: 'PRODUCTION CHEMICALS' }
  ],
  ZELE: [
    { code: '45XYZ', description: 'ELECTRICAL COMPONENTS' },
    { code: '45UVW', description: 'CONTROL SYSTEMS' },
    { code: '45RST', description: 'POWER SUPPLIES' },
    { code: '45ABC', description: 'CABLES & WIRING' },
    { code: '45DEF', description: 'INSTRUMENTATION' },
    { code: '45GHI', description: 'ELECTRICAL PANELS' }
  ],
  ZPIP: [
    { code: '46ABC', description: 'STEEL PIPES' },
    { code: '46DEF', description: 'PIPE FITTINGS' },
    { code: '46GHI', description: 'VALVES' },
    { code: '46JKL', description: 'FLANGES' },
    { code: '46MNO', description: 'GASKETS' },
    { code: '46PQR', description: 'PIPE SUPPORTS' }
  ],
  ZSTL: [
    { code: '47ABC', description: 'STRUCTURAL STEEL' },
    { code: '47DEF', description: 'STEEL BARS' },
    { code: '47GHI', description: 'STEEL PLATES' },
    { code: '47JKL', description: 'STEEL TUBES' },
    { code: '47MNO', description: 'STEEL FASTENERS' },
    { code: '47PQR', description: 'STEEL MESH' }
  ],
  ZCEM: [
    { code: '48ABC', description: 'PORTLAND CEMENT' },
    { code: '48DEF', description: 'CEMENT ADDITIVES' },
    { code: '48GHI', description: 'CONCRETE MIX' },
    { code: '48JKL', description: 'CEMENT SLURRY' },
    { code: '48MNO', description: 'GROUT MATERIALS' },
    { code: '48PQR', description: 'CEMENT RETARDERS' }
  ]
}

// Keywords for intelligent matching
export const MATERIAL_KEYWORDS = {
  ZDRL: ['drill', 'drilling', 'bit', 'pipe', 'collar', 'guide', 'tool', 'bore', 'hole'],
  ZCHM: ['chemical', 'fluid', 'cement', 'additive', 'compound', 'inhibitor', 'cleaning', 'production'],
  ZELE: ['electrical', 'cable', 'wire', 'power', 'control', 'system', 'panel', 'instrument'],
  ZPIP: ['pipe', 'piping', 'fitting', 'valve', 'flange', 'gasket', 'support', 'tube'],
  ZSTL: ['steel', 'structural', 'bar', 'plate', 'fastener', 'mesh', 'metal', 'iron'],
  ZCEM: ['cement', 'concrete', 'portland', 'grout', 'slurry', 'retarder', 'mix']
}

export const UNIT_KEYWORDS = {
  EA: ['each', 'piece', 'item', 'unit', 'component', 'part'],
  PCS: ['pieces', 'parts', 'components', 'items'],
  KG: ['kilogram', 'weight', 'mass', 'powder', 'chemical', 'additive'],
  M: ['meter', 'length', 'pipe', 'cable', 'wire', 'rod', 'bar'],
  LTR: ['liter', 'liquid', 'fluid', 'chemical', 'oil'],
  FT: ['feet', 'foot', 'length', 'pipe', 'cable'],
  BAG: ['bag', 'sack', 'cement', 'powder', 'additive'],
  MT: ['metric ton', 'tonne', 'bulk', 'steel', 'cement'],
  BBL: ['barrel', 'oil', 'chemical', 'fluid'],
  GAL: ['gallon', 'liquid', 'paint', 'chemical']
}

export const INDUSTRY_KEYWORDS = {
  O: ['oil', 'gas', 'petroleum', 'drilling', 'upstream', 'downstream', 'refinery'],
  C: ['chemical', 'petrochemical', 'process', 'reaction', 'catalyst'],
  M: ['manufacturing', 'production', 'assembly', 'fabrication'],
  B: ['construction', 'building', 'infrastructure', 'concrete', 'structural'],
  E: ['electrical', 'power', 'energy', 'electronics', 'instrumentation'],
  P: ['petrochemical', 'refining', 'processing', 'distillation'],
  R: ['refinery', 'refining', 'crude', 'distillation', 'processing']
} 