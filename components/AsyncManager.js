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
          return JSON.parse(JSON.stringify(parsedValue));
        }
      );
    } else {
      return JSON.parse(JSON.stringify(AsyncManager.symptomsStash));
    }
  },
  
  getInstances: function() {
    if(AsyncManager.instancesStash.length === 0) {
      return AsyncStorage.getItem('SymptomInstances').then(
        (value) => {
          let parsedValue = JSON.parse(value);
          AsyncManager.instancesStash = parsedValue;
          return JSON.parse(JSON.stringify(parsedValue));
        }
      );
    } else {
      return JSON.parse(JSON.stringify(AsyncManager.instancesStash));
    }
  },

  setSymptoms: async function(symptoms) {
    AsyncManager.symptomsStash = symptoms;
    AsyncManager.symptomCounts.updateNum++;
    return AsyncStorage.setItem('Symptoms', JSON.stringify(symptoms));
  },

  setSymptom: async function(symptom) {
    // leaving this code in, as it is a historic moment.
    // if (symptom.name === "Pissing and shitting") {
    //   let wasteid = _.uniqueId();
    //   symptom.id = 5;
    // }
    let symptoms = AsyncManager.getSymptoms();

    if (!symptom.id) {
      symptom.id = this.getNextId(symptoms);
    }

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

  deleteSymptom: async function(symptom) {
    let id = symptom.id;
    let symptoms = AsyncManager.getSymptoms();
    for (let i = 0; i < symptoms.length; i++) {
      let obj = symptoms[i];
  
      if (obj.id === id) {
        symptoms.splice(i, 1);
      }
    }

    let instances = AsyncManager.getInstances();
    for (let i = 0; i < instances.length; i++) {
      let instance = instances[i];
        if (instance.typeId === id) {
          instances.splice(i, 1);
          i--;
        }
    }
    await AsyncManager.setInstances(instances);

    return AsyncManager.setSymptoms(symptoms);
  },

  setInstances: async function(instances) {
    AsyncManager.instancesStash = instances;
    AsyncManager.instanceCounts.updateNum++;
    return AsyncStorage.setItem('SymptomInstances', JSON.stringify(instances));
  },

  setInstance: async function(instance) {
    let instances = AsyncManager.getInstances();

    if (!instance.id) {
      instance.id = AsyncManager.getNextId(instances);
    }

    let instanceExists = false;
    for(let i=0; i<instances.length; i++) {
      if(instances[i].id === instance.id) {
        instanceExists = true;
        instances[i] = instance;
      }
    }
    if(!instanceExists) {
      instances.push(instance);
    }
    return AsyncManager.setInstances(instances);
  },

  deleteInstance: async function(id) {
    let instances = AsyncManager.getInstances();
    for (var i = 0; i < instances.length; i++) {
      var obj = instances[i];
  
      if (obj.id === id) {
        instances.splice(i, 1);
      }
    }
    
    AsyncManager.setInstances(instances);
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
  },

  getNextId: function (arr) {
    let id = 0;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].id > id) {
        id = arr[i].id;
      }
    }
    return id+1;
  }
}

export default AsyncManager;