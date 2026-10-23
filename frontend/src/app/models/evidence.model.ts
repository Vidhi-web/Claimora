export type DocumentType = 'INVOICE' | 'REPAIR_REPORT' | 'PARTS_INVOICE' | 'PHOTO';
export type OcrStatus = 'PENDING' | 'PROCESSED' | 'FAILED' | 'MANUAL';

export interface EvidenceDocument {
  documentId: number;
  claimId: number;
  claimNumber?: string;
  documentType: DocumentType;
  filePath: string;
  fileHash: string;
  originalFilename?: string;
  mimeType?: string;
  fileSize?: number;
  ocrStatus: OcrStatus;
  extractedData?: string;
  uploadDate?: string;
}

export interface UpdateExtractedDataRequest {
  extractedData: string;
  reason?: string;
}
