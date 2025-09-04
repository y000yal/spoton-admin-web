import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { sportService } from '../../services/api/sports';
import { extractErrorMessage } from '../../utils/errorHandler';
import type { Sport, CreateSportRequest, UpdateSportRequest, PaginatedResponse } from '../../types';

interface SportState {
  sports: PaginatedResponse<Sport> | null;
  currentSport: Sport | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    page: number;
    limit: number;
    search: string;
    status: string;
  };
}

const initialState: SportState = {
  sports: null,
  currentSport: null,
  isLoading: false,
  error: null,
  filters: {
    page: 1,
    limit: 10,
    search: '',
    status: '',
  },
};

// Async thunks
export const fetchSports = createAsyncThunk(
  'sports/fetchSports',
  async (params: { 
    page: number; 
    limit: number; 
    filter_field?: string;
    filter_value?: string;
    sort_field?: string;
    sort_by?: 'asc' | 'desc';
    forceRefresh?: boolean;
    [key: string]: any; // Allow dynamic filter keys like filter[name]
  }, { rejectWithValue, getState }) => {
    const state = getState() as { sports: SportState };
    const existingSports = state.sports.sports;
    
    // Check if there are any filter parameters (including dynamic ones like filter[name])
    const hasFilters = Object.keys(params).some(key => 
      key.startsWith('filter[') || 
      params.filter_field || 
      params.filter_value || 
      params.sort_field
    );
    
    // Check if page size has changed (this should trigger a new fetch)
    const hasPageSizeChange = existingSports && 
      existingSports.per_page !== params.limit;
    
    // Don't fetch if we already have sports and no specific filters are applied and no force refresh is requested and no page size change
    if (existingSports && !hasFilters && !params.forceRefresh && !hasPageSizeChange) {
      console.log("🔄 fetchSports: Returning existing sports (no filters, no force refresh, no page size change)");
      return existingSports;
    }
    
    if (hasPageSizeChange) {
      console.log("🔄 fetchSports: Page size changed - fetching fresh data");
    }
    
    if (params.forceRefresh) {
      console.log("🔄 fetchSports: Force refresh requested - fetching fresh data");
    }
    
    try {
      // Map frontend parameters to backend format
      const apiParams: any = { ...params };
      
      // Add sorting if provided
      if (params.sort_field) {
        apiParams.sort_field = params.sort_field;
        apiParams.sort_by = params.sort_by || 'asc';
      }
      
      console.log("🔄 fetchSports: Making API call to getSports with params:", apiParams);
      const response = await sportService.getSports(apiParams);
      console.log("🔄 fetchSports: API response received");
      return response;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchSport = createAsyncThunk(
  'sports/fetchSport',
  async (sportId: number, { rejectWithValue, getState }) => {
    const state = getState() as { sports: SportState };
    const existingSport = state.sports.currentSport;
    
    // Don't fetch if we already have the same sport
    if (existingSport && existingSport.id === sportId) {
      return existingSport;
    }
    
    try {
      const response = await sportService.getSport(sportId);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const createSport = createAsyncThunk(
  'sports/createSport',
  async (sportData: CreateSportRequest, { rejectWithValue }) => {
    try {
      const response = await sportService.createSport(sportData);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateSport = createAsyncThunk(
  'sports/updateSport',
  async ({ sportId, sportData, existingMediaId }: { sportId: number; sportData: UpdateSportRequest; existingMediaId?: number }, { rejectWithValue }) => {
    try {
      const response = await sportService.updateSport(sportId, sportData, existingMediaId);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteSport = createAsyncThunk(
  'sports/deleteSport',
  async (sportId: number, { rejectWithValue }) => {
    try {
      await sportService.deleteSport(sportId);
      return sportId;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const sportSlice = createSlice({
  name: 'sports',
  initialState,
  reducers: {
    clearSports: (state) => {
      state.sports = null;
      state.currentSport = null;
      state.error = null;
    },
    clearCurrentSport: (state) => {
      state.currentSport = null;
    },
    setFilters: (state, action: PayloadAction<Partial<SportState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetSportsState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch sports
      .addCase(fetchSports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSports.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sports = action.payload;
        state.error = null;
      })
      .addCase(fetchSports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch single sport
      .addCase(fetchSport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSport = action.payload;
        state.error = null;
      })
      .addCase(fetchSport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create sport
      .addCase(createSport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSport = action.payload;
        state.error = null;
      })
      .addCase(createSport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update sport
      .addCase(updateSport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSport = action.payload;
        state.error = null;
      })
      .addCase(updateSport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete sport
      .addCase(deleteSport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // Remove the deleted sport from the list if it exists
        if (state.sports && state.sports.data) {
          state.sports.data = state.sports.data.filter(sport => sport.id !== action.payload);
          state.sports.total = state.sports.total - 1;
        }
      })
      .addCase(deleteSport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSports, clearCurrentSport, setFilters, resetSportsState } = sportSlice.actions;
export default sportSlice.reducer;
