import AsyncStorage from '@react-native-async-storage/async-storage';

const AsyncManager = {
  symptomsStash: [],
  instancesStash: [],
  symptomCounts: {
    updateNum: 0
  },
  instanceCounts: {
    updateNum: 0
  },
  
  getSymptoms: function() {
    if(AsyncManager.symptomsStash.length === 0) {
      return AsyncStorage.getItem('Symptoms').then(
        (value) => {
          let parsedValue = JSON.parse(value);
          AsyncManager.symptomsStash = parsedValue;
          return parsedValue;
        }
      );
    } else {
      return AsyncManager.symptomsStash;
    }
  },
  
  getInstances: function() {
    if(AsyncManager.instancesStash.length === 0) {
      return AsyncStorage.getItem('SymptomInstances').then(
        (value) => {
          let parsedValue = JSON.parse(value);
          AsyncManager.instancesStash = parsedValue;
          return parsedValue;
        }
      );
    } else {
      return AsyncManager.instancesStash;
    }
  },

  setSymptom: async function(symptom) {
    let symptoms = AsyncManager.symptomsStash;
    let symptomExists = false;
    for(let i=0; i<symptoms.length; i++) {
      if(symptoms[i].id === symptom.id) {
        symptomExists = true;
        symptoms[i] = symptom;
      }
    }
    if(!symptomExists) {
      symptoms.push(symptom);
    }

    function compareSymptoms(s1, s2) {
      if(s1.name > s2.name) return 1;
      else if(s1.name < s2.name) return -1;
      else return 0;
    }
    symptoms.sort(compareSymptoms);

    return AsyncManager.setSymptoms(symptoms);
  },

  setSymptoms: async function(symptoms) {
    AsyncManager.symptomCounts.updateNum++;
    return AsyncStorage.setItem('Symptoms', JSON.stringify(symptoms));
  },

  pollUpdates: async function(screenName) {
    let symptoms = [];
    let instances = [];
    if (AsyncManager.symptomCounts.updateNum !== 0 && AsyncManager.symptomCounts.updateNum !== AsyncManager.symptomCounts[screenName]) {
      symptoms = await AsyncManager.getSymptoms();
      AsyncManager.symptomCounts[screenName] = AsyncManager.symptomCounts.updateNum;
    }
    if (AsyncManager.instanceCounts.updateNum !== 0 && AsyncManager.instanceCounts.updateNum !== AsyncManager.instanceCounts[screenName]) {
      instances = await AsyncManager.getInstances();
      AsyncManager.instanceCounts[screenName] = AsyncManager.instanceCounts.updateNum;
    }

    AsyncManager.symptomCounts[screenName] = AsyncManager.symptomCounts.updateNum;
    AsyncManager.instanceCounts[screenName] = AsyncManager.instanceCounts.updateNum;
    return { Symptoms: symptoms, Instances: instances };
  }
}

export default AsyncManager;