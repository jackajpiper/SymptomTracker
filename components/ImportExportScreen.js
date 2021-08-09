import _ from 'lodash';
import React, {useEffect} from 'react';
import {StyleSheet, View, Text, TouchableOpacity, Alert} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import { useTheme } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Permissions from 'expo-permissions';
import AsyncManager from './AsyncManager';
import Toast from 'react-native-simple-toast';

export default function ImportExportScreen (props) {
  let theme = useTheme();

  const textColour = theme.dark ? "#ffffff" : "#000000";
  const btnBackground = theme.dark ? "#000000" : "#ffffff";
  const btnColour1 = theme.dark ? "#5C210A" : "#F9D5C7";
  const btnColour2 = theme.dark ? "#5C0A20" : "#E7D5E1";

  const pickFile = async () => {
    let result = await DocumentPicker.getDocumentAsync({copyToCacheDirectory: false, type: "text/plain"});
    if (result.type === 'cancel') {
      return;
    }

    let hasData = await AsyncManager.checkHasData();
    if (hasData) {
      Alert.alert(
        'Overwrite data?',
        'You have data that will be overwritten.',
        [
          { text: "Cancel", style: 'cancel', onPress: () => {} },
          {
            text: 'Okay',
            style: 'destructive',
            onPress: () => {
              importData(result);
            },
          },
        ]
      );
    } else {
      importData(result);
    }
  }

  const importData = async (result) => {
    let data = null;
    try {
      data = await FileSystem.readAsStringAsync(result.uri);
    } catch (err) {
      const uri = FileSystem.documentDirectory+result.name;
      await FileSystem.copyAsync({
        from: result.uri,
        to: uri
      });
      data = await FileSystem.readAsStringAsync(uri);
    }
    

    await AsyncManager.processImportData(data);
    Toast.show("Data imported");
  }

  const exportData = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status === "granted") {
      var data = await AsyncManager.getExportData();
      let fileUri = FileSystem.documentDirectory + "Symptom-Tracker-Data.txt";
      await FileSystem.writeAsStringAsync(fileUri, data, { encoding: FileSystem.EncodingType.UTF8 });
      const asset = await MediaLibrary.createAssetAsync(fileUri)
      await MediaLibrary.createAlbumAsync("Download", asset, false);
      Toast.show("Data downloaded");
    }
}

  return (
    <View style={ [styles.main, {backgroundColor: theme.backgroundColor}] }>

      <LinearGradient 
        colors={[btnBackground, btnColour1]}
        style = { styles.buttonContainer }
        start={{ x: 0.25, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}>

        <TouchableOpacity style={styles.mainButton} onPress={pickFile}>
          <Text style={[styles.mainButtonText, {color: textColour}]}>Import data</Text>
        </TouchableOpacity>
      </LinearGradient>

      <LinearGradient 
        colors={[btnBackground, btnColour2]}
        style = { styles.buttonContainer }
        start={{ x: 0.25, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}>

        <TouchableOpacity style={styles.mainButton} onPress={exportData}>
          <Text style={[styles.mainButtonText, {color: textColour}]}>Export data</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 60,
    marginBottom: 20
  },
  buttonList: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingBottom: 20
  },
  buttonContainer: {
    width: '90%',
    height: 65,
    backgroundColor: 'cornflowerblue',
    justifyContent: 'center',
    margin: 20,
    marginTop: 60,
    borderRadius:10
  },
  mainButtonText: {
    marginLeft: 16,
    fontSize: 16,
    textAlign: 'left'
  },
  mainButton: {
    height: "100%",
    flexDirection: 'row',
    alignItems: 'center',
  }
});