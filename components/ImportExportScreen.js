import _ from 'lodash';
import React, {useEffect} from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import { useTheme } from '@react-navigation/native';
import AsyncManager from './AsyncManager';

export default function ImportExportScreen (props) {
  let theme = useTheme();

  const textColour = theme.dark ? "#ffffff" : "#000000";
  const btnBackground = theme.dark ? "#000000" : "#ffffff";
  const btnColour1 = theme.dark ? "#5C210A" : "#F9D5C7";
  const btnColour2 = theme.dark ? "#5C0A20" : "#E7D5E1";

  return (
    <View style={ [styles.main, {backgroundColor: theme.backgroundColor}] }>

      <LinearGradient 
        colors={[btnBackground, btnColour1]}
        style = { styles.buttonContainer }
        start={{ x: 0.25, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}>

        <TouchableOpacity style={styles.mainButton}>
          <Text style={[styles.mainButtonText, {color: textColour}]}>Import data</Text>
        </TouchableOpacity>
      </LinearGradient>

      <LinearGradient 
        colors={[btnBackground, btnColour2]}
        style = { styles.buttonContainer }
        start={{ x: 0.25, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}>

        <TouchableOpacity style={styles.mainButton}>
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