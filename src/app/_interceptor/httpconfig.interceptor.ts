import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
    constructor(
        private router: Router,
        private auth: AuthService
    ) { }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const keycloakToken: string = localStorage.getItem('keycloakToken');
        request = request.clone({ headers: request.headers.set('Access-Control-Allow-Origin', '*') });
        request = request.clone({ headers: request.headers.set('Access-Control-Allow-Methods', 'DELETE, POST, GET, PUT') });
        request = request.clone({ headers: request.headers.set('Access-Control-Allow-Credentials', 'true') });
        request = request.clone({ headers: request.headers.set("Access-Control-Allow-Headers", "Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization") });
        request = request.clone({ headers: request.headers.set('Access-Control-Max-Age', '3600') });

        if (request.url.includes("/auth/admin/realms") && keycloakToken) {
            request = request.clone({ headers: request.headers.set('Authorization', 'Bearer ' + keycloakToken) });
        }

        request = request.clone({ headers: request.headers.set('Set-Cookie', 'SameSite=None; Secure') });
        request = request.clone({ headers: request.headers.set('Accept', 'application/json') });

        return next.handle(request).pipe(
            map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                }
                return event;
            }),
            catchError((error: HttpErrorResponse) => {
                console.log('interceptor error: ', error)
                if (error?.error?.status === 401 || error.status === 401) {
                    // this.auth.logout();
                }
                let data = {};
                data = {
                    reason: error && error.error && error.error.message ? error.error.message : '',
                    status: error.status
                };
                return throwError(error);
            }));
    }
}