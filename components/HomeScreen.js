import _ from 'lodash';
import React, {useEffect} from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import SymptomsListScreen from './SymptomsListScreen.js';
import TreatmentsListScreen from './TreatmentsListScreen.js';
import TriggersListScreen from './TriggersListScreen.js';
import EditTriggerScreen from './EditTriggerScreen.js';
import EditTreatmentScreen from './EditTreatmentScreen.js';
import EditSymptomScreen from './EditSymptomScreen.js';
import DiaryScreen from './DiaryScreen.js';
import EditDiaryScreen from './EditDiaryScreen.js';
import SettingsScreen from './SettingsScreen.js';
import ImportExportScreen from './ImportExportScreen.js';
import {LinearGradient} from 'expo-linear-gradient';
import { useTheme } from '@react-navigation/native';
import AsyncManager from './AsyncManager';

const Stack = createStackNavigator();

function MainScreen (props) {
  const theme = props.theme;
  const dark = theme.dark;
  const appName = props.appName;
  const updateName = props.updateName;
  
  useEffect(() => {
    updateName();
    
    const willFocusListener = props.navigation.addListener('focus', async () => {
      updateName();
    });
    return () => {
      if(willFocusListener && typeof willFocusListener.remove === "function") {
        willFocusListener.remove();
      };
    }
  }, []);

  const renderMenuButton = (title, target, colour) => {
    return (
      <LinearGradient 
        colors={[theme.backgroundColor, colour]}
        style = { styles.buttonContainer }
        start={{ x: 0.25, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}>

        <TouchableOpacity style={styles.mainButton} onPress={() => props.navigation.navigate(target)}>
          <Text style={[styles.mainButtonText, {color: theme.colors.text}]}>{title}</Text>
        </TouchableOpacity>
      </LinearGradient>
    )
  }

  return (
    <View style={ [styles.main, {backgroundColor: theme.backgroundColor}] }>
      <Text style={ [styles.titleText, {color: theme.colors.text}] }>{appName + " Symptom Tracker"}</Text>
      <View style={ styles.buttonList }>
        {renderMenuButton("Manage Symptoms", "Symptoms", dark ? "#5C0A20" : "#E7D5E1")}
        {renderMenuButton("Manage Triggers", "Triggers", dark ? "#5C4A0A" : "#FAEEC4")}
        {renderMenuButton("Manage Treatments", "Treatments", dark ? "#0A5C41" : "#C3D8D1")}
        {renderMenuButton("Diary", "Diary", dark ? "#5C210A" : "#F9D5C7")}
        {renderMenuButton("Settings", "Settings", dark ? "#5C0A41" : "#F9E2E8")}
      </View>
    </View>
  );
}

export default function HomeScreen (props) {
  let theme = useTheme();
  const [appName, setAppName] = React.useState("Amy's");

  const updateName = () => {
    AsyncManager.getAppName().then((name) => {
      setAppName(name);
    });
  }

  const editTitle = (route, obj) => {
    if (route.params[obj].id) {
      return "Edit " + (route.params[obj].name || "Diary");
    } else {
      return "Add New " + (obj.charAt(0).toUpperCase() + obj.slice(1));
    }
  }

  const setIsDarkMode = props.setIsDarkMode;

  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" options={{headerShown: false}}>
        {(props) => <MainScreen  {...props} appName={appName} updateName={updateName} theme={theme} />}
      </Stack.Screen>
      <Stack.Screen name="Symptoms" component={SymptomsListScreen} />
      <Stack.Screen name="Treatments" component={TreatmentsListScreen} />
      <Stack.Screen name="Triggers" component={TriggersListScreen} />
      <Stack.Screen name="Diary" component={DiaryScreen} />
      <Stack.Screen name="EditDiary" component={EditDiaryScreen} options={({ route }) => ({ title: editTitle(route, "diary") })} />
      <Stack.Screen name="Settings">
        {(props) => <SettingsScreen  {...props} setIsDarkMode={setIsDarkMode} appName={appName} />}
      </Stack.Screen>
      <Stack.Screen name="EditSymptom" component={EditSymptomScreen} options={({ route }) => ({ title: editTitle(route, "symptom") })} />
      <Stack.Screen name="EditTreatment" component={EditTreatmentScreen} options={({ route }) => ({ title: editTitle(route, "treatment") })} />
      <Stack.Screen name="EditTrigger" component={EditTriggerScreen} options={({ route }) => ({ title: editTitle(route, "trigger") })} />
      <Stack.Screen name="ImportExport" component={ImportExportScreen} />
    </Stack.Navigator>
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
    marginBottom: 20,
    textAlign: 'center'
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