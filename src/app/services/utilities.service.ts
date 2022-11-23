import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {

  constructor() { }

  camelToKebab(str: string) {
    return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
  }

  kebabToCamel(str: string) {
    return str.replace(/-./g, x=>x[1].toUpperCase());
  }

  isJson(item) {
    item = typeof item !== "string"
        ? JSON.stringify(item)
        : item;
    try {
        item = JSON.parse(item);
    } catch (e) {
        return false;
    }
    if (typeof item === "object" && item !== null) {
        return true;
    }
    return false;
  }
}
