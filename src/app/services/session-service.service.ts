import { Injectable } from '@angular/core';

export class SessionStorageModel {
  UserId: string = '';
}

@Injectable({
  providedIn: 'root',
})
export class SessionServiceService {
  private sessionStorgaeModel: SessionStorageModel = new SessionStorageModel();
  private businessRules;
  constructor() {}
  public discountCodes = [
    {
      discountType: 'null',
      discountDescription: 'No Discount Amount',
      discode: 'null',
      amount: '',
    },
    {
      discountType: '4',
      discountDescription: 'Repeat Attendee Monetary Amount',
      discode: 'amount',
      amount: '',
    },
    {
      discountType: '5',
      discountDescription: 'Repeat Attendee Percentage',
      discode: 'percent',
      amount: '',
    },
    {
      discountType: '6',
      discountDescription: 'Registration Type Discount Monetary Amount',
      discode: 'amount',
      amount: '',
    },
    {
      discountType: '7',
      discountDescription: 'Registration Type Discount Percentage',
      discode: 'percent',
      amount: '',
    },
    {
      discountType: '8',
      discountDescription: 'Option/Session Detail Monetary Amount',
      discode: 'amount',
      amount: '',
    },
    {
      discountType: '9',
      discountDescription: 'Option/Session Detail Percentage',
      discode: 'percent',
      amount: '',
    },
    {
      discountType: '10',
      discountDescription: 'Promo Code Monetary Amount',
      discode: 'amount',
      amount: '',
    },
    {
      discountType: '11',
      discountDescription: 'Promo Code Percentage',
      discode: 'percent',
      amount: '',
    },
  ];

