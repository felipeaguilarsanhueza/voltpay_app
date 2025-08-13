// src/screens/SessionSummaryScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

/**
 * Resumen de la sesión tras detener la carga.
 * Muestra tiempo y energía entregada.
 */
const SessionSummaryScreen = ({ route, navigation }) => {
  const { energy, timerSeconds, unitEnergy } = route.params;
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Resumen de la sesión</Text>
      <Text style={styles.item}>Tiempo: {minutes} m {seconds}s</Text>
      <Text style={styles.item}>
        Energía entregada: {energy.toFixed(1)} {unitEnergy}
      </Text>
      <Button title="Volver al mapa" onPress={() => navigation.popToTop()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20
  },
  header: {
    fontSize: 24, fontWeight: 'bold', marginBottom: 20
  },
  item: {
    fontSize: 18, marginBottom: 10
  },
});

export default SessionSummaryScreen;
