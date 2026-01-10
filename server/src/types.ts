interface User {
  id: string;
  ws: any;
}

export interface UserWithDeviceDetails extends User {
  name?: string;
  deviceInfo?: {
    deviceName?: string;
    deviceModel?: string;
    manufacturer?: string;
  };
}
