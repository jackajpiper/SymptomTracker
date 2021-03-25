import AsyncStorage from '@react-native-async-storage/async-storage';

const AsyncManager = {
  symptomsStash: [],
  symptomInstancesStash: [],
  symptomCounts: {
    updateNum: 0
  },
  symptomInstanceCounts: {
    updateNum: 0
  },
  treatmentsStash: [],
  treatmentInstancesStash: [],
  treatmentCounts: {
    updateNum: 0
  },
  treatmentInstanceCounts: {
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

  setSymptoms: function(symptoms) {
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

    let instances = AsyncManager.getSymptomInstances();
    for (let i = 0; i < instances.length; i++) {
      let instance = instances[i];
        if (instance.typeId === id) {
          instances.splice(i, 1);
          i--;
        }
    }
    await AsyncManager.setSymptomInstances(instances);

    return AsyncManager.setSymptoms(symptoms);
  },
  
  getSymptomInstances: function() {
    if(AsyncManager.symptomInstancesStash.length === 0) {
      return AsyncStorage.getItem('SymptomInstances').then(
        (value) => {
          let parsedValue = JSON.parse(value);
          AsyncManager.symptomInstancesStash = parsedValue;
          return JSON.parse(JSON.stringify(parsedValue));
        }
      );
    } else {
      return JSON.parse(JSON.stringify(AsyncManager.symptomInstancesStash));
    }
  },

  setSymptomInstances: async function(instances) {
    AsyncManager.symptomInstancesStash = instances;
    AsyncManager.symptomInstanceCounts.updateNum++;
    return AsyncStorage.setItem('SymptomInstances', JSON.stringify(instances));
  },

  setSymptomInstance: async function(instance) {
    let instances = AsyncManager.getSymptomInstances();

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
    return AsyncManager.setSymptomInstances(instances);
  },

  deleteSymptomInstance: async function(id) {
    let instances = AsyncManager.getSymptomInstances();
    for (var i = 0; i < instances.length; i++) {
      var obj = instances[i];
  
      if (obj.id === id) {
        instances.splice(i, 1);
      }
    }
    
    AsyncManager.setSymptomInstances(instances);
  },

  getTreatments: function () {
    if(AsyncManager.treatmentsStash.length === 0) {
      return AsyncStorage.getItem('Treatments').then(
        (value) => {
          let parsedValue = JSON.parse(value);
          AsyncManager.treatmentsStash = parsedValue;
          return JSON.parse(JSON.stringify(parsedValue));
        }
      );
    } else {
      return JSON.parse(JSON.stringify(AsyncManager.treatmentsStash));
    }
  },

  setTreatments: function(treatments) {
    AsyncManager.treatmentsStash = treatments;
    AsyncManager.treatmentCounts.updateNum++;
    return AsyncStorage.setItem('Treatments', JSON.stringify(treatments));
  },

  setTreatment: async function(treatment) {
    let treatments = AsyncManager.getTreatments();

    if (!treatment.id) {
      treatment.id = this.getNextId(treatments);
    }

    let treatmentExists = false;
    for(let i=0; i<treatments.length; i++) {
      if(treatments[i].id === treatment.id) {
        treatmentExists = true;
        treatments[i] = treatment;
      }
    }
    if(!treatmentExists) {
      treatments.push(treatment);
    }

    function compareTreatments(s1, s2) {
      if(s1.name > s2.name) return 1;
      else if(s1.name < s2.name) return -1;
      else return 0;
    }
    treatments.sort(compareTreatments);

    return AsyncManager.setTreatments(treatments);
  },

  deleteTreatment: async function(treatment) {
    let id = treatment.id;
    let treatments = AsyncManager.getTreatments();
    for (let i = 0; i < treatments.length; i++) {
      let obj = treatments[i];
  
      if (obj.id === id) {
        treatments.splice(i, 1);
      }
    }

    let instances = AsyncManager.getTreatmentInstances();
    for (let i = 0; i < instances.length; i++) {
      let instance = instances[i];
        if (instance.typeId === id) {
          instances.splice(i, 1);
          i--;
        }
    }
    await AsyncManager.setTreatmentInstances(instances);

    return AsyncManager.setTreatments(treatments);
  },
  
  getTreatmentInstances: function() {
    if(AsyncManager.treatmentInstancesStash.length === 0) {
      return AsyncStorage.getItem('TreatmentInstances').then(
        (value) => {
          let parsedValue = JSON.parse(value);
          AsyncManager.treatmentInstancesStash = parsedValue;
          return JSON.parse(JSON.stringify(parsedValue));
        }
      );
    } else {
      return JSON.parse(JSON.stringify(AsyncManager.treatmentInstancesStash));
    }
  },

  setTreatmentInstances: async function(instances) {
    AsyncManager.treatmentInstancesStash = instances;
    AsyncManager.treatmentInstanceCounts.updateNum++;
    return AsyncStorage.setItem('TreatmentInstances', JSON.stringify(instances));
  },

  setTreatmentInstance: async function(instance) {
    let instances = AsyncManager.getTreatmentInstances();

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
    return AsyncManager.setTreatmentInstances(instances);
  },

  deleteTreatmentInstance: async function(id) {
    let instances = AsyncManager.getTreatmentInstances();
    for (var i = 0; i < instances.length; i++) {
      var obj = instances[i];
  
      if (obj.id === id) {
        instances.splice(i, 1);
      }
    }
    
    AsyncManager.setTreatmentInstances(instances);
  },

  pollUpdates: async function(screenName, objName) {
    if (objName === "symptoms") {
      let symptoms = [];
      let instances = [];
      if (AsyncManager.symptomCounts.updateNum !== 0 && AsyncManager.symptomCounts.updateNum !== AsyncManager.symptomCounts[screenName]) {
        symptoms = await AsyncManager.getSymptoms();
        AsyncManager.symptomCounts[screenName] = AsyncManager.symptomCounts.updateNum;
      }
      if (AsyncManager.symptomInstanceCounts.updateNum !== 0 && AsyncManager.symptomInstanceCounts.updateNum !== AsyncManager.symptomInstanceCounts[screenName]) {
        instances = await AsyncManager.getSymptomInstances();
        AsyncManager.symptomInstanceCounts[screenName] = AsyncManager.symptomInstanceCounts.updateNum;
      }

      AsyncManager.symptomCounts[screenName] = AsyncManager.symptomCounts.updateNum;
      AsyncManager.symptomInstanceCounts[screenName] = AsyncManager.symptomInstanceCounts.updateNum;
      return { Symptoms: symptoms, Instances: instances };
    } else if (objName === "treatments") {
      let treatments = [];
      let instances = [];
      if (AsyncManager.treatmentCounts.updateNum !== 0 && AsyncManager.treatmentCounts.updateNum !== AsyncManager.treatmentCounts[screenName]) {
        treatments = await AsyncManager.getTreatments();
        AsyncManager.treatmentCounts[screenName] = AsyncManager.treatmentCounts.updateNum;
      }
      if (AsyncManager.treatmentInstanceCounts.updateNum !== 0 && AsyncManager.treatmentInstanceCounts.updateNum !== AsyncManager.treatmentInstanceCounts[screenName]) {
        instances = await AsyncManager.getTreatmentInstances();
        AsyncManager.treatmentInstanceCounts[screenName] = AsyncManager.treatmentInstanceCounts.updateNum;
      }

      AsyncManager.treatmentCounts[screenName] = AsyncManager.treatmentCounts.updateNum;
      AsyncManager.treatmentInstanceCounts[screenName] = AsyncManager.treatmentInstanceCounts.updateNum;
      return { Treatments: treatments, Instances: instances };
    }
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