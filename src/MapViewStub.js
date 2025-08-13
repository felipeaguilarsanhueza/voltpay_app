import React from 'react';
import { View, Text } from 'react-native';

/**
 * Web stub for react-native-maps.
 * Shows a placeholder message on web platforms.
 */
const MapViewMock = ({ style }) => (
  <View style={style}>
    <Text style={{ textAlign: 'center', marginTop: 20 }}>Mapa no soportado en web</Text>
  </View>
);

export default MapViewMock;
// Provide placeholder for PROVIDER_GOOGLE used in UniversalMap
export const PROVIDER_GOOGLE = null;
export const Marker = () => null;
export const Overlay = () => null;