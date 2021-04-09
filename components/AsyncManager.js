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
  triggersStash: [],
  triggerInstancesStash: [],
  triggerCounts: {
    updateNum: 0
  },
  triggerInstanceCounts: {
    updateNum: 0
  },
  
  getSymptoms: function() {
    if(AsyncManager.symptomsStash.length === 0) {
      return AsyncStorage.getItem('Symptoms').then(
        (value) => {
          let parsedValue = JSON.parse(value);
          if (!Array.isArray(parsedValue)) {
            parsedValue = [];
          }
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
    let symptoms = await AsyncManager.getSymptoms();

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
  
  getSymptomInstances: async function() {
    if(AsyncManager.symptomInstancesStash.length === 0) {
      return AsyncStorage.getItem('SymptomInstances').then(
        (value) => {
          let parsedValue = JSON.parse(value);
          if (!Array.isArray(parsedValue)) {
            parsedValue = [];
          }
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
    let instances = await AsyncManager.getSymptomInstances();

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
    let instances = await AsyncManager.getSymptomInstances();
    for (var i = 0; i < instances.length; i++) {
      var obj = instances[i];
  
      if (obj.id === id) {
        instances.splice(i, 1);
      }
    }
    
    return AsyncManager.setSymptomInstances(instances);
  },

  getTreatments: function () {
    if(AsyncManager.treatmentsStash.length === 0) {
      return AsyncStorage.getItem('Treatments').then(
        (value) => {
          let parsedValue = JSON.parse(value);
          if (!Array.isArray(parsedValue)) {
            parsedValue = [];
          }
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
    let treatments = await AsyncManager.getTreatments();

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
  
  getTreatmentInstances: async function() {
    if(AsyncManager.treatmentInstancesStash.length === 0) {
      return AsyncStorage.getItem('TreatmentInstances').then(
        (value) => {
          let parsedValue = JSON.parse(value);
          if (!Array.isArray(parsedValue)) {
            parsedValue = [];
          }
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
    let instances = await AsyncManager.getTreatmentInstances();

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
    let instances = await AsyncManager.getTreatmentInstances();
    for (var i = 0; i < instances.length; i++) {
      var obj = instances[i];
  
      if (obj.id === id) {
        instances.splice(i, 1);
      }
    }
    
    return AsyncManager.setTreatmentInstances(instances);
  },
  
  getTriggers: function() {
    if(AsyncManager.triggersStash.length === 0) {
      return AsyncStorage.getItem('Triggers').then(
        (value) => {
          let parsedValue = JSON.parse(value);
          if (!Array.isArray(parsedValue)) {
            parsedValue = [];
          }
          AsyncManager.triggersStash = parsedValue;
          return JSON.parse(JSON.stringify(parsedValue));
        }
      );
    } else {
      return JSON.parse(JSON.stringify(AsyncManager.triggersStash));
    }
  },

  setTriggers: function(triggers) {
    AsyncManager.triggersStash = triggers;
    AsyncManager.triggerCounts.updateNum++;
    return AsyncStorage.setItem('Triggers', JSON.stringify(triggers));
  },

  setTrigger: async function(trigger) {
    let triggers = await AsyncManager.getTriggers();

    if (!trigger.id) {
      trigger.id = this.getNextId(triggers);
    }

    let triggerExists = false;
    for(let i=0; i<triggers.length; i++) {
      if(triggers[i].id === trigger.id) {
        triggerExists = true;
        triggers[i] = trigger;
      }
    }
    if(!triggerExists) {
      triggers.push(trigger);
    }

    function compareTriggers(s1, s2) {
      if(s1.name > s2.name) return 1;
      else if(s1.name < s2.name) return -1;
      else return 0;
    }
    triggers.sort(compareTriggers);

    return AsyncManager.setTriggers(triggers);
  },

  deleteTrigger: async function(trigger) {
    let id = trigger.id;
    let triggers = AsyncManager.getTriggers();
    for (let i = 0; i < triggers.length; i++) {
      let obj = triggers[i];
  
      if (obj.id === id) {
        triggers.splice(i, 1);
      }
    }

    let instances = AsyncManager.getTriggerInstances();
    for (let i = 0; i < instances.length; i++) {
      let instance = instances[i];
        if (instance.typeId === id) {
          instances.splice(i, 1);
          i--;
        }
    }
    await AsyncManager.setTriggerInstances(instances);

    return AsyncManager.setTriggers(triggers);
  },
  
  getTriggerInstances: async function() {
    if(AsyncManager.triggerInstancesStash.length === 0) {
      return AsyncStorage.getItem('TriggerInstances').then(
        (value) => {
          let parsedValue = JSON.parse(value);
          if (!Array.isArray(parsedValue)) {
            parsedValue = [];
          }
          AsyncManager.triggerInstancesStash = parsedValue;
          return JSON.parse(JSON.stringify(parsedValue));
        }
      );
    } else {
      return JSON.parse(JSON.stringify(AsyncManager.triggerInstancesStash));
    }
  },

  setTriggerInstances: async function(instances) {
    AsyncManager.triggerInstancesStash = instances;
    AsyncManager.triggerInstanceCounts.updateNum++;
    return AsyncStorage.setItem('TriggerInstances', JSON.stringify(instances));
  },

  setTriggerInstance: async function(instance) {
    let instances = await AsyncManager.getTriggerInstances();

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
    return AsyncManager.setTriggerInstances(instances);
  },

  deleteTriggerInstance: async function(id) {
    let instances = await AsyncManager.getTriggerInstances();
    for (var i = 0; i < instances.length; i++) {
      var obj = instances[i];
  
      if (obj.id === id) {
        instances.splice(i, 1);
      }
    }
    
    return AsyncManager.setTriggerInstances(instances);
  },

  pollUpdates: async function(screenName, objName) {
    if (objName === "symptoms") {
      let symptoms = false;
      let instances = false;
      if (AsyncManager.symptomCounts.updateNum !== (AsyncManager.symptomCounts[screenName] || 0)) {
        symptoms = await AsyncManager.getSymptoms();
        AsyncManager.symptomCounts[screenName] = AsyncManager.symptomCounts.updateNum;
      }
      if (AsyncManager.symptomInstanceCounts.updateNum !== (AsyncManager.symptomInstanceCounts[screenName] || 0)) {
        instances = await AsyncManager.getSymptomInstances();
        AsyncManager.symptomInstanceCounts[screenName] = AsyncManager.symptomInstanceCounts.updateNum;
      }

      AsyncManager.symptomCounts[screenName] = AsyncManager.symptomCounts.updateNum;
      AsyncManager.symptomInstanceCounts[screenName] = AsyncManager.symptomInstanceCounts.updateNum;
      return { Symptoms: symptoms, Instances: instances };
    } else if (objName === "treatments") {
      let treatments = false;
      let instances = false;
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
    } else if (objName === "triggers") {
      let triggers = false;
      let instances = false;
      if (AsyncManager.triggerCounts.updateNum !== 0 && AsyncManager.triggerCounts.updateNum !== AsyncManager.triggerCounts[screenName]) {
        triggers = await AsyncManager.getTriggers();
        AsyncManager.triggerCounts[screenName] = AsyncManager.triggerCounts.updateNum;
      }
      if (AsyncManager.triggerInstanceCounts.updateNum !== 0 && AsyncManager.triggerInstanceCounts.updateNum !== AsyncManager.triggerInstanceCounts[screenName]) {
        instances = await AsyncManager.getTriggerInstances();
        AsyncManager.triggerInstanceCounts[screenName] = AsyncManager.triggerInstanceCounts.updateNum;
      }

      AsyncManager.triggerCounts[screenName] = AsyncManager.triggerCounts.updateNum;
      AsyncManager.triggerInstanceCounts[screenName] = AsyncManager.triggerInstanceCounts.updateNum;
      return { Triggers: triggers, Instances: instances };
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