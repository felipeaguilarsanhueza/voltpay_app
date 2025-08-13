// src/components/ChargerModal.js
import React, { useState, useContext } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import Modal from 'react-native-modal';
import api from '../api';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../context/AuthContext';

const ChargerModal = ({ charger, connector, onClose, onStartSession }) => {
  const [loading, setLoading] = useState(false);
  const { userToken, session } = useContext(AuthContext);

  const handleStart = async () => {
    setLoading(true);
    try {
      const body = {
        cp_id: charger.id,
        connector_id: connector.connector_number,
      };
      if (userToken && session) {
        body.id_tag = String(session.userId || session.id);
      } else {
        body.payment_intent_id = 'dummy_payment_intent_id';
      }
      const txId = await start(payload);
      onStartSession(txId);
      Toast.show({ type: 'success', text1: 'Carga iniciada' });
    } catch (error) {
      const detail = error.response?.data || error.message;
      Toast.show({ type: 'error', text1: 'Error al iniciar carga', text2: JSON.stringify(detail) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isVisible>
      <View style={styles.content}>
        <Text style={styles.title}>Detalles del cargador</Text>
        <Text>ID: {charger.id}</Text>
        <Text>Conector: {connector.connector_number}</Text>
        {loading ? <ActivityIndicator /> : <Button title="Iniciar carga" onPress={handleStart} />}
        <Button title="Cerrar" onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: { backgroundColor: 'white', padding: 20, borderRadius: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
});

export default ChargerModal;
