const Symptoms = [
    { id: 1, name: 'Headache', colour: '#b87a7b' },
    { id: 2, name: 'Nosebleed', colour: '#7a80b8' },
    { id: 3, name: 'Lethargy', colour: '#7ab88a' },
    { id: 4, name: 'Wisdom', colour: '#b7b87a' }
  ];
  
const SymptomInstances = [
  { id: 1, typeId: 1, date: '2021-01-06', startTime: '11:40', endTime: '15:05', severity: 30, notes: 'note1' },
  { id: 2, typeId: 2, date: '2021-01-11', startTime: '19:00', endTime: '19:25', severity: 69, notes: 'note2' },
  { id: 3, typeId: 3, date: '2021-01-18', startTime: '01:30', endTime: '07:00', severity: 45, notes: 'note3' },
  { id: 4, typeId: 4, date: '2021-01-29', startTime: '12:40', endTime: '12:55', severity: 78, notes: 'note4' },
  { id: 5, typeId: 2, date: '2021-01-04', startTime: '21:00', endTime: '22:25', severity: 12, notes: 'note5' },
  { id: 6, typeId: 2, date: '2021-01-12', startTime: '14:30', endTime: '21:00', severity: 28, notes: 'note6' },
  { id: 7, typeId: 4, date: '2021-01-02', startTime: '11:40', endTime: '15:05', severity: 30, notes: 'note7' },
  { id: 8, typeId: 3, date: '2021-01-21', startTime: '19:00', endTime: '19:25', severity: 69, notes: 'note8' },
  { id: 9, typeId: 3, date: '2021-01-26', startTime: '01:30', endTime: '07:00', severity: 45, notes: 'note9' },
  { id: 10, typeId: 1, date: '2021-01-09', startTime: '12:40', endTime: '12:55', severity: 78, notes: 'note10' },
  { id: 11, typeId: 1, date: '2021-01-19', startTime: '21:00', endTime: '22:25', severity: 12, notes: 'note11' },
  { id: 12, typeId: 3, date: '2021-01-01', startTime: '14:30', endTime: '23:00', severity: 28, notes: 'note12' },
  { id: 13, typeId: 1, date: '2021-02-06', startTime: '11:40', endTime: '15:05', severity: 30, notes: 'note13' },
  { id: 14, typeId: 2, date: '2021-02-11', startTime: '19:00', endTime: '19:25', severity: 69, notes: 'note14' },
  { id: 15, typeId: 4, date: '2021-02-18', startTime: '01:30', endTime: '07:00', severity: 45, notes: 'note15' },
  { id: 17, typeId: 2, date: '2021-02-04', startTime: '21:00', endTime: '22:25', severity: 12, notes: 'note16' },
  { id: 18, typeId: 4, date: '2021-02-12', startTime: '14:30', endTime: '22:00', severity: 28, notes: 'note17' },
  { id: 16, typeId: 1, date: '2021-03-01', startTime: '12:40', endTime: '12:55', severity: 78, notes: 'note18' }
]

const Treatments = [
  { id: 1, name: "Ibuprofen", colour: "#b87aa8", unitTypeId: 1, unit: "Pills"},
  { id: 1, name: "Meditation", colour: "#b5b87a", unit: "Grams"},
  { id: 1, name: "Sleep", colour: "#7a7bb8", unitTypeId: 2, unit: "Quality"},
  { id: 1, name: "Hugs", colour: "#b88e7a", unit: "Hugs"}
]
d
const TreatmentInstances = [
  { id: 1, typeId: 1, date: '2021-02-18', startTime: '02:30', endTime: '07:00', notes: 'note1' },
  { id: 2, typeId: 2, date: '2021-02-11', startTime: '22:00', endTime: '22:25', notes: 'note2' },
  { id: 3, typeId: 3, date: '2021-02-12', startTime: '16:30', endTime: '22:00', notes: 'note3' },
  { id: 4, typeId: 1, date: '2021-03-01', startTime: '10:40', endTime: '12:55', notes: 'note4' }
]

const Triggers = [
  { id: 1, name: "Cheese", colour: "#b4b87a"},
  { id: 1, name: "Stress", colour: "#7a83b8"},
  { id: 1, name: "Sunburn", colour: "#b87a7e"}
]

const TriggerInstances = [
  { id: 1, typeId: 4, date: '2021-02-18', startTime: '00:30', endTime: '01:00', notes: 'note1' },
  { id: 2, typeId: 2, date: '2021-02-25', startTime: '01:00', endTime: '01:25', notes: 'note2' },
  { id: 3, typeId: 3, date: '2021-02-28', startTime: '12:30', endTime: '23:00', notes: 'note3' },
  { id: 4, typeId: 1, date: '2021-03-01', startTime: '14:10', endTime: '14:20', notes: 'note4' }
]

const DiaryData = [
  { id: 1, date: "2021-03-12", text: "I had big shit in my trousers" },
  { id: 2, date: "2021-03-13", text: "I had big shit in my trousers again" },
  { id: 3, date: "2021-03-15", text: "I keep getting these absurdly huge shits inside my trousers" },
  { id: 4, date: "2021-03-16", text: "It happened again." },
  { id: 5, date: "2021-03-19", text: "I don't understand how it keeps happening.\n\n\n\n\n\n\nIt's like a bomb went off down there." },
  { id: 6, date: "2021-03-21", text: "If only I could figure out...\n\n\n\n\n\nWhy I keep finding insane poo volumes in my downstairs clothing" },
  { id: 7, date: "2021-03-22", text: "I\ndon't\nwant\nto\nkeep\nshitting\nmyself" },
  { id: 8, date: "2021-03-23", text: "It was warm today." }
]

// TODO
//  -- sort out calendar ordering, render data by month etc
//  -- stop constantly lightening the colours and just save them in the lightened state
//    -- currently uses saturation of 30 and lightness of 60
//    -- used in Edit(Symptom/Trigger/Treatment)Screen
//    -- also used when calculating average colour for the heat graph
//  -- make severity an optional attribute for symptoms
//    -- maybe expand the system to allow custom severity/dose tracking
//  -- make the title on the homepage more stylish
//  -- implement dark mode
//    -- follow that up by implementing themes
//  -- make a onboarding thing for new users
//  -- implement settings
//  -- implement the diary?

// ANALYSIS TAB
//  -- track one item against another to look for correlation
//    -- find some kind of calculated correlation score
//  -- select one symptom and be presented with statistically likely triggers

// EDGE CASES
//  -- symptom/trigger/treatment name being super long

// Settings
//  -- themes
//    -- light mode/dark mode
//    -- 


//  -- EXTESION IDEAS
//    -- Have a unit type and unit for each treatment
//      -- unit type "continuous" means a simple number field e.g num of pills taken
//      -- unit type "discrete" means a custom list of options, saved and presented as a dropdown
//      -- when the user saves an instance, they specify the dose using the unit provided as a label
//        -- to do so they would either enter a number or pick from a dropdown