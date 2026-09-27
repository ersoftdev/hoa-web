export interface OfficerPosition {
  id: string;
  title: string;
  createdAt: string;
}

export interface CreateOfficerPositionRequest {
  title: string;
}

export interface UpdateOfficerPositionRequest {
  title: string;
}
