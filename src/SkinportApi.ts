export default class SkinportApi {
  static apiOrigin: string = 'https://api.skinport.com';

  static baseHeaders: object = { 'Content-Type': 'application/json' };

  static init({ url }) {
    this.apiOrigin = url;
  }

  static getItems() {
    return fetch(`${this.apiOrigin}/v1/items?app_id=730&currency=EUR&tradable=1`, { method: 'GET', headers: { ...this.baseHeaders } }
    ).then((response) => {
      if (response.status >= 400) {
        throw new Error(response.statusText);
      }
      return response.json();
    });
  }
}
