import React, { useState, useCallback, useEffect } from "react";
import { SafeAreaView, StyleSheet, View, FlatList, ActivityIndicator } from "react-native";
import ProfileHeader from "./ProfileHeader";
import StoryItem from "./StoryItem";
import { theme } from "../../assets/Theme";
import DropdownSelector from "../../components/DropdownSelector";
import Cascading from "../../animation/CascadingFadeInView";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../../../config';

const NewScreen = () => {
  const [selectedOption, setSelectedOption] = useState("Hoy");
  const OPCIONES = ['Hoy', 'Ayer', 'Esta Semana', 'Este Mes', 'Todo'];
  const title = 'Actividad';
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animationKey, setAnimationKey] = useState(Date.now());
  
  const fetchData = async (empresa_id, cobrador_id, filtro) => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/mobile/historial-cobros/${empresa_id}/${cobrador_id}/${filtro}`);
      setHistoryData(response.data);
    } catch (error) {
      console.error("Error fetching history data: ", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchStorageData = async () => {
        const empresa_id = await AsyncStorage.getItem('@empresa_id');
        const cobrador_id = await AsyncStorage.getItem('@cobrador_id');
        let filtro;

        switch (selectedOption) {
          case 'Hoy':
            filtro = 'hoy';
            break;
          case 'Ayer':
            filtro = 'ayer';
            break;
          case 'Esta Semana':
            filtro = 'ultima_semana';
            break;
          case 'Este Mes':
            filtro = 'ultimo_mes';
            break;
          case 'Todo':
          default:
            filtro = '';
        }

        await fetchData(empresa_id, cobrador_id, filtro);
      };

      setAnimationKey(Date.now());
      fetchStorageData();
    }, [selectedOption])
  );

  const onOptionChange = (option) => {
    setSelectedOption(option);
  };

  const renderHistoryItem = ({ item, index }) => (
    <Cascading delay={400 + 80 * index} animationKey={animationKey}>
      <StoryItem story={item} />
    </Cascading>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <ProfileHeader />
        <Cascading delay={300} animationKey={animationKey}>
          <DropdownSelector
            title={title}
            options={OPCIONES}
            selectedOption={selectedOption}
            onOptionChange={onOptionChange}
          />
        </Cascading>
      </View>
      <View style={styles.listContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={historyData}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.id.toString()}
            ListHeaderComponent={<View style={{ height: 10 }} />}
            ListFooterComponent={<View style={{ height: 10 }} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    zIndex: 1,
    paddingTop: 40,
    paddingBottom: 18,
    paddingVertical: 20,
    backgroundColor: theme.colors.secondary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  listContainer: {
    backgroundColor: theme.colors.primary,
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NewScreen;
