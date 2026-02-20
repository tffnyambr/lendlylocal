import itemCameraBag from "@/assets/item-camera-bag.jpg";
import itemCamera from "@/assets/item-camera.jpg";
import itemJewelry from "@/assets/item-jewelry.jpg";
import itemDrone from "@/assets/item-drone.jpg";
import itemHandbag from "@/assets/item-handbag.jpg";
import itemBike from "@/assets/item-bike.jpg";
import itemDrill from "@/assets/item-drill.jpg";
import itemSpeaker from "@/assets/item-speaker.jpg";

export interface ListingItem {
  id: string;
  title: string;
  price: number;
  image: string;
  rating: number;
  location: string;
  category: string;
  owner: string;
  ownerAvatar: string;
  saved: boolean;
  tall?: boolean;
}

export interface BookingItem {
  id: string;
  itemTitle: string;
  itemImage: string;
  otherUser: string;
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  startDate: string;
  endDate: string;
  price: number;
  isLending?: boolean;
}

export interface MessageThread {
  id: string;
  userName: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
}

export const categories = [
  { id: "clothing", label: "Clothing", icon: "👗" },
  { id: "jewellery", label: "Jewellery", icon: "💎" },
  { id: "appliances", label: "Appliances", icon: "🏠" },
  { id: "vehicles", label: "Vehicles", icon: "🚗" },
  { id: "tech", label: "Tech", icon: "💻" },
  { id: "tools", label: "Tools", icon: "🔧" },
  { id: "events", label: "Event Supplies", icon: "🎉" },
  { id: "studio", label: "Studio Gear", icon: "🎬" },
];

export const listings: ListingItem[] = [
  { id: "1", title: "Vintage Leather Camera Bag", price: 12, image: itemCameraBag, rating: 4.9, location: "2.1 km", category: "studio", owner: "Sarah M.", ownerAvatar: "", saved: false, tall: true },
  { id: "2", title: "Canon DSLR Camera", price: 35, image: itemCamera, rating: 4.8, location: "3.4 km", category: "tech", owner: "James K.", ownerAvatar: "", saved: true },
  { id: "3", title: "Gold Necklace Set", price: 25, image: itemJewelry, rating: 5.0, location: "1.2 km", category: "jewellery", owner: "Amara L.", ownerAvatar: "", saved: false, tall: true },
  { id: "4", title: "DJI Mavic Drone", price: 55, image: itemDrone, rating: 4.7, location: "5.0 km", category: "tech", owner: "Mike R.", ownerAvatar: "", saved: false },
  { id: "5", title: "Designer Handbag", price: 18, image: itemHandbag, rating: 4.6, location: "0.8 km", category: "clothing", owner: "Olivia P.", ownerAvatar: "", saved: true, tall: true },
  { id: "6", title: "Mountain Bike", price: 30, image: itemBike, rating: 4.5, location: "4.2 km", category: "vehicles", owner: "Tom H.", ownerAvatar: "", saved: false },
  { id: "7", title: "Power Drill Set", price: 15, image: itemDrill, rating: 4.8, location: "1.8 km", category: "tools", owner: "Dave C.", ownerAvatar: "", saved: false, tall: true },
  { id: "8", title: "Bluetooth Speaker", price: 8, image: itemSpeaker, rating: 4.4, location: "3.1 km", category: "tech", owner: "Lisa N.", ownerAvatar: "", saved: false },
];

export const bookings: BookingItem[] = [
  { id: "b1", itemTitle: "Canon DSLR Camera", itemImage: itemCamera, otherUser: "James K.", status: "active", startDate: "Feb 10", endDate: "Feb 14", price: 140 },
  { id: "b2", itemTitle: "Mountain Bike", itemImage: itemBike, otherUser: "Tom H.", status: "pending", startDate: "Feb 18", endDate: "Feb 20", price: 60 },
  { id: "b3", itemTitle: "Designer Handbag", itemImage: itemHandbag, otherUser: "Olivia P.", status: "completed", startDate: "Jan 25", endDate: "Jan 28", price: 54 },
];

export const messages: MessageThread[] = [
  { id: "m1", userName: "James K.", avatar: "", lastMessage: "Sure, you can pick it up at 3pm!", time: "2m", unread: 2 },
  { id: "m2", userName: "Olivia P.", avatar: "", lastMessage: "Thanks for returning it in great condition 😊", time: "1h", unread: 0 },
  { id: "m3", userName: "Tom H.", avatar: "", lastMessage: "Is the bike still available for next weekend?", time: "3h", unread: 1 },
  { id: "m4", userName: "Amara L.", avatar: "", lastMessage: "I'll confirm the booking tonight", time: "1d", unread: 0 },
];
