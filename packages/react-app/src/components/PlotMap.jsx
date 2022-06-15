import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import loading from "../assets/images/loading.gif";
import "mapbox-gl/dist/mapbox-gl.css";

import { useAppSelector } from "../hooks";
import { AnimatePresence, motion } from "framer-motion";
import { stringifyPlotId } from "../helpers/stringifyPlotId";
import { plotsList } from "../data";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

export default function PlotMap({ parcel, plots, startingCoordinates, startingZoom, startingPitch }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  let popup = new mapboxgl.Popup({
    maxWidth: "unset",
    closeButton: false,
    closeOnClick: false
  });
  const [mapLoaded, setMapLoaded] = useState(false);

  const highlightedPlot = useAppSelector(state => state.plots.highlightedPlot);
  const activePlot = useAppSelector(state => state.plots.activePlot);
  const communal = useAppSelector(state => state.plots.communal);
  const [newPlots, setNewPlots] = useState(plotsList)

  // zoom to plot on selection
  useEffect(() => {
    if (map.current && activePlot) {
      map.current.flyTo({
        center: activePlot.geometry.coordinates[0][0],
        zoom: startingZoom,
        pitch: startingPitch,
      });

      let popupTitle = `<p class="plot-title">Plot #${stringifyPlotId(activePlot.id)}</p>`;
      let popupContent = "<div class='popup-content'><div class='cordinates'>";
      let coordinates = activePlot.geometry.coordinates[0];
      coordinates.map((codinate, index) => {
        if (index < 4) {
          popupContent += `<span>${codinate}</span>`;
        }
      })
      popupContent += "</div>";
      popupContent += "</div>";

      const lats = coordinates.map((codinate) => codinate[0]);
      const lngs = coordinates.map((codinate) => codinate[1]);
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

      popup.setLngLat([centerLat, centerLng]).setHTML(popupTitle + popupContent).addTo(map.current);
    } else {
      const popups = document.getElementsByClassName("mapboxgl-popup");
      if (popups.length) {
        popups[0].remove();
      }
    }
  }, [activePlot]);

  const addOutlineToMap = (geojson, string_id, color = "#eff551") => {
    if (map?.current) {
      if (!map.current.getSource(string_id)) {
        map.current.addSource(string_id, {
          type: "geojson",
          data: geojson,
        });
      }
      // add plot outline
      map.current.addLayer({
        id: `${string_id}_outline`,
        source: string_id,
        type: "line",
        paint: {
          "line-color": color,
          "line-width": 2,
        },
      });
    }
  };

  const addFilledToMap = (geojson, string_id, opacity = 0.5, color = "#eff551") => {
    if (map?.current) {
      if (!map.current.getSource(string_id)) {
        map.current.addSource(string_id, {
          type: "geojson",
          data: geojson,
        });
      }
      // add plot outline
      map.current.addLayer({
        id: `${string_id}_fill`,
        source: string_id,
        type: "fill",
        paint: {
          "fill-color": color,
          "fill-opacity": opacity,
        },
      });
    }
  };

  useEffect(() => {
    if (map.current) return; // only render map once
    map.current = new mapboxgl.Map({
      container: mapContainer.current ?? "", // should never need the fallback
      style: "mapbox://styles/gregrolwes/ckvsro22d1bj514oy7iy900av",
      center: startingCoordinates,
      zoom: startingZoom,
      pitch: startingPitch,
    });
  }, []);

  // Draw parcel outline and communal land
  useEffect(() => {
    if (map?.current) {
      map.current.on("load", function () {
        if (map.current && map.current.getSource("parcel")) return; // skip if already added
        addOutlineToMap(parcel.metadata.geojson, "parcel");
        communal.forEach((plot, idx) => {
          addFilledToMap(plot, idx.toString(), 1, "#06be7f");
        });
        setTimeout(() => {
          setMapLoaded(true);
        }, 1000);
      });
    }
  }, [map.current, plots]);

  // Add/remove plot highlight when highlighted plot changes
  // useEffect(() => {
  //   if (map?.current && highlightedPlot && !map.current.getLayer("highlighted_fill") && mapLoaded) {
  //     addOutlineToMap(highlightedPlot.metadata.geojson, "highlighted", "#fff");
  //     addFilledToMap(highlightedPlot.metadata.geojson, "highlighted");
  //   } else if (map?.current && map.current.getLayer("highlighted_fill") && mapLoaded) {
  //     map.current.removeLayer("highlighted_fill");
  //     map.current.removeLayer("highlighted_outline");
  //     map.current.removeSource("highlighted");
  //   }
  // }, [highlightedPlot, map.current]);

  useEffect(() => {
    if (map?.current && newPlots.features && mapLoaded) {
      for (let i = 0; ; i++) {
        if (map.current.getLayer(`highlighted${i}_fill`)) {
          map.current.removeLayer(`highlighted${i}_fill`);
          map.current.removeLayer(`highlighted${i}_outline`);
          map.current.removeSource(`highlighted${i}`);
        } else {
          break;
        }
      }
      console.log(newPlots.features)
      // newPlots.features.map((plot, index) => {
      //   console.log(plot)
        addOutlineToMap(newPlots, "highlighted" + 0, "#fff");
        addFilledToMap(newPlots, "highlighted" + 0);
      // })
    }
  }, [newPlots.features, map.current, mapLoaded])

  return (
    <div className="plot-map flex-grow flex flex-col relative">
      <AnimatePresence>{!mapLoaded && <Loading />}</AnimatePresence>
      <div ref={mapContainer} className="absolute left-0 right-0 top-0 bottom-0 plot-map" />
    </div>
  );
}

function Loading() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="plot-map bg-black absolute left-0 right-0 top-0 bottom-0 z-10 flex items-center justify-center"
    >
      <img src={loading} alt="loading" />
    </motion.div>
  );
}
