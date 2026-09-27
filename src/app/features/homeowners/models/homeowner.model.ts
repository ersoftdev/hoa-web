export type HomeownerStatus = 'Active' | 'Inactive';

export interface Homeowner {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  status: HomeownerStatus;
  isBoardMember: boolean;
  officerPosition: string | null;
  createdAt: string;
}

export interface CreateHomeownerRequest {
  fullName: string;
  email: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  password: string;
}

export interface UpdateHomeownerRequest {
  fullName: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
}

export interface SetHomeownerStatusRequest {
  status: HomeownerStatus;
  announcementId: string;
}
