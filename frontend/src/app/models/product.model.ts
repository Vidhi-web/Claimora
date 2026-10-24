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

/**
 * Reuses the same fields as CreateProductRequest for the PUT /api/products/{id} endpoint.
 * Kept as a separate type so the frontend can evolve the update contract independently
 * (e.g., making some fields optional, adding new ones) without touching the create flow.
 */
export interface UpdateProductRequest {
  serialNumber: string;
  model: string;
  purchaseDate: string;
  warrantyStart: string;
  warrantyEnd: string;
}