  private discount_category_subcategory = {
    Agriculture: ['Agriculture & Farming'],
    'Aerospace & Aviation': ['Airport Experience'],
    Industrial: [
      'Aluminum',
      'Cleaning services',
      'Industrial',
      'Industrial-Fence',
      'Industrial-Builders',
      'Industrial-Chemical Analysis',
      'Industrial-EScrap',
      'Industrial-Fabric',
      'Industrial-FacilitiesMgmt',
      'Industrial-Fasteners',
      'Industrial-Fence',
      'Industrial-Fence',
      'Industrial-Filtration',
      'Industrial-Gear',
      'Industrial-Green Tech',
      'Industrial-Hydrovision',
      'Industrial-Petroleum',
      'Industrial-Pipeline',
      'Industrial-Pipeline Mgmt',
      'Industrial-Pipeline Delivery',
      'Industrial-Pipeline Repair',
      'Industrial-Printing',
      'Industrial-Regrigeration',
      'Industrial-Specialty Chemical',
      'Industrial-Pump TurboMachines',
      'Industry - Clubs',
      'Industry - Events',
      'Industry- Inside Self Storage',
      'Industry- Live Design and production',
      'Industry- Residential Contruction',
      'Metal Casting',
      'Metalworking',
      'Mining',
      'Weld-Metalworking',
      'Woodworking',
    ],
    Amusement: [
      'Amusement',
      'Amusement-Golf',
      'Amusement-Hunting',
      'Amusement-Racquet',
      'Amusement-Sports',
    ],
    Science: ['Analytical & Applied Science'],
    Architecture: [
      'Architecture',
      'Architecture-Design',
      'Architecture-Landscape',
    ],
    Business: [
      'Association-Training',
      'Attendee-Acquisition',
      'Defense-Aerospace',
      'HR MGMT',
      'Professional Service',
      'Rentals',
      'Travel',
      'Vendors',
    ],
    Automotive: [
      'Automotive',
      'Automotive-EV',
      'Automotive-Racing',
      'Automotive-Tech',
      'Automotive-Truck',
    ],
    Retail: [
      'Beverage-Tea',
      'Retail-Bar',
      'Retail-Beverage',
      'Retail-Boat sales',
      'Retail-Books',
      'Retail-Clothes',
      'Retail-Coffee',
      'Retail-Cruises',
      'Retail-Diving Equip',
      'Retail-Drug Stores',
      'Retailers-Opthalmic',
      'Retail-Florists',
      'Retail-Food Service',
      'Retail-Gift & souvenirs',
      'Retail-Global Business Travel',
      'Retail-Hardware',
      'Retail-Hearth patio barbecue',
      'Retail-Heavy Duty Equip',
      'Retail-Jewelers',
      'Retail-Jewelry',
      'Retail-Landscaping',
      'Retail-Merchandise',
      'Retail-Merchants',
      'Retail-Petfood & Products',
      'Retail-Pharmaceuticals',
      'Retail-Pharmacy',
      'Retail-Produce',
      'Retail-Restaurants',
      'Retail-Toys',
    ],
    'Brand Licensing': [
      'Brand Licensing',
      'Brand Licensing - Clothing',
      'Brand Licensing - Retail',
      'Brand Licensing - Marketing',
    ],
    'Building & Construction': [
      'Builders-Home Improvement',
      'Building Owners',
      'Building-Concrete',
      'Building-Pools & Spas',
      'Building-Remodeling',
      'Building-Roofing',
      'Building-Supply',
      'Building-Surfaces',
      'Construction',
      'Construction -HVAC',
      'Plumbing',
    ],
    'Food & Beverage': ['Catering'],
    Mining: ['Coal Prep & Aggregates'],
    'Consumer Electronics': ['Consumer Electronics'],
    Technology: [
      'Data centers',
      'Technology-Cybersecurity',
      'Technology-Audiovisual',
      'Technology-Automated Control Systems',
      'Technology-Distribution',
      'Technology-Electronics',
      'Technology-Event',
      'Technology-Information Security',
      'Technology-Legal',
      'Technology-Marine',
      'Technology-Medical Devices',
      'Technology-Oil Sands Production & Recycling',
      'Technology-Oil Production',
      'Technology-Oprical Fiber',
      'Technology-Packaging',
      'Technology-Recycling',
      'Technology-SemiConductor',
      'Technology-Trenchless',
      'Technology-Video/ VR',
      'Technology-Wireless Inbuilding Networks',
      'Water Energy',
      'Wind and Solar Energy',
      'Nuclear Energy',
    ],
    Education: [
      'Education Training Science & Research',
      'Education-Diversity',
      'Education-Gifted&Talented',
      'Education-Montesori',
      'Education-Music',
    ],
    Entertainment: [
      'Entertainment-Electronic',
      'Entertainment-Gaming',
      'Entertainment-Music',
    ],
    'Exhibit&Convention': [
      'Exhibit&Convention',
      'Exhibit-Builders',
      'Exhibit-ChurchCommunity',
      'Exhibit-Clothes',
      'Exhibit-ClothesDesign',
      'Exhibit-Education',
      'Exhibit-Firefighting',
      'Exhibit-Florist',
      'Exhibit-Food',
      'Exhibit-FoodSvc',
      'Exhibit-GreenBuild',
      'Exhibit-Jewelry',
      'Exhibit-Music',
      'Exhibit-Optometrists',
      'Exhibit-Travel',
      'Exhibit-Vision',
      'Exhibit-Waste&Recycle',
      'Safety Conference / Event',
    ],
    Farming: ['Farmers-Conference'],
    Finance: ['Finance-OPHARMA', 'Fundraising'],
    Investment: [
      'Finance-Investment',
      'Finance-Investment',
      'Finance-Investment',
      'Finance-Investment',
      'Investing- Biotechnology',
    ],
    'Emergency Services': [
      'Firefighting-Engineering',
      'Response-Police',
      'Response-Fire',
      'Response-EMS',
      'Safety Equipment',
    ],
    'Food & Nutrition': [
      'Food',
      'Food & Beverage',
      'Food Catering',
      'Food Products',
      'Food Processing',
      'Food Delivery',
      'Food Digital Ordering',
      'Food Marketing',
      'Food-Grocers',
      'Food-NaturalProd',
      'Food-Nutrition',
      'Food-Powder Bulk',
    ],
    'Health Care': [
      'Health Care',
      'Health&Safety',
      'Health-Airquality',
      'Health-Fitness',
      'Health-Healthcare',
      'Health-Nutrition',
      'Health-Personal Care',
    ],
    Housing: ['Housing-Seniors'],
    Travel: ['Hotel'],
    Library: ['Librarian- Conf', 'School-Librarians'],
    Manufacturing: ['Manufacturing', 'Manufacturing-Biomed'],
    Medical: [
      'Medical & Healthcare Products',
      'Medical-AIDS',
      'Medical-Anesthesia',
      'Medical-Anesthesiology',
      'Medical-Bio Devices',
      'Medical-Biotech',
      'Medical-Bone Mineral',
      'Medical-Cancer',
      'Medical-Chest',
      'Medical-Cochlear Implants',
      'Medical-Comb Otolaryngological',
      'Medical-Dental',
      'Medical-Emergency Medical',
      'Medical-Emergency Nursing',
      'Medical-Emergency Services',
      'Medical-Endourology',
      'Medical-FIME',
      'Medical-Gerontology',
      'Medical-Gerontology Inpatient Svc',
      'Medical-Heart',
      'Medical-Imaging',
      'Medical-Infection Control',
      'Medical-Nursing',
      'Medical-Optometry',
      'Medical-Orthopeadic',
      'Medical-Pharma Bio Tech',
      'Medical-Plastic Surgery',
      'Medical-Spine',
      'Medical-Sports Medicine',
      'Medical-Stem cell Research',
      'Medical-Surgeons',
      'Medical-Surgical',
      'Medical-Trauma Qty',
      'Medical-Urologists',
      'Medical-Vascular',
      'Medical-Veterinary',
      'Surgical-Training',
    ],
    'Energy & Power': ['Power Generation'],
    Transportation: [
      'Automotive Transportation',
      'Aviation Transportation',
      'Water Transportation',
      'Space Transportation',
    ],
    'AEROSPACE & AVIATION': ['AEROSPACE PRODUCTS', 'AVIATION PRODUCTS'],
    'AGRICULTURE & FARMING': ['AGRICULTURE AIDS', 'FARMING AIDS'],
    ENTERTAINMENT: [
      'AMUSEMENT PRODUCTS',
      'ENTERTAINMENT PRODUCTS',
      'GAMING PRODUCTS',
    ],
    RETAIL: ['APPAREL PRODUCTS', 'BEAUTY PRODUCTS'],
    TRANSPORTATION: ['AUTOMOTIVE', 'TRUCKING', 'TRANSPORTATION PRODUCTS'],
    BUSINESS: [
      'BUSINESS',
      'HOME FURNISHINGS',
      'INTERIOR DESIGN SERVICES',
      'LANDSCAPING SERVICES',
    ],
    'COMMUNICATIONS & BROADCASTING': [
      'COMMUNICATIONS PRODUCTS',
      'BROADCASTING',
    ],
    'COMPUTERS & SOFTWARE APPLICATIONS': [
      'SOFTWARE APPLICATIONS',
      'SECURITY & HOME AUTOMATION',
      'AI & ML SERVICES',
      'DEVELOPMENT AIDS',
    ],
    'CONSUMER GOODS & RETAIL TRADE': ['INNOVATION PRODUCTS', 'RETAIL TRENDS'],
    DENTAL: ['DENTAL SERVICES', 'DENTAL PRODUCTS'],
    EDUCATION: ['EDUCATION', 'TRAINING'],
    'ELECTRICAL & ELECTRONICS': ['ELECTRICAL & ELECTRONICS'],
    'EXHIBITION & MEETING INDUSTRY': ['EXHIBITION & MEETING INDUSTRY'],
    'FINANCIAL INSURANCE & LEGAL SERVICES': [
      'FINANCIAL INSURANCE & LEGAL SERVICES',
    ],
    'FOOD & BEVERAGE': ['FOOD SERVICES', 'HEALTH FOODS'],
    'GOVERNMENT & MILITARY': ['GOVERNMENT', 'MILITARY'],
    INDUSTRIAL: ['INDUSTRIAL', 'WASTE MANAGEMENT SERVICES'],
    'INDUSTRIAL-FACILITIESMGMT': ['INDUSTRIAL PRODUCTS', 'FACILITIES MGMT'],
    'INVESTMENT/ FINANCIAL SERVICES': ['INVESTMENT', 'FINANCIAL SERVICES'],
    JEWELRY: ['JEWELRY PRODUCTS', 'JEWELRY RETAIL'],
    'MANAGEMENT RESOURCES': [
      'MANAGEMENT',
      'HUMAN RESOURCES',
      'NETWORKING PRODUCTS',
    ],
    'MANUFACTURING & PACKAGING': ['MANUFACTURING & PACKAGING'],
    'MEDICAL & HEALTHCARE PRODUCTS': [
      'HEALTHCARE PRODUCTS',
      'MEDICAL PRODUCTS',
    ],
    MINING: ['MINING'],
    PHARMACEUTICALS: ['PHARMACEUTICAL PRODUCTS', 'PHARMACEUTICAL DIGITAL AIDS'],
    'POLICE/ FIRE/ SECURITY & EMERGENCY SERVICES': ['EMERGENCY SERVICES'],
    'PRINTING/ GRAPHICS/ PHOTOGRAPHY & PUBLISHING': [
      'PRINTING/ GRAPHICS/ PHOTOGRAPHY & PUBLISHING',
    ],
    'SPORTING GOODS & RECREATION': ['SPORTING GOODS & RECREATION'],
    'DIGITAL RECREATION': ['SPORTING GOODS & RECREATION'],
    'TOYS  HOBBIES & GIFTS': [
      'TOYS',
      'ELECTRONIC GAMES',
      'ENTERTAINMENT DIGITAL AIDS',
      'STIMULATION PRODUCTS',
    ],
    'TRAVEL HOTELS & RESTAURANTS': ['TRAVEL HOTELS & RESTAURANTS'],
    VETERINARY: [
      'VETERINARY SCIENCE',
      'VETERINARY HEALTH CARE',
      'VETERINARY DIGITAL AIDS',
    ],
    POWER: ['WATER PRODUCTS', 'ENERGY PRODUCTS', 'POWER STORAGE PRODUCTS'],
  };

  public getDiscountCategories() {
    return Object.keys(this.discount_category_subcategory);
  }

  public getDiscountSubcategories(categorytype) {
    return this.discount_category_subcategory[categorytype];
  }

  public set(key: string, value: any) {
    this.sessionStorgaeModel[key] = value;
  }
  get(key: string): any {
    return this.sessionStorgaeModel[key];
  }
  remove(key: string) {
    this.sessionStorgaeModel[key] = null;
  }
  clear() {
    this.sessionStorgaeModel = new SessionStorageModel();
  }
}
