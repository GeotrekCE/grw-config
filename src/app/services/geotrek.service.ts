import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class GeotrekService {
    private http = inject(HttpClient);

    private getResource(apiUrl: string, resource: string): Observable<any> {
        const base = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;
        return this.http.get(`${base}${resource}`).pipe(
            catchError(err => {
                console.error(`Failed to fetch ${resource}`, err);
                return of({ results: [] });
            })
        );
    }

    getDistricts(apiUrl: string): Observable<any> {
        return this.getResource(apiUrl, 'district');
    }

    getThemes(apiUrl: string): Observable<any> {
        return this.getResource(apiUrl, 'theme');
    }

    getPractices(apiUrl: string): Observable<any> {
        return this.getResource(apiUrl, 'trek_practice');
    }

    getStructures(apiUrl: string): Observable<any> {
        return this.getResource(apiUrl, 'structure');
    }

    getCities(apiUrl: string): Observable<any> {
        return this.getResource(apiUrl, 'city');
    }

    getPortals(apiUrl: string): Observable<any> {
        return this.getResource(apiUrl, 'portal');
    }

    getRoutes(apiUrl: string): Observable<any> {
        return this.getResource(apiUrl, 'trek_route');
    }

    getLabels(apiUrl: string): Observable<any> {
        return this.getResource(apiUrl, 'label');
    }
}
