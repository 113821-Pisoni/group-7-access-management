import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {VisitorAuthorizationRequest} from "../models/authorizeRequest.model";
import {Auth} from "../models/authorize.model";
import {AccessModel} from "../models/access.model";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8001/auths';

  constructor(private http: HttpClient) { }

  createAuth(ownerData: any, userId: string): Observable<VisitorAuthorizationRequest> {
    const headers = new HttpHeaders({
      'x-user-id': userId
    });

    return this.http.post<VisitorAuthorizationRequest>(this.apiUrl + '/authorization', ownerData, { headers });
  }

  updateAuth(ownerData: any, userId: string): Observable<VisitorAuthorizationRequest> {
    const headers = new HttpHeaders({
      'x-user-id': userId
    });

    return this.http.put<VisitorAuthorizationRequest>(this.apiUrl + '/authorization', ownerData, { headers });
  }

  getAll(page: number, size: number, isActive?: boolean): Observable<Auth[]> {
    return this.http.get<Auth[]>(this.apiUrl, {
      params: { size: 1000000 }
    });
  }

  getValid(document: number): Observable<Auth[]> {
    return this.http.get<Auth[]>(this.apiUrl + '/authorization/' + document.toString());
  }

  getValidAuths(document: number): Observable<Auth[]> {
    return this.http.get<Auth[]>(this.apiUrl + '/valid?docNumber=' + document.toString());
  }

  getByDocument(document: number): Observable<Auth[]> {
    return this.http.get<Auth[]>(this.apiUrl + '?docNumber=' + document.toString());
  }
  getById(document: number): Observable<Auth[]> {
    return this.http.get<Auth[]>(this.apiUrl + '?id=' + document.toString());
  }

  delete(authId: number, userId: number): Observable<any> {
    const headers = new HttpHeaders({
      'x-user-id': userId,
      'auth-id': authId
    });

    return this.http.delete<any>(this.apiUrl + '/authorization', { headers });
  }

  enable(authId: number, userId: number): Observable<any> {
    const headers = new HttpHeaders({
      'x-user-id': userId,
      'auth-id': authId
    });

    return this.http.put<any>(this.apiUrl + '/authorization/activate',null, { headers });
  }
}
