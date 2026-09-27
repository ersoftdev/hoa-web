export interface BoardMembership {
  id: string;
  hoaYear: number;
  homeownerId: string;
  homeownerName: string;
  officerPosition: string | null;
}

export interface AddBoardMembershipRequest {
  hoaYear: number;
  homeownerId: string;
  officerPosition: string | null;
}
