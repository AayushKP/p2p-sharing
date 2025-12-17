interface User {
  id: string;
  ws: any;
}

export interface UserWithDeviceDetails extends User {
  deviceInfo?: {
    deviceName?: string;
    deviceModel?: string;
    manufacturer?: string;
  };
}