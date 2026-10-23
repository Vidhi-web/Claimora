import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Product, CreateProductRequest } from '../models/product.model';
import { PaginatedResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly endpoint = '/products';

  constructor(private api: ApiService) {}

  getProducts(query?: string, page: number = 0, size: number = 10): Observable<PaginatedResponse<Product>> {
    const params: Record<string, string | number | undefined> = { page, size };
    if (query && query.trim().length > 0) {
      params['query'] = query.trim();
    }
    return this.api.get<PaginatedResponse<Product>>(this.endpoint, params as Record<string, string | number | boolean | undefined>);
  }

  getProductById(id: number): Observable<Product> {
    return this.api.get<Product>(`${this.endpoint}/${id}`);
  }

  createProduct(request: CreateProductRequest): Observable<Product> {
    return this.api.post<Product>(this.endpoint, request);
  }
}
