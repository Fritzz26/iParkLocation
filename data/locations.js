import AranetaImage from "../assets/AranetaCity.png";
import FishermallImage from "../assets/FisherMall.jpg";
import RobinsonsGalleriaImage from "../assets/RobinsonsGalleria.jpg";
import RobinsonsOPUSImage from "../assets/RobinsonsOPUS.jpg";

export const locations = [
  {
    id: 1,
    name: "Araneta Center-Cubao",
    latitude: 14.619393707991433,
    longitude: 121.05112139135733,
    address: "632 1, Cubao, Quezon City, Metro Manila, Philippines",
    parkingType: "Slot Parking",
    openingHours: "Opening Hours: 10:00 AM - 9:00 PM",
    rentDetails: "Rent Type: Hourly Rent\n\nInitial Charge: P30 First 3 Hours\n\nSucceeding Charges: P50 Every 1 Hour",
    image: AranetaImage,
  },
  {
    id: 2,
    name: "Fisher Mall",
    latitude: 14.633831778691539,
    longitude: 121.01959459662747,
    address: "Quezon Ave, Quezon City, 1104 Metro Manila, Philippines",
    parkingType: "Slot Parking",
    openingHours: "Opening Hours: 10:00 AM - 9:00 PM",
    rentDetails: "Rent Type: Hourly Rent\n\nInitial Charge: P30 First 3 Hours\nSucceeding Charges: P50 Every 1 Hour",
    image: FishermallImage,
  },
  {
    id: 3,
    name: "Robinsons Galleria Ortigas",
    latitude: 14.591061417237345,
    longitude: 121.05983821118569,
    address: "Ortigas Ave, Ortigas Center, Quezon City, Metro Manila, Philippines",
    parkingType: "Slot Parking",
    openingHours: "Opening Hours: 10:00 AM - 9:00 PM",
    rentDetails: "Rent Type: Hourly Rent\n\nInitial Charge: P30 First 3 Hours\n\nSucceeding Charges: P50 Every 1 Hour",
    image: RobinsonsGalleriaImage,
  },
  {
    id: 4,
    name: "Opus Mall",
    latitude: 14.593264342773113,
    longitude: 121.08024890163165,
    address: "Bridgetowne Destination Estate, Opus, Bridgetowne Blvd, corner C-5, Quezon City, Philippines",
    parkingType: "Slot Parking",
    openingHours: "Opening Hours: 10:00 AM - 9:00 PM",
    rentDetails: "Rent Type: Hourly Rent\n\nInitial Charge: P30 First 3 Hours\n\nSucceeding Charges: P50 Every 1 Hour",
    image: RobinsonsOPUSImage,
  },
];