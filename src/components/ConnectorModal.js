// src/components/ConnectorModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import Modal from 'react-native-modal';
import api from '../api';
import Toast from 'react-native-toast-message';

const ConnectorModal = ({ facility, onClose, onStart }) => {
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConnector, setSelectedConnector] = useState(null);

  useEffect(() => {
    api.get(`/chargers/${facility.id}/connectors/`)
      .then(resp => setConnectors(resp.data))
      .catch(() => Toast.show({ type: 'error', text1: 'Error al cargar conectores' }))
      .finally(() => setLoading(false));
  }, [facility]);

  const handleStart = () => {
    if (!selectedConnector) {
      return Toast.show({ type: 'error', text1: 'Seleccione un conector' });
    }
    onStart(selectedConnector);
  };

  return (
    <Modal isVisible onBackdropPress={onClose} onBackButtonPress={onClose}>
      <View style={styles.content}>
        <Text style={styles.title}>{facility.name}</Text>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <FlatList
            data={connectors}
            keyExtractor={item => item.connector_number.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.connectorItem, selectedConnector?.connector_number === item.connector_number ? styles.selected : null]}
                onPress={() => setSelectedConnector(item)}
              >
                <Text>Conector {item.connector_number}: {item.status}</Text>
              </TouchableOpacity>
            )}
          />
        )}
        <Button title="Iniciar carga" onPress={handleStart} disabled={!selectedConnector} />
        <Button title="Cerrar" onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: { backgroundColor: 'white', padding: 20, borderRadius: 10, maxHeight: '80%' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  connectorItem: { padding: 10, borderBottomWidth: 1, borderColor: '#ccc' },
  selected: { backgroundColor: '#e0f7fa' },
});

export default ConnectorModal;