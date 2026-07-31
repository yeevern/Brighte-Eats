// Service types the customer can express interest in
export const SERVICE_TYPES = ['delivery', 'pick-up', 'payment'] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export interface Lead {
  id: number;
  name: string;
  email: string;
  mobile: string;
  postcode: string;
  services: ServiceType[];
  created_at: string;
}
