// You can import Ionicons from @expo/vector-icons if you use Expo or
// react-native-vector-icons/Ionicons otherwise.
import React, { useEffect } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import moment from "moment";
import HomeScreen from './components/HomeScreen.js';
import ExpandableCalendar from './components/ExpandableCalendars.js';
import AnalysisScreen from './components/AnalysisScreen.js';
import AsyncManager from './components/AsyncManager';
import Onboarding from 'react-native-onboarding-swiper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

console.log("Reloaded.", moment());

const Tab = createBottomTabNavigator();

export default function App() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [hasOnboarded, setOnboarded] = React.useState("initial");

  const setMode = (val) => {
    setIsDarkMode(val);
    AsyncManager.setDarkMode(val);
    AsyncManager.setOnboarded(false);
  }

  const completeOnboarding = () => {
    setOnboarded(true);
    AsyncManager.setOnboarded(true);
  }

  const Simple = () => (
    <Onboarding
      onDone={() => completeOnboarding()}
      pages={[
        {
          backgroundColor: '#fff',
          image: <Image source={require('./assets/favicon.png')} />,
          title: 'Onboarding',
          subtitle: 'Done with React Native Onboarding Swiper',
        },
        {
          backgroundColor: '#fe6e58',
          image: <Image source={require('./assets/icon.png')} />,
          title: 'The Title',
          subtitle: 'This is the subtitle that sumplements the title.',
        },
        {
          backgroundColor: '#999',
          image: <Image source={require('./assets/splash.png')} />,
          title: 'Triangle',
          subtitle: "Beautiful, isn't it?",
        },
      ]}
    />
  );

  const theme = isDarkMode ? DarkTheme : DefaultTheme;
  
  useEffect(() => {
    AsyncManager.isDarkMode().then((val) => {
      setIsDarkMode(val);
    });
    AsyncManager.hasOnboarded().then((val) => {
      setOnboarded(val);
    });
  }, []);
  
  if (hasOnboarded === "initial") {
    return <View></View>
  } else if (!hasOnboarded) {
    return <Simple />
  } else {
    return (
      <SafeAreaProvider>
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
              options: {
                statusBar: {
                  backgroundColor: 'blue',
                  style: 'dark'
                }
              }
            })}
            tabBarOptions={{
              activeTintColor: isDarkMode ? '#3d798f' : "#00ABEB",
              inactiveTintColor: 'gray',
              style: {
                paddingBottom: 3,
                paddingTop: 3
              },
              options: {
                statusBar: {
                  backgroundColor: 'white',
                  style: 'dark'
                }
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
      </SafeAreaProvider>
    );
  }
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
