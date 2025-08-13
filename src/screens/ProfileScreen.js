import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Modal, ActivityIndicator } from 'react-native';
import api from '../api';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../context/AuthContext';

const ProfileScreen = () => {
  const { logout } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [updatingName, setUpdatingName] = useState(false);
  const [addingTag, setAddingTag] = useState(false);

  const fetchProfile = async () => {
    try {
      const resp = await api.get('/auth/me');
      setUser(resp.data);
      const tagsResp = await api.get('/users/rfid');
      setTags(tagsResp.data);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error al cargar perfil' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleChangeName = () => {
    setNewName(user.name);
    setEditingName(true);
  };

  const submitName = async () => {
    setUpdatingName(true);
    try {
      await api.put('/users/profile', { name: newName });
      setUser({ ...user, name: newName });
      Toast.show({ type: 'success', text1: 'Nombre actualizado' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error al cambiar nombre' });
    } finally {
      setUpdatingName(false);
      setEditingName(false);
    }
  };

  const handleAddTag = () => { setNewTag(''); setTagModalVisible(true); };

  const submitTag = async () => {
    setAddingTag(true);
    try {
      await api.post('/users/rfid', { tag_id: newTag });
      const tagsResp = await api.get('/users/rfid');
      setTags(tagsResp.data);
      Toast.show({ type: 'success', text1: 'Etiqueta añadida' });
      setTagModalVisible(false);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error al agregar etiqueta' });
    } finally {
      setAddingTag(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.field}>Usuario: {user.name}</Text>
      <Button title="Cambiar nombre de usuario" onPress={handleChangeName} />
      {editingName && (
        <Modal transparent visible={editingName}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <TextInput value={newName} onChangeText={setNewName} placeholder="Nuevo nombre" style={styles.input} />
              {updatingName ? <ActivityIndicator /> : <Button title="Cambiar nombre" onPress={submitName} />}
              <Button title="Cancelar" onPress={() => setEditingName(false)} />
            </View>
          </View>
        </Modal>
      )}
      <Text style={[styles.field, { marginTop: 20 }]}>Etiquetas RFID:</Text>
      {tags.map((tag) => <Text key={tag.id}>- {tag.id}</Text>)}
      <Button title="Agregar etiqueta RFID" onPress={handleAddTag} />
      {tagModalVisible && (
        <Modal transparent visible={tagModalVisible}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <Text>Agregar etiqueta RFID</Text>
              <TextInput value={newTag} onChangeText={setNewTag} placeholder="ID de etiqueta" style={styles.input} />
              {addingTag ? <ActivityIndicator /> : <Button title="Agregar" onPress={submitTag} />}
              <Button title="Cancelar" onPress={() => setTagModalVisible(false)} />
            </View>
          </View>
        </Modal>
      )}
      <Button title="Cerrar sesión" onPress={logout} color="red" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, padding:20 },
  field: { fontSize:16, marginBottom:10 },
  center: { flex:1, justifyContent:'center', alignItems:'center' },
  modalBackground: { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center' },
  modalContent: { backgroundColor:'white', padding:20, borderRadius:10, width:'80%' },
  input: { borderWidth:1, borderColor:'#ccc', padding:10, marginVertical:10, borderRadius:5 },
});

export default ProfileScreen;