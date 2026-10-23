export interface Product {
  productId: number;
  serialNumber: string;
  model: string;
  purchaseDate: string;
  warrantyStart: string;
  warrantyEnd: string;
  createdAt?: string;
}

export interface CreateProductRequest {
  serialNumber: string;
  model: string;
  purchaseDate: string;
  warrantyStart: string;
  warrantyEnd: string;
}
