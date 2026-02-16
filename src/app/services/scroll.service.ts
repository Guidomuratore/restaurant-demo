import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ScrollService {
    private isAutoScrollingSubject = new BehaviorSubject<boolean>(false);
    isAutoScrolling$ = this.isAutoScrollingSubject.asObservable();

    setScrolling(isScrolling: boolean) {
        this.isAutoScrollingSubject.next(isScrolling);
    }
}
