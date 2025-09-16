import { BaseApiService } from './base';
import { buildQueryParams } from '../../utils/queryBuilder';

export interface CountryQueryParams {
  limit?: number;
  page?: number;
  filter_field?: string;
  filter_value?: string;
  sort_field?: string;
  sort_by?: 'asc' | 'desc';
  [key: string]: unknown;
}

export class CountryService extends BaseApiService {
  async getCountries(params?: CountryQueryParams) {
    const queryParams = buildQueryParams(params || {});
    const response = await this.api.get('/admin/location/v1/countries', { params: queryParams });
    return response.data;
  }

  async getCountry(countryId: number) {
    const response = await this.api.get(`/admin/location/v1/countries/${countryId}`);
    return response.data;
  }
}

export const countryService = new CountryService();
