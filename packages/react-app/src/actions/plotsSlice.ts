import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Plot } from "../models/Plot";

interface PlotsState {
  plots: Plot[];
  // parcel: Plot;
  communal: any[];
  highlightedPlot?: Plot;
  activePlot?: Plot;
  idFilter?: string;
  fetching: boolean;
  numDisplay: any;
}

const initialState: PlotsState = {
  plots: [],
  communal: [],
  highlightedPlot: undefined,
  activePlot: undefined,
  fetching: true,
  numDisplay: 10,
};

export const plotsState = createSlice({
  name: "plots",
  initialState,
  reducers: {
    setPlots: (state, action: PayloadAction<Plot[]>) => {
      state.plots = action.payload;
    },
    setHighlightedPlot: (state, action: PayloadAction<Plot | undefined>) => {
      if (!state.activePlot) {
        state.highlightedPlot = action.payload;
      }
    },
    setActivePlot: (state, action: PayloadAction<Plot | undefined>) => {
      state.activePlot = action.payload;
      state.highlightedPlot = action.payload;
    },
    setIdFilter: (state, action: PayloadAction<string | undefined>) => {
      state.idFilter = action.payload;
    },
    fetchedPlots: state => {
      state.fetching = false;
    },
    setCommunalLand: (state, action: PayloadAction<any[]>) => {
      state.communal = action.payload;
    },
    setNumDisplayPlots: (state, action: PayloadAction<number | undefined>) => {
      state.numDisplay = action.payload;
    },
  },
});

export const {
  setPlots,
  setHighlightedPlot,
  setActivePlot,
  setIdFilter,
  fetchedPlots,
  setCommunalLand,
  setNumDisplayPlots,
} = plotsState.actions;

export default plotsState.reducer;
