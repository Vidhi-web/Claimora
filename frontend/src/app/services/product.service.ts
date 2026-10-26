import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Product, CreateProductRequest, UpdateProductRequest } from '../models/product.model';
import { PaginatedResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly endpoint = '/products';
  private cachedDefaultProducts: PaginatedResponse<Product> | null = null;
  private cacheTime = 0;

  constructor(private api: ApiService) {}

  getProducts(query?: string, page: number = 0, size: number = 10, forceRefresh = false): Observable<PaginatedResponse<Product>> {
    const isDefault = (!query || query.trim().length === 0) && page === 0 && size === 10;
    const now = Date.now();
    if (!forceRefresh && isDefault && this.cachedDefaultProducts && (now - this.cacheTime) < 30000) {
      return of(this.cachedDefaultProducts);
    }

    const params: Record<string, string | number | undefined> = { page, size };
    if (query && query.trim().length > 0) {
      params['query'] = query.trim();
    }
    return this.api.get<PaginatedResponse<Product>>(this.endpoint, params as Record<string, string | number | boolean | undefined>).pipe(
      tap(res => {
        if (isDefault) {
          this.cachedDefaultProducts = res;
          this.cacheTime = Date.now();
        }
      })
    );
  }

  getProductById(id: number): Observable<Product> {
    return this.api.get<Product>(`${this.endpoint}/${id}`);
  }

  createProduct(request: CreateProductRequest): Observable<Product> {
    this.cachedDefaultProducts = null;
    return this.api.post<Product>(this.endpoint, request);
  }

  updateProduct(id: number, request: UpdateProductRequest): Observable<Product> {
    this.cachedDefaultProducts = null;
    return this.api.put<Product>(`${this.endpoint}/${id}`, request);
  }
}
