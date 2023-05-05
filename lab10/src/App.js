import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl'
import axios from 'axios'
import './App.css';

mapboxgl.accessToken = 'pk.eyJ1Ijoia2hhcmNoZW5rbyIsImEiOiJjbGd6YXJnajEwaHgzM2lxdm1veHlzcjNrIn0.UBD6rlNF2iBUOiza19hwfQ'

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const popup = useRef(null);
  const moisture = useRef(null);

  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(8);

  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom
    });
  });

  useEffect(() => {
    async function getCenterCoords() {
      try {
        const response = await axios.get(`http://localhost:5000/get_image_bbox`);
        const bounds = response.data;
        let responseLng = (bounds[0] + bounds[2]) / 2
        let responseLat = (bounds[1] + bounds[3]) / 2
        setLng(responseLng);
        setLat(responseLat);
        map.current.setCenter([responseLng, responseLat]);
        console.log(`Fetched center coords : (${responseLng}; ${responseLat})`);
      } catch (error) {
        console.error(error);
      }
    }

    getCenterCoords();
  }, []);

  useEffect(() => {
    if (!map.current) return;

    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });

    const getMoistureValue = async (e) => {
      try {
        const response = await axios.get(`http://localhost:5000/get_moisure_value?lat=${e.lat}&lon=${e.lng}`);
        const responseMoisture = response.data.moisure;
        moisture.current = responseMoisture;
        console.log(`Fetched moisture value : ${responseMoisture} for coords (${e.lng}; ${e.lat})`);
      } catch (error) {
        console.error(error);
      }
    };

    const handleClick = async function (e) {
      const coordinates = e.lngLat;
      await getMoistureValue(coordinates);

      if (marker.current) {
        marker.current.remove();
      }

      if (popup.current) {
        popup.current.remove();
      }

      const newMarker = new mapboxgl.Marker().setLngLat(coordinates).addTo(map.current);

      const newPopup = new mapboxgl.Popup({
        offset: 40,
        closeButton: false,
        closeOnClick: false,
      });
      newPopup.setLngLat(coordinates).setHTML(`<div><p>Вологість: ${moisture.current}</p></div>`).addTo(map.current);

      marker.current = newMarker;
      popup.current = newPopup;
    };

    map.current.on('click', handleClick);

    return () => {
      map.current.off('click', handleClick);
    };
  });

  return (
    <div>
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div style={{minHeight: "80%"}} ref={mapContainer} className="map-container" />
    </div>
  );
}

export default App;

//Посилався на https://github.com/KharchenkoV/geo/tree/master/lab10