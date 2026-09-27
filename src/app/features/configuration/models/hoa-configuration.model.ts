export interface HoaConfiguration {
  operationYear: number;
  maxBoardMembers: number;
  requiredOfficerCount: number;
  registrationOpen: boolean;
  paymentGracePeriodDays: number;
  currencySymbol: string;
  updatedAt: string;
  updatedBy: string | null;
}

export interface UpdateHoaConfigurationRequest {
  operationYear: number;
  maxBoardMembers: number;
  requiredOfficerCount: number;
  registrationOpen: boolean;
  paymentGracePeriodDays: number;
  currencySymbol: string;
}
