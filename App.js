// You can import Ionicons from @expo/vector-icons if you use Expo or
// react-native-vector-icons/Ionicons otherwise.
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import moment from "moment";
import HomeScreen from './components/HomeScreen.js';
import ExpandableCalendar from './components/ExpandableCalendars.js';
import AnalysisScreen from './components/AnalysisScreen.js';
import AsyncManager from './components/AsyncManager';

console.log("Reloaded.", moment());

const Tab = createBottomTabNavigator();

export default function App() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const setMode = (val) => {
    setIsDarkMode(val);
    AsyncManager.setDarkMode(val);
  }

  const theme = isDarkMode ? DarkTheme : DefaultTheme;
  
  useEffect(() => {
    AsyncManager.isDarkMode().then((val) => {
      setIsDarkMode(val);
    });
  }, []);
  
  return (
    <NavigationContainer theme={theme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Calendar') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'Analyse') {
              iconName = focused ? 'analytics' : 'analytics-outline';
            }
            
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
        tabBarOptions={{
          activeTintColor: isDarkMode ? '#3d798f' : "#00ABEB",
          inactiveTintColor: 'gray',
          style: {
            paddingBottom: 3,
            paddingTop: 3
          }
        }}>
        <Tab.Screen name="Calendar" component={ExpandableCalendar}/>
        <Tab.Screen name="Home">
          {(props) => <HomeScreen  {...props} setIsDarkMode={setMode} />}
        </Tab.Screen>
        <Tab.Screen name="Analyse">
          {(props) => <AnalysisScreen  {...props} theme={theme} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10
  }
});
