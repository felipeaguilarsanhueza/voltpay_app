import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import UniversalMap from '../components/UniversalMap';
import api from '../api';
import FacilityDetailModal from '../components/FacilityDetailModal';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../context/AuthContext';

const MapScreen = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const { startSession } = useContext(AuthContext);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        // Usar URL con slash para evitar redirect y preservar auth header
        const response = await api.get('/facilities/');
        // response.data es un array de instalaciones
        setFacilities(response.data);
      } catch (error) {
        Toast.show({ type: 'error', text1: 'Error al cargar instalaciones' });
      } finally {
        setLoading(false);
      }
    };
    fetchFacilities();
  }, []);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <UniversalMap
        style={styles.map}
        initialRegion={{
          latitude: facilities.length ? facilities[0].latitude : 0,
          longitude: facilities.length ? facilities[0].longitude : 0,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        chargers={facilities}
        onMarkerPress={setSelectedFacility}
      />
      {selectedFacility && (
        <FacilityDetailModal
          facility={selectedFacility}
          onClose={() => setSelectedFacility(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  map: { flex: 1 },
});

export default MapScreen;