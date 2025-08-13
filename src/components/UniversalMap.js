import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import MapView, { Marker as RNMarker, PROVIDER_GOOGLE } from 'react-native-maps';
import { LoadScript, GoogleMap, Marker as GMMarker } from '@react-google-maps/api';

/**
 * Universal map component: uses react-native-maps on mobile and Google Maps JS on web.
 * Web API key provided inline.
 */
const UniversalMap = ({ initialRegion, chargers, onMarkerPress, style }) => {
  if (Platform.OS === 'web') {
    return (
      <LoadScript googleMapsApiKey="AIzaSyCVlmJDWKn5ocF38AbMuUCsm9u68LZjEpk">
        <GoogleMap
          mapContainerStyle={StyleSheet.flatten(style)}
          center={{ lat: initialRegion.latitude, lng: initialRegion.longitude }}
          zoom={13}
        >
          {chargers.map((c) => (
            <GMMarker
              key={c.id}
              position={{ lat: c.latitude, lng: c.longitude }}
              onClick={() => onMarkerPress(c)}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    );
  }
  return (
    <MapView
      style={style}
      provider={PROVIDER_GOOGLE}
      initialRegion={initialRegion}
    >
      {chargers.map((c) => (
        <RNMarker
          key={c.id}
          coordinate={{ latitude: c.latitude, longitude: c.longitude }}
          onPress={() => onMarkerPress(c)}
        />
      ))}
    </MapView>
  );
};

export default UniversalMap;