import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Categoria {
  id: number;
  nome: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private apiUrl = '/api/categorias';

  constructor(private http: HttpClient) {}

  listarTodas(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }
}
