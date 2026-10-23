import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  User,
  AdminCreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  Role,
  UserStatus,
  Page
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = '/api/users';

  constructor(private http: HttpClient) {}

  getUsers(search = '', page = 0, size = 10, sortBy = 'userId', direction = 'DESC'): Observable<Page<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('direction', direction);

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<Page<User>>(this.baseUrl, { params });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  createUser(request: AdminCreateUserRequest): Observable<User> {
    return this.http.post<User>(this.baseUrl, request);
  }

  updateUser(id: number, request: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, request);
  }

  updateStatus(id: number, status: UserStatus): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${id}/status`, { status });
  }

  updateRole(id: number, role: Role): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${id}/role`, { role });
  }

  changePassword(request: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/me/password`, request);
  }
}
