export type ClaimStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'FLAGGED';

export interface Claim {
  claimId: number;
  productId: number;
  productModel?: string;
  productSerialNumber?: string;
  userId: number;
  claimantName?: string;
  claimNumber: string;
  claimDate: string;
  status: ClaimStatus;
  issueDescription: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClaimRequest {
  productId: number;
  userId: number;
  claimNumber: string;
  claimDate?: string;
  issueDescription: string;
}
