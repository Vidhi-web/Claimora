export type DocumentType = 'INVOICE' | 'PHOTO_DAMAGE' | 'RECEIPT' | 'SERVICE_ESTIMATE';

export interface EvidenceDocument {
  documentId: number;
  claimId: number;
  documentType: DocumentType;
  filePath: string;
  fileHash: string;
  extractedData?: Record<string, unknown>;
  uploadDate?: string;
}

export interface EvidenceLink {
  findingId: number;
  documentId: number;
  evidenceRole: string;
  createdAt?: string;
}
