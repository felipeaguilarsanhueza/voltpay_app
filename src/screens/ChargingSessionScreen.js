// src/screens/ChargingSessionScreen.js
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../context/AuthContext';
import { useChargingFlow } from '../hooks/useChargingFlow';

const ChargingSessionScreen = ({ route, navigation }) => {
  const { charger, connector, transactionId } = route.params;
  const { stopSession } = useContext(AuthContext);
  const { stop, fetchMeterValues } = useChargingFlow();

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [power, setPower] = useState(null);
  const [energy, setEnergy] = useState(null);
  const [unitPower, setUnitPower] = useState('W');
  const [unitEnergy, setUnitEnergy] = useState('Wh');
  const [stopping, setStopping] = useState(false);

  // Timer
  useEffect(() => {
    const iv = setInterval(() => setTimerSeconds(t => t + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  // Poll meter values
  useEffect(() => {
    let iv;
    const update = async () => {
      try {
        const data = await fetchMeterValues(transactionId);
        // Extraer potencia y energía…
      } catch (err) {
        // Si la tx ya terminó en servidor
        if (err.response?.status === 404) {
          return navigation.replace('SessionSummary', { energy, timerSeconds, unitEnergy });
        }
        console.error('Error en meter values', err);
      }
    };
    update();
    iv = setInterval(update, 5000);
    return () => clearInterval(iv);
  }, [transactionId, energy, timerSeconds, unitEnergy, navigation, fetchMeterValues]);

  const handleStop = async () => {
    setStopping(true);
    try {
      await stop({ charger, connector, txId: transactionId });
      await stopSession();
      navigation.replace('SessionSummary', { energy, timerSeconds, unitEnergy });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error deteniendo carga', text2: err.message });
    } finally {
      setStopping(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tiempo: {timerSeconds}s</Text>
      {/* … métricas … */}
      {stopping
        ? <ActivityIndicator size="large" />
        : <Button title="Detener carga" onPress={handleStop} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  text: { fontSize: 18, marginBottom: 10 },
});

export default ChargingSessionScreen;

