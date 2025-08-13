// src/hooks/useChargingFlow.js
import { useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export const useChargingFlow = () => {
  const { startSession, stopSession } = useContext(AuthContext);

  const start = async ({ charger, connector, id_tag, payment_intent_id }) => {
    const cpId = charger.code ?? String(charger.id);
    const payload = { cp_id: cpId, connector_id: connector.connector_number };
    if (id_tag) payload.id_tag = id_tag;
    if (payment_intent_id) payload.payment_intent_id = payment_intent_id;

    const resp = await api.post('/charging/remote_start', payload);
    if (resp.data.status !== 'Accepted') {
      throw new Error(`Carga no aceptada: ${resp.data.status}`);
    }

    // Poll hasta "Charging"
    await new Promise(resolve => {
      const iv = setInterval(async () => {
        try {
          const { data } = await api.get(`/chargers/${charger.id}/connectors`);
          const c = data.find(x => x.connector_number === connector.connector_number);
          if (c?.status === 'Charging') {
            clearInterval(iv);
            resolve();
          }
        } catch {} 
      }, 1500);
    });

    // Obtener transaction ID real
    const { data: active } = await api.get('/charging/active_transaction', {
      params: { cp_id: cpId, connector_id: connector.connector_number }
    });
    const txId = active.transaction_id;
    if (!txId) throw new Error('No se obtuvo transaction_id');

    startSession({ charger: { ...charger, code: cpId }, connector, transactionId: txId });
    return txId;
  };

  const stop = async ({ charger, connector, txId }) => {
    const cpId = charger.code ?? String(charger.id);
    const resp = await api.post('/charging/remote_stop', null, {
      params: { cp_id: cpId, transaction_id: txId }
    });
    if (resp.data.status === 'Rejected') {
      throw new Error('Rechazado');
    }

    // Poll hasta "Available"
    await new Promise(resolve => {
      const iv = setInterval(async () => {
        try {
          const { data } = await api.get(`/chargers/${charger.id}/connectors`);
          const c = data.find(x => x.connector_number === connector.connector_number);
          if (c?.status === 'Available') {
            clearInterval(iv);
            resolve();
          }
        } catch {} 
      }, 1500);
    });

    stopSession();
  };

  const fetchMeterValues = async txId => {
    const { data } = await api.get(`/charging/sessions/${txId}/meter_values`);
    return data;
  };

  return { start, stop, fetchMeterValues };
};