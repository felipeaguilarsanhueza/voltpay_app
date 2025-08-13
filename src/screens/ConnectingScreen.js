// src/screens/ConnectingScreen.js
import React, { useEffect, useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

const ConnectingScreen = ({ route, navigation }) => {
  const { charger, connector } = route.params;
  const { userToken, currentUser } = useContext(AuthContext);

  useEffect(() => {
    let pollInterval;

    const startAndPoll = async () => {
      // Preparamos payload con el código correcto
      const cpId = charger.code ?? String(charger.id);
      const payload = {
        cp_id: cpId,
        connector_id: connector.connector_number,
      };
      if (userToken && currentUser?.id) {
        payload.id_tag = currentUser.id;
      } else {
        payload.payment_intent_id = 'dummy_payment_intent_id';
      }

      try {
        // Iniciamos remoto
        const resp = await api.post('/charging/remote_start', payload);
        if (resp.data.status !== 'Accepted') {
          Toast.show({ type: 'error', text1: 'Inicio no aceptado' });
          return navigation.goBack();
        }

        // Poll hasta que pase a 'Charging'
        pollInterval = setInterval(async () => {
          try {
            const statusRes = await api.get(`/chargers/${charger.id}/connectors`);
            const conn = statusRes.data.find(
              (c) => c.connector_number === connector.connector_number
            );
            if (conn?.status === 'Charging') {
              clearInterval(pollInterval);

              // Obtenemos transaction_id activo
              const active = await api.get('/charging/active_transaction', {
                params: { cp_id: cpId, connector_id: connector.connector_number },
              });
              const txId = active.data.transaction_id;

              // Navegamos a sesión de carga
              navigation.replace('ChargingSession', {
                charger,
                connector,
                transactionId: txId,
              });
            }
          } catch (e) {
            console.error('Error polling connector status', e);
          }
        }, 1500);

      } catch (e) {
        console.error('Error starting remote_start', e);
        Toast.show({ type: 'error', text1: 'Error conectando al cargador' });
        navigation.goBack();
      }
    };

    startAndPoll();
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [charger, connector, userToken, currentUser, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Conectando al cargador...</Text>
      <ActivityIndicator size="large" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, marginBottom: 20 },
});

export default ConnectingScreen;
