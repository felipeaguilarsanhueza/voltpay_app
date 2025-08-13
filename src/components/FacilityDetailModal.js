// src/components/FacilityDetailModal.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, TextInput } from 'react-native';
import Modal from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import api from '../api';
import { useChargingFlow } from '../hooks/useChargingFlow';
import { AuthContext } from '../context/AuthContext';

const FacilityDetailModal = ({ facility, onClose }) => {
  const [chargers, setChargers] = useState([]);
  const [connectors, setConnectors] = useState([]);
  const [loadingChargers, setLoadingChargers] = useState(true);
  const [loadingConnectors, setLoadingConnectors] = useState(false);
  const [selectedCharger, setSelectedCharger] = useState(null);
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [starting, setStarting] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const [paymentKwh, setPaymentKwh] = useState('');
  const navigation = useNavigation();
  const { isGuest, rfidTags } = useContext(AuthContext);
  const { start, stop } = useChargingFlow();

  useEffect(() => {
    api.get(`/facilities/${facility.id}/chargers/`)
      .then(resp => setChargers(resp.data))
      .catch(() => Toast.show({ type: 'error', text1: 'Error al cargar cargadores' }))
      .finally(() => setLoadingChargers(false));
  }, [facility]);

  useEffect(() => {
    if (selectedCharger) {
      setLoadingConnectors(true);
      setSelectedConnector(null);
      api.get(`/chargers/${selectedCharger.id}/connectors/`)
        .then(resp => setConnectors(resp.data))
        .catch(() => Toast.show({ type: 'error', text1: 'Error al cargar conectores' }))
        .finally(() => setLoadingConnectors(false));
    }
  }, [selectedCharger]);

  const handleStart = async () => {
    if (!selectedCharger || !selectedConnector) {
      return Toast.show({ type:'error', text1:'Seleccione cargador y conector' });
    }
    const id_tag = isGuest ? null : (rfidTags[0] || null);
    if (!isGuest && !id_tag) {
      return Toast.show({ type:'error', text1:'No tienes etiquetas RFID registradas' });
    }
    if (isGuest && !guestMode) {
      setGuestMode(true);
      return;
    }
    setStarting(true);
    try {
      const payload = { charger: selectedCharger, connector: selectedConnector, id_tag };
      if (isGuest) payload.payment_intent_id = 'dummy_payment_intent_id';
      const transactionId = await start(payload);
      navigation.replace('ChargingSession', { charger: selectedCharger, connector: selectedConnector, transactionId });
    } catch {
      Toast.show({ type:'error', text1:'No se pudo iniciar carga' });
    } finally {
      setStarting(false);
      setGuestMode(false);
    }
  };

  return (
    <Modal isVisible onBackdropPress={onClose} onBackButtonPress={onClose}>
      <View style={styles.container}>
        <Text style={styles.header}>{facility.name}</Text>
        {loadingChargers ? (
          <ActivityIndicator size="large" />
        ) : !selectedCharger ? (
          <FlatList
            data={chargers}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.item} onPress={() => setSelectedCharger(item)}>
                <Text style={styles.itemText}>{item.code || item.id}</Text>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={styles.detail}>
            <Text style={styles.subheader}>{selectedCharger.code || selectedCharger.id}</Text>
            {loadingConnectors ? (
              <ActivityIndicator size="large" />
            ) : (
              <FlatList
                data={connectors}
                keyExtractor={item => item.connector_number.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.item, selectedConnector?.connector_number === item.connector_number ? styles.selected : null]}
                    onPress={() => setSelectedConnector(item)}
                  >
                    <Text style={styles.itemText}>Conector {item.connector_number}: {item.status}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
            {guestMode && isGuest ? (
              <View>
                <Text>Total kWh:</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={paymentKwh}
                  onChangeText={setPaymentKwh}
                />
                <Button
                  title="Continuar"
                  onPress={handleStart}
                  disabled={!paymentKwh}
                />
                <Button
                  title="Cancelar"
                  onPress={() => setGuestMode(false)}
                />
              </View>
            ) : starting ? (
              <ActivityIndicator size="large" />
            ) : (
              <Button title="Iniciar carga" onPress={handleStart} disabled={!selectedConnector} />
            )}
            <Button title="Volver a cargadores" onPress={() => { setSelectedCharger(null); setConnectors([]); }} />
          </View>
        )}
        <Button title="Cerrar" onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: 'white', padding: 20, borderRadius: 10, maxHeight: '80%' },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  subheader: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  item: { padding: 10, borderBottomWidth: 1, borderColor: '#eee' },
  itemText: { fontSize: 14 },
  selected: { backgroundColor: '#e0f7fa' },
  detail: { flex: 1 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginVertical: 8, borderRadius: 4 },
});

export default FacilityDetailModal;